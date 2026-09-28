import { ClassSection, ACADEMIC_EVENTS_2026 } from '../data/timetableData';
import {
  calculateCurrentAttendance,
  calculateRequiredRecoveryClasses,
  calculateMaxAchievableAttendance,
  calculateSafelyMissableClasses,
  AttendanceZone,
  ScheduledClassOccurrence,
} from './attendanceEngine';

export type LeaveType = 'on_duty' | 'medical_leave' | 'ordinary_absence';

export type ODPolicy = 'counts_attended' | 'not_attended' | 'exempted';
export type MLPolicy = 'ordinary_absence' | 'approved_credit' | 'exempted';

export interface LeaveSimulationRequest {
  id?: string;
  name: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  targetSubjectCode?: string; // 'all' or specific subject code
  reason: string;
  odPolicy: ODPolicy;
  mlPolicy: MLPolicy;
  maxODSessionsAllowed?: number; // e.g. 12
}

export interface AffectedClassSession {
  occurrenceId: string;
  date: string;
  dayOfWeek: string;
  period: number;
  time: string;
  subjectCode: string;
  subjectName: string;
  room?: string;
  faculty: string;
  countsAsAttended: boolean;
}

export interface SubjectLeaveImpact {
  subjectCode: string;
  subjectName: string;
  slot: string;
  color: string;
  classesAffected: number;
  currentAttended: number;
  currentConducted: number;
  currentPercentage: number;
  simulatedAttended: number;
  simulatedConducted: number;
  simulatedPercentage: number;
  percentageDelta: number; // e.g. -3.5%
  remainingAfterLeave: number;
  projectedSemesterEndPercentage: number;
  requiredRecoveryClasses: number;
  isDangerZone: boolean;
  isIrreversible: boolean;
}

export interface LeaveSimulationResult {
  request: LeaveSimulationRequest;
  totalClassesAffected: number;
  affectedSessions: AffectedClassSession[];
  subjectImpacts: SubjectLeaveImpact[];
  overallBeforePercentage: number;
  overallAfterPercentage: number;
  overallDelta: number;
  overallProjectedEndPercentage: number;
  overallRequiredRecovery: number;
  isOverallDangerZone: boolean;
  isOverallIrreversible: boolean;
  policyAppliedDescription: string;
  odSessionsApproved: number;
  odSessionsCapped: number;
}

/**
 * Finds all actual scheduled class sessions from the timetable between startDate and endDate.
 * Skips weekends and academic holidays.
 */
export function getScheduledClassesInDateRange(
  section: ClassSection,
  startDateStr: string,
  endDateStr: string,
  targetSubjectCode: string = 'all'
): AffectedClassSession[] {
  const sessions: AffectedClassSession[] = [];
  const holidayMap = new Map<string, string>();
  ACADEMIC_EVENTS_2026.forEach((ev) => {
    if (ev.isHoliday) holidayMap.set(ev.date, ev.title);
  });

  const subjectMap = new Map(section.subjects.map((s) => [s.code, s]));

  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T23:59:59');

  if (start > end) return sessions;

  const cur = new Date(start);
  const dayNames: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'> = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];

  while (cur <= end) {
    const dayOfWeekIdx = cur.getDay(); // 0 is Sun, 6 is Sat
    const yyyy = cur.getFullYear();
    const mm = String(cur.getMonth() + 1).padStart(2, '0');
    const dd = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    if (dayOfWeekIdx >= 1 && dayOfWeekIdx <= 5 && !holidayMap.has(dateStr)) {
      const dayName = dayNames[dayOfWeekIdx - 1];
      const schedule = section.schedule[dayName] || [];

      for (const slot of schedule) {
        if (!slot.subjectCode) continue;
        if (targetSubjectCode !== 'all' && slot.subjectCode !== targetSubjectCode) continue;

        const subInfo = subjectMap.get(slot.subjectCode);
        sessions.push({
          occurrenceId: `${dateStr}_P${slot.period}_${slot.subjectCode}`,
          date: dateStr,
          dayOfWeek: dayName,
          period: slot.period,
          time: slot.time,
          subjectCode: slot.subjectCode,
          subjectName: subInfo?.name || slot.subjectCode,
          room: slot.room || section.venue,
          faculty: subInfo?.faculty || 'Department Faculty',
          countsAsAttended: false,
        });
      }
    }

    cur.setDate(cur.getDate() + 1);
  }

  return sessions;
}

/**
 * Simulates the exact attendance impact of an OD, Medical Leave, or Ordinary Absence.
 */
export function simulateLeave(
  section: ClassSection,
  request: LeaveSimulationRequest,
  currentInputs: Record<string, { conductedClasses: number; attendedClasses: number }>,
  remainingPerSubject: Record<string, number>,
  targetPercentage: number
): LeaveSimulationResult {
  const affected = getScheduledClassesInDateRange(
    section,
    request.startDate,
    request.endDate,
    request.targetSubjectCode || 'all'
  );

  let odSessionsApproved = 0;
  let odSessionsCapped = 0;
  const maxOD = request.maxODSessionsAllowed ?? 12;

  // Mark whether each affected class counts as attended based on policy
  affected.forEach((sess) => {
    if (request.leaveType === 'on_duty') {
      if (request.odPolicy === 'counts_attended') {
        if (odSessionsApproved < maxOD) {
          sess.countsAsAttended = true;
          odSessionsApproved++;
        } else {
          sess.countsAsAttended = false;
          odSessionsCapped++;
        }
      } else {
        sess.countsAsAttended = false;
      }
    } else if (request.leaveType === 'medical_leave') {
      if (request.mlPolicy === 'approved_credit') {
        sess.countsAsAttended = true;
      } else {
        sess.countsAsAttended = false;
      }
    } else {
      // Ordinary absence
      sess.countsAsAttended = false;
    }
  });

  // Count affected per subject
  const affectedBySubject: Record<string, { total: number; attended: number }> = {};
  section.subjects.forEach((s) => {
    affectedBySubject[s.code] = { total: 0, attended: 0 };
  });

  affected.forEach((sess) => {
    if (!affectedBySubject[sess.subjectCode]) {
      affectedBySubject[sess.subjectCode] = { total: 0, attended: 0 };
    }
    affectedBySubject[sess.subjectCode].total += 1;
    if (sess.countsAsAttended) {
      affectedBySubject[sess.subjectCode].attended += 1;
    }
  });

  let totalBeforeAttended = 0;
  let totalBeforeConducted = 0;
  let totalSimAttended = 0;
  let totalSimConducted = 0;
  let totalFutureRemaining = 0;

  const subjectImpacts: SubjectLeaveImpact[] = section.subjects.map((sub) => {
    const input = currentInputs[sub.code] || { conductedClasses: 20, attendedClasses: 16 };
    const curCond = input.conductedClasses;
    const curAtt = input.attendedClasses;
    const curPct = calculateCurrentAttendance(curAtt, curCond);

    const aff = affectedBySubject[sub.code] || { total: 0, attended: 0 };

    // When leave occurs in future/today:
    // It will be conducted (+aff.total)
    // and attended (+aff.attended)
    let simCond = curCond + aff.total;
    let simAtt = curAtt + aff.attended;

    // If exempted policy applies:
    if (
      (request.leaveType === 'on_duty' && request.odPolicy === 'exempted') ||
      (request.leaveType === 'medical_leave' && request.mlPolicy === 'exempted')
    ) {
      // Excluded from conducted count
      simCond = curCond;
      simAtt = curAtt;
    }

    const simPct = calculateCurrentAttendance(simAtt, simCond);
    const delta = simPct - curPct;

    const baseRemaining = remainingPerSubject[sub.code] ?? 15;
    const remainingAfter = Math.max(0, baseRemaining - aff.total);

    const projectedEnd = calculateMaxAchievableAttendance(simAtt, simCond, remainingAfter);
    const reqRecovery = calculateRequiredRecoveryClasses(simCond, simAtt, targetPercentage);

    const isIrreversible = projectedEnd < targetPercentage;
    const isDangerZone = isIrreversible || simPct < targetPercentage;

    totalBeforeAttended += curAtt;
    totalBeforeConducted += curCond;
    totalSimAttended += simAtt;
    totalSimConducted += simCond;
    totalFutureRemaining += remainingAfter;

    return {
      subjectCode: sub.code,
      subjectName: sub.name,
      slot: sub.slot,
      color: sub.color,
      classesAffected: aff.total,
      currentAttended: curAtt,
      currentConducted: curCond,
      currentPercentage: Number(curPct.toFixed(2)),
      simulatedAttended: simAtt,
      simulatedConducted: simCond,
      simulatedPercentage: Number(simPct.toFixed(2)),
      percentageDelta: Number(delta.toFixed(2)),
      remainingAfterLeave: remainingAfter,
      projectedSemesterEndPercentage: Number(projectedEnd.toFixed(2)),
      requiredRecoveryClasses: reqRecovery === Infinity ? 999 : reqRecovery,
      isDangerZone,
      isIrreversible,
    };
  });

  const overallBeforePercentage = calculateCurrentAttendance(totalBeforeAttended, totalBeforeConducted);
  const overallAfterPercentage = calculateCurrentAttendance(totalSimAttended, totalSimConducted);
  const overallDelta = overallAfterPercentage - overallBeforePercentage;
  const overallProjectedEndPercentage = calculateMaxAchievableAttendance(
    totalSimAttended,
    totalSimConducted,
    totalFutureRemaining
  );
  const overallRequiredRecovery = calculateRequiredRecoveryClasses(
    totalSimConducted,
    totalSimAttended,
    targetPercentage
  );

  const isOverallIrreversible = overallProjectedEndPercentage < targetPercentage;
  const isOverallDangerZone = isOverallIrreversible || overallAfterPercentage < targetPercentage;

  let policyAppliedDescription = '';
  if (request.leaveType === 'on_duty') {
    if (request.odPolicy === 'counts_attended') {
      policyAppliedDescription = `Policy A: On-Duty sessions count as attended up to a cap of ${maxOD} sessions (${odSessionsApproved} approved, ${odSessionsCapped} capped).`;
    } else if (request.odPolicy === 'not_attended') {
      policyAppliedDescription = 'Policy B: On-Duty sessions count as conducted without attendance credit.';
    } else {
      policyAppliedDescription = 'Policy C: On-Duty sessions are formally exempted from the denominator.';
    }
  } else if (request.leaveType === 'medical_leave') {
    if (request.mlPolicy === 'approved_credit') {
      policyAppliedDescription = 'Medical Policy: Approved institutional medical credit applied to attended hours.';
    } else if (request.mlPolicy === 'ordinary_absence') {
      policyAppliedDescription = 'Medical Policy: Medical leave treated as ordinary absence (no attendance credit).';
    } else {
      policyAppliedDescription = 'Medical Policy: Sessions exempted from total conducted count.';
    }
  } else {
    policyAppliedDescription = 'Standard absence: Counts as conducted and unexcused absent.';
  }

  return {
    request,
    totalClassesAffected: affected.length,
    affectedSessions: affected,
    subjectImpacts,
    overallBeforePercentage: Number(overallBeforePercentage.toFixed(2)),
    overallAfterPercentage: Number(overallAfterPercentage.toFixed(2)),
    overallDelta: Number(overallDelta.toFixed(2)),
    overallProjectedEndPercentage: Number(overallProjectedEndPercentage.toFixed(2)),
    overallRequiredRecovery: overallRequiredRecovery === Infinity ? 999 : overallRequiredRecovery,
    isOverallDangerZone,
    isOverallIrreversible,
    policyAppliedDescription,
    odSessionsApproved,
    odSessionsCapped,
  };
}
