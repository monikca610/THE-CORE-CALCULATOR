import { ClassSection } from '../data/timetableData';
import {
  calculateCurrentAttendance,
  calculateRequiredRecoveryClasses,
  calculateMaxAchievableAttendance,
  calculateSafelyMissableClasses,
  calculateSubjectAttendance,
  SubjectCalculationResult,
  OverallSemesterCalculation,
} from './attendanceEngine';
import {
  simulateLeave,
  LeaveSimulationRequest,
  LeaveSimulationResult,
  ODPolicy,
  MLPolicy,
} from './leaveSimulator';

export interface AdvisorContext {
  section: ClassSection;
  overall: OverallSemesterCalculation;
  currentDate: string;
  startDate: string;
  endDate: string;
  checkpointDate: string;
  targetPercentage: number;
  odPolicy: ODPolicy;
  mlPolicy: MLPolicy;
  activeSimulation: LeaveSimulationResult | null;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  mode: 'ai' | 'local';
  dataPayload?: {
    subjectCode?: string;
    classesAffected?: number;
    beforePct?: number;
    afterPct?: number;
    recoveryRequired?: number;
    isRecoverable?: boolean;
    recommendation?: string;
  };
}

/**
 * Reusable Calculation Functions requested by Prompt
 */
export function calculateAttendance(attended: number, conducted: number): number {
  return calculateCurrentAttendance(attended, conducted);
}

export function calculateRemainingClasses(subjectCode: string, context: AdvisorContext): number {
  const sub = context.overall.subjectResults.find(
    (s) => s.subjectCode.toLowerCase() === subjectCode.toLowerCase()
  );
  return sub ? sub.remainingClasses : context.overall.totalRemaining;
}

export function calculateRequiredClasses(
  conducted: number,
  attended: number,
  targetPercentage: number
): number {
  return calculateRequiredRecoveryClasses(conducted, attended, targetPercentage);
}

export function calculateMaximumAchievable(
  attended: number,
  conducted: number,
  remaining: number
): number {
  return calculateMaxAchievableAttendance(attended, conducted, remaining);
}

export function getRecoveryStatus(
  attended: number,
  conducted: number,
  remaining: number,
  targetPercentage: number
): { status: 'possible' | 'impossible' | 'achieved'; required: number; maxAchievable: number } {
  const currentPct = calculateAttendance(attended, conducted);
  const maxAch = calculateMaximumAchievable(attended, conducted, remaining);
  const req = calculateRequiredClasses(conducted, attended, targetPercentage);

  if (currentPct >= targetPercentage) {
    return { status: 'achieved', required: 0, maxAchievable: maxAch };
  }
  if (maxAch < targetPercentage || req > remaining) {
    return { status: 'impossible', required: req, maxAchievable: maxAch };
  }
  return { status: 'possible', required: req, maxAchievable: maxAch };
}

/**
 * Match subject name or code from natural text query against section subjects
 */
export function resolveSubjectFromText(
  query: string,
  section: ClassSection
): typeof section.subjects[0] | null {
  const lower = query.toLowerCase();

  for (const sub of section.subjects) {
    if (lower.includes(sub.code.toLowerCase())) return sub;
    const nameWords = sub.name.toLowerCase().split(/\s+/);
    for (const w of nameWords) {
      if (w.length > 3 && lower.includes(w)) {
        return sub;
      }
    }
  }

  // Common aliases
  if (lower.includes('chem') || lower.includes('chemistry')) {
    return section.subjects.find((s) => s.name.toLowerCase().includes('chemistry')) || null;
  }
  if (lower.includes('math') || lower.includes('calculus') || lower.includes('discrete')) {
    return section.subjects.find((s) => s.name.toLowerCase().includes('math') || s.name.toLowerCase().includes('calculus')) || null;
  }
  if (lower.includes('physics') || lower.includes('phy')) {
    return section.subjects.find((s) => s.name.toLowerCase().includes('physics')) || null;
  }
  if (lower.includes('vlsi')) {
    return section.subjects.find((s) => s.name.toLowerCase().includes('vlsi')) || null;
  }
  if (lower.includes('bio') || lower.includes('biology') || lower.includes('biomedical')) {
    return section.subjects.find((s) => s.name.toLowerCase().includes('bio')) || null;
  }

  return null;
}

/**
 * Deterministic Local Rule-Based Engine
 * Handles user questions with 100% deterministic accuracy when AI API is unavailable.
 */
export function processLocalAdvisorQuery(query: string, context: AdvisorContext): string {
  const lower = query.toLowerCase();
  const target = context.targetPercentage;
  const overall = context.overall;

  // 1. "Which subject is currently in the danger zone?" or "danger zone" / "critical"
  if (lower.includes('danger') || lower.includes('critical') || lower.includes('fail') || lower.includes('detention')) {
    const criticals = overall.subjectResults.filter((s) => s.zone === 'critical');
    const cautions = overall.subjectResults.filter((s) => s.zone === 'caution');

    if (criticals.length === 0 && cautions.length === 0) {
      return `Good news! None of your courses in ${context.section.name} are currently in the danger zone. All ${overall.subjectResults.length} subjects meet or exceed your ${target}% target. Your safe miss buffer is ${overall.safelyMissableFromRemaining} upcoming classes.`;
    }

    let response = `⚠️ **Attendance Danger Analysis for ${context.section.name}:**\n\n`;
    if (criticals.length > 0) {
      response += `🚨 **Critical (Irreversible Detention Risk):**\n`;
      criticals.forEach((c) => {
        response += `• **${c.subjectName}** (${c.subjectCode}): Current attendance is **${c.currentPercentage.toFixed(1)}%**. Max achievable is **${c.maxAchievablePercentage.toFixed(1)}%**, below your ${target}% target! Even 100% future attendance cannot achieve ${target}%. Seek formal academic advisor / HOD review immediately.\n`;
      });
      response += `\n`;
    }

    if (cautions.length > 0) {
      response += `⚠️ **Caution Zone (Requires Recovery):**\n`;
      cautions.forEach((c) => {
        response += `• **${c.subjectName}** (${c.subjectCode}): Current attendance is **${c.currentPercentage.toFixed(1)}%**. You need to attend **${c.requiredRecoveryClasses} consecutive classes** to restore your ${target}% standing.\n`;
      });
    }

    return response;
  }

  // 2. "How many classes can I miss and still maintain 75% (or target)?"
  if (lower.includes('can i miss') || lower.includes('safely miss') || lower.includes('bunk') || lower.includes('skip')) {
    const sub = resolveSubjectFromText(query, context.section);
    if (sub) {
      const res = overall.subjectResults.find((s) => s.subjectCode === sub.code);
      if (!res) return `Unable to find attendance records for ${sub.name}.`;

      if (res.safelyMissableFromRemaining > 0) {
        return `For **${sub.name}** (${sub.code}):\n• Current Attendance: **${res.currentPercentage.toFixed(1)}%** (${res.attendedClasses}/${res.conductedClasses})\n• Target Threshold: **${target}%**\n• Scheduled Remaining Classes: **${res.remainingClasses}**\n• **Safe Bunk Margin:** You can safely miss up to **${res.safelyMissableFromRemaining} classes** out of the remaining ${res.remainingClasses} and still finish the semester at or above ${target}%.`;
      } else {
        return `For **${sub.name}** (${sub.code}):\n• Current Attendance: **${res.currentPercentage.toFixed(1)}%**\n• Target Threshold: **${target}%**\n• ⚠️ **Safe Bunk Margin: 0 classes.** You are currently below target. You cannot afford to miss any classes and must attend the next **${res.requiredRecoveryClasses} consecutive classes** to recover.`;
      }
    }

    return `Across your entire semester in **${context.section.name}**:\n• Overall Current Attendance: **${overall.currentPercentage.toFixed(1)}%** (${overall.totalAttended}/${overall.totalConducted} classes)\n• Target Benchmark: **${target}%**\n• Total Upcoming Classes: **${overall.totalRemaining}**\n• **Aggregate Safe Misses Remaining:** You can safely miss **${overall.safelyMissableFromRemaining} classes** across all courses without breaching your ${target}% target.\n• **Instant Consecutive Skip Margin:** You can afford **${overall.instantSkipMargin} consecutive absences** right now before overall attendance drops below ${target}%.`;
  }

  // 3. "How many classes must I attend to reach 90% (or specific target)?"
  if (lower.includes('reach 90') || lower.includes('reach 85') || lower.includes('reach 80') || lower.includes('reach 75') || lower.includes('classes must i attend')) {
    let queryTarget = target;
    if (lower.includes('90')) queryTarget = 90;
    else if (lower.includes('85')) queryTarget = 85;
    else if (lower.includes('80')) queryTarget = 80;
    else if (lower.includes('75')) queryTarget = 75;

    const sub = resolveSubjectFromText(query, context.section);
    if (sub) {
      const input = overall.subjectResults.find((s) => s.subjectCode === sub.code);
      if (!input) return `Course ${sub.name} not found.`;

      const req = calculateRequiredClasses(input.conductedClasses, input.attendedClasses, queryTarget);
      const maxAch = calculateMaximumAchievable(input.attendedClasses, input.conductedClasses, input.remainingClasses);

      if (maxAch < queryTarget) {
        return `For **${sub.name}** (${sub.code}):\n• Current Attendance: **${input.currentPercentage.toFixed(1)}%**\n• Remaining Classes: **${input.remainingClasses}**\n• 🚨 Reaching **${queryTarget}%** is **mathematically impossible**. Even with 100% future attendance, the maximum achievable attendance is **${maxAch.toFixed(1)}%**.`;
      }

      return `For **${sub.name}** (${sub.code}) to reach **${queryTarget}%**:\n• Current Attendance: **${input.currentPercentage.toFixed(1)}%** (${input.attendedClasses}/${input.conductedClasses})\n• Required Consecutive Attended Classes: **${req} classes**.\n• Maximum Achievable: **${maxAch.toFixed(1)}%** (with ${input.remainingClasses} remaining classes).`;
    }

    const reqOverall = calculateRequiredClasses(overall.totalConducted, overall.totalAttended, queryTarget);
    return `To elevate your overall semester attendance to **${queryTarget}%**:\n• Current Overall: **${overall.currentPercentage.toFixed(1)}%** (${overall.totalAttended}/${overall.totalConducted})\n• Consecutive Future Classes Required: **${reqOverall} classes**.\n• Maximum Achievable by Semester End: **${overall.maxAchievablePercentage.toFixed(1)}%**.`;
  }

  // 4. "Can I take 3 days of medical leave?" / Leave questions
  if (lower.includes('medical leave') || lower.includes('leave') || lower.includes('on duty') || lower.includes('od')) {
    const isML = lower.includes('medical');
    const isOD = lower.includes('od') || lower.includes('on duty');
    const daysMatch = lower.match(/(\d+)\s*(?:day|days)/);
    const leaveDurationDays = daysMatch ? parseInt(daysMatch[1]) : 3;

    // Simulate starting tomorrow
    const curDate = new Date(context.currentDate);
    curDate.setDate(curDate.getDate() + 1);
    const startStr = curDate.toISOString().split('T')[0];

    const endDateObj = new Date(curDate);
    endDateObj.setDate(endDateObj.getDate() + (leaveDurationDays - 1));
    const endStr = endDateObj.toISOString().split('T')[0];

    const sub = resolveSubjectFromText(query, context.section);

    const simReq: LeaveSimulationRequest = {
      name: `${leaveDurationDays}-Day ${isML ? 'Medical Leave' : isOD ? 'On-Duty' : 'Absence'} Simulation`,
      leaveType: isML ? 'medical_leave' : isOD ? 'on_duty' : 'ordinary_absence',
      startDate: startStr,
      endDate: endStr,
      targetSubjectCode: sub ? sub.code : 'all',
      reason: isML ? 'Medical Condition' : isOD ? 'Academic Conference' : 'Personal',
      odPolicy: context.odPolicy,
      mlPolicy: context.mlPolicy,
      maxODSessionsAllowed: 12,
    };

    const inputsMap: Record<string, { conductedClasses: number; attendedClasses: number }> = {};
    context.overall.subjectResults.forEach((s) => {
      inputsMap[s.subjectCode] = { conductedClasses: s.conductedClasses, attendedClasses: s.attendedClasses };
    });
    const remMap: Record<string, number> = {};
    context.overall.subjectResults.forEach((s) => {
      remMap[s.subjectCode] = s.remainingClasses;
    });

    const result = simulateLeave(context.section, simReq, inputsMap, remMap, target);

    if (sub) {
      const imp = result.subjectImpacts.find((s) => s.subjectCode === sub.code);
      if (imp) {
        return `📋 **Simulation for ${sub.name} (${leaveDurationDays}-Day ${isML ? 'Medical Leave' : 'Leave'}):**\n• Scheduled classes affected during ${startStr} to ${endStr}: **${imp.classesAffected} classes**\n• Current Attendance: **${imp.currentPercentage.toFixed(1)}%**\n• Projected Attendance After Leave: **${imp.simulatedPercentage.toFixed(1)}%** (${imp.percentageDelta >= 0 ? '+' : ''}${imp.percentageDelta.toFixed(1)}%)\n• Target Threshold: **${target}%**\n• Recovery Status: **${imp.isIrreversible ? '🚨 NOT RECOVERABLE' : '✅ RECOVERABLE'}**\n• Required Future Classes to Recover: **${imp.requiredRecoveryClasses} classes**.\n• Policy Applied: *${result.policyAppliedDescription}*`;
      }
    }

    return `📋 **${leaveDurationDays}-Day ${isML ? 'Medical Leave' : isOD ? 'On-Duty' : 'Absence'} Impact Simulation:**\n• Duration: **${startStr}** to **${endStr}**\n• Total Timetable Classes Scheduled: **${result.totalClassesAffected} sessions** across section ${context.section.name}\n• Current Overall Attendance: **${result.overallBeforePercentage.toFixed(1)}%**\n• Projected Attendance After Leave: **${result.overallAfterPercentage.toFixed(1)}%** (${result.overallDelta >= 0 ? '+' : ''}${result.overallDelta.toFixed(1)}%)\n• Semester-End Maximum Potential: **${result.overallProjectedEndPercentage.toFixed(1)}%**\n• Status: **${result.isOverallIrreversible ? '🚨 CRITICAL (DETENTION RISK)' : result.overallAfterPercentage < target ? '⚠️ CAUTION ZONE' : '✅ SAFE ZONE'}**\n• Institutional Policy: *${result.policyAppliedDescription}*\n\nTip: You can formally apply and save this scenario in the **Leave Simulator** tab.`;
  }

  // 5. "Can I recover my attendance before November?" / Checkpoint queries
  if (lower.includes('november') || lower.includes('checkpoint') || lower.includes('recover before')) {
    const isPossible = overall.maxAchievablePercentage >= target;
    return `📅 **Checkpoint Status for ${context.section.name} (Deadline: ${context.checkpointDate}):**\n• Current Overall Standing: **${overall.currentPercentage.toFixed(1)}%**\n• Target: **${target}%**\n• Remaining Classes: **${overall.totalRemaining} classes**\n• Maximum Achievable: **${overall.maxAchievablePercentage.toFixed(1)}%**\n• Recovery Assessment: **${isPossible ? '✅ MATHEMATICALLY POSSIBLE' : '🚨 IMPOSSIBLE (DETENTION RISK)'}**\n${
      isPossible
        ? `You need to attend at least **${overall.requiredRecoveryClasses} consecutive classes** prior to ${context.checkpointDate} to ensure compliance.`
        : `Even 100% perfect attendance cannot reach ${target}% before the deadline.`
    }`;
  }

  // 6. Specific subject inquiry
  const matchedSub = resolveSubjectFromText(query, context.section);
  if (matchedSub) {
    const res = overall.subjectResults.find((s) => s.subjectCode === matchedSub.code);
    if (res) {
      return `📊 **Status for ${matchedSub.name} (${matchedSub.code} - Slot ${matchedSub.slot}):**\n• Faculty: **${matchedSub.faculty}**\n• Current Attendance: **${res.currentPercentage.toFixed(1)}%** (${res.attendedClasses}/${res.conductedClasses} attended)\n• Remaining Timetable Classes: **${res.remainingClasses}**\n• Target Threshold: **${target}%** (Status: **${res.zone.toUpperCase()}**)\n• Recovery Required: **${res.requiredRecoveryClasses > 0 ? `${res.requiredRecoveryClasses} classes` : 'Target Met'}**\n• Safe Miss Buffer: **${res.safelyMissableFromRemaining} classes**\n• Max Achievable: **${res.maxAchievablePercentage.toFixed(1)}%**.`;
    }
  }

  // Fallback general guidance
  return `I am your **Attendance Advisor** for **${context.section.name}**.\n\n• Current Overall Attendance: **${overall.currentPercentage.toFixed(1)}%** (${overall.totalAttended}/${overall.totalConducted} classes)\n• Target Benchmark: **${target}%**\n• Safe Bunk Margin: **${overall.safelyMissableFromRemaining} upcoming classes**\n• Critical Courses: **${overall.criticalSubjectsCount}**\n\nYou can ask me specific questions like:\n1. *"Can I take 3 days of medical leave starting tomorrow?"*\n2. *"Will my Chemistry attendance fall below 75%?"*\n3. *"How many classes can I safely miss and maintain 75%?"*\n4. *"Which subject is currently in the danger zone?"*`;
}

/**
 * Builds the structured system prompt for Server-Side Gemini 3.8 Flash model
 */
export function buildAdvisorSystemPrompt(context: AdvisorContext): string {
  const subjectsSummary = context.overall.subjectResults
    .map(
      (s) =>
        `- ${s.subjectName} (${s.subjectCode}, Slot ${s.slot}): Attended ${s.attendedClasses}/${s.conductedClasses} (${s.currentPercentage}%), Remaining: ${s.remainingClasses}, Max Achievable: ${s.maxAchievablePercentage}%, Recovery Required for ${context.targetPercentage}%: ${s.requiredRecoveryClasses}, Safe Misses: ${s.safelyMissableFromRemaining}, Zone: ${s.zone}`
    )
    .join('\n');

  return `You are ATTENDANCE ADVISOR, the intelligent academic advisor for THE CORE CALCULATOR at SRM Institute of Science and Technology (Tiruchirappalli Campus).
Your tagline is: "Ask before you miss a class."

CURRENT STUDENT CONTEXT (SOURCE OF TRUTH - NEVER INVENT DATA):
- Class Section: ${context.section.name} (${context.section.program}, ${context.section.semester})
- Venue: ${context.section.venue}
- Semester Timeline: ${context.startDate} to ${context.endDate}
- Today / Simulation Date: ${context.currentDate}
- Final Checkpoint Date: ${context.checkpointDate}
- Attendance Target: ${context.targetPercentage}%
- Overall Attendance: ${context.overall.currentPercentage}% (${context.overall.totalAttended} attended / ${context.overall.totalConducted} conducted)
- Total Remaining Classes: ${context.overall.totalRemaining}
- Overall Max Achievable Attendance: ${context.overall.maxAchievablePercentage}%
- Overall Required Recovery Classes: ${context.overall.requiredRecoveryClasses}
- Overall Safe Misses Remaining: ${context.overall.safelyMissableFromRemaining}
- Instant Skip Margin: ${context.overall.instantSkipMargin} classes
- Critical Detention Count: ${context.overall.criticalSubjectsCount}
- Caution Count: ${context.overall.cautionSubjectsCount}
- Configured OD Policy: ${context.odPolicy}
- Configured Medical Leave Policy: ${context.mlPolicy}

COURSE-BY-COURSE TELEMETRY:
${subjectsSummary}

STRICT OPERATING PRINCIPLES:
1. Always ground your calculations in the actual numbers provided above. Never hallucinate attendance values or assume arbitrary class counts.
2. When answering leave questions (e.g. "Can I take 3 days of medical leave?"), emphasize the exact affected timetable classes, before/after percentages, recovery required, and institutional policy applied.
3. Be direct, authoritative, supportive, and precise like a senior academic dean or mission flight director.
4. Keep answers formatted with clean bullet points and clear bold headings.`;
}
