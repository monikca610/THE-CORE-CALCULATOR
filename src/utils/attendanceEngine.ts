import { ClassSection, ACADEMIC_EVENTS_2026 } from '../data/timetableData';

export type TargetPercentage = 75 | 80 | 85 | 90;
export type AttendanceZone = 'safe' | 'caution' | 'critical';

export interface SubjectAttendanceInput {
  subjectCode: string;
  conductedClasses: number;
  attendedClasses: number;
}

export interface SubjectCalculationResult {
  subjectCode: string;
  subjectName: string;
  slot: string;
  color: string;
  faculty: string;
  conductedClasses: number;
  attendedClasses: number;
  missedClasses: number;
  currentPercentage: number;
  remainingClasses: number;
  totalSemesterClasses: number;
  targetPercentage: number;
  requiredRecoveryClasses: number;
  maxAchievablePercentage: number;
  predictedAttendance: number; // if user attends all remaining
  safelyMissableFromRemaining: number;
  instantSkipMargin: number;
  zone: AttendanceZone;
  isIrreversibleDetention: boolean;
  recoveryPossible: boolean;
  recoveryStepSimulation: Array<{
    step: number;
    conducted: number;
    attended: number;
    percentage: number;
    reachesTarget: boolean;
  }>;
}

export interface OverallSemesterCalculation {
  totalConducted: number;
  totalAttended: number;
  totalMissed: number;
  totalRemaining: number;
  totalSemesterClasses: number;
  currentPercentage: number;
  maxAchievablePercentage: number;
  requiredRecoveryClasses: number;
  safelyMissableFromRemaining: number;
  instantSkipMargin: number;
  targetPercentage: number;
  zone: AttendanceZone;
  hasCriticalSubjects: boolean;
  criticalSubjectsCount: number;
  cautionSubjectsCount: number;
  safeSubjectsCount: number;
  subjectResults: SubjectCalculationResult[];
}

export interface ScheduledClassOccurrence {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number;
  time: string;
  subjectCode: string;
  room?: string;
  isCompleted: boolean;
  isHoliday: boolean;
  holidayTitle?: string;
  planStatus: 'attend' | 'absent' | 'unplanned';
}

/**
 * Formula 1: Current Attendance
 * (attended / conducted) * 100
 */
export function calculateCurrentAttendance(attended: number, conducted: number): number {
  if (conducted <= 0) return 100; // No classes conducted yet, student is in good standing
  const ratio = (attended / conducted) * 100;
  return Math.min(100, Math.max(0, ratio));
}

/**
 * Formula 2: Required future classes to reach target T (e.g. 0.75, 0.80, 0.85, 0.90)
 * max(0, ceil((T * conducted - attended) / (1 - T)))
 */
export function calculateRequiredRecoveryClasses(
  conducted: number,
  attended: number,
  targetPercentage: number
): number {
  if (conducted <= 0) return 0;
  const T = targetPercentage / 100;
  const currentRatio = attended / conducted;
  if (currentRatio >= T) return 0;
  if (T >= 1) {
    // If target is 100%, any miss makes 100% mathematically impossible once conducted > attended
    return attended === conducted ? 0 : Infinity;
  }

  const numerator = T * conducted - attended;
  const denominator = 1 - T;
  const raw = Math.ceil(numerator / denominator);
  return Math.max(0, raw);
}

/**
 * Formula 3: Maximum achievable attendance
 * (attended + remaining) / (conducted + remaining) * 100
 */
export function calculateMaxAchievableAttendance(
  attended: number,
  conducted: number,
  remaining: number
): number {
  const totalConducted = conducted + remaining;
  if (totalConducted <= 0) return 100;
  const totalAttended = attended + remaining;
  const result = (totalAttended / totalConducted) * 100;
  return Math.min(100, Math.max(0, result));
}

/**
 * Classes student can safely miss out of remaining classes without dropping below target T
 */
export function calculateSafelyMissableClasses(
  attended: number,
  conducted: number,
  remaining: number,
  targetPercentage: number
): number {
  const T = targetPercentage / 100;
  const totalClasses = conducted + remaining;
  if (totalClasses <= 0) return 0;

  // Minimum attended classes required over the entire semester to hit target T
  const minTotalRequiredAttended = Math.ceil(T * totalClasses);

  // If even attending all remaining classes cannot hit minTotalRequiredAttended, safe miss is 0
  if (attended + remaining < minTotalRequiredAttended) {
    return 0;
  }

  // Future classes student MUST attend
  const futureMustAttend = Math.max(0, minTotalRequiredAttended - attended);

  // Remainder that can be missed
  return Math.max(0, remaining - futureMustAttend);
}

/**
 * Instant Skip Margin:
 * How many consecutive classes could the student skip right now without their attendance dropping below target T
 * floor((attended - T * conducted) / T)
 */
export function calculateInstantSkipMargin(
  attended: number,
  conducted: number,
  targetPercentage: number
): number {
  if (conducted <= 0) return 0;
  const T = targetPercentage / 100;
  const currentRatio = attended / conducted;
  if (currentRatio < T) return 0;
  if (T <= 0) return conducted;

  const raw = Math.floor((attended - T * conducted) / T);
  return Math.max(0, raw);
}

/**
 * Generate recovery step simulations showing attendance progression after each future attended class
 */
export function generateRecoverySteps(
  conducted: number,
  attended: number,
  targetPercentage: number,
  remaining: number,
  maxSteps = 15
): Array<{
  step: number;
  conducted: number;
  attended: number;
  percentage: number;
  reachesTarget: boolean;
}> {
  const steps: Array<{
    step: number;
    conducted: number;
    attended: number;
    percentage: number;
    reachesTarget: boolean;
  }> = [];

  let curConducted = conducted;
  let curAttended = attended;
  const limit = Math.min(remaining > 0 ? remaining : 20, maxSteps);

  for (let i = 1; i <= limit; i++) {
    curConducted += 1;
    curAttended += 1;
    const pct = (curAttended / curConducted) * 100;
    const reaches = pct >= targetPercentage;
    steps.push({
      step: i,
      conducted: curConducted,
      attended: curAttended,
      percentage: Number(pct.toFixed(2)),
      reachesTarget: reaches,
    });
    if (reaches && i >= 5) {
      // Show at least 5 steps for visualization, or stop once target reached
      break;
    }
  }

  return steps;
}

/**
 * Class Occurrence Counter from Timetable across Date Range
 */
export function generateClassOccurrences(
  section: ClassSection,
  startDateStr: string,
  endDateStr: string,
  currentDateStr: string,
  userCustomPlan: Record<string, 'attend' | 'absent' | 'unplanned'> = {}
): {
  occurrences: ScheduledClassOccurrence[];
  conductedPerSubject: Record<string, number>;
  remainingPerSubject: Record<string, number>;
} {
  const occurrences: ScheduledClassOccurrence[] = [];
  const conductedPerSubject: Record<string, number> = {};
  const remainingPerSubject: Record<string, number> = {};

  section.subjects.forEach((s) => {
    conductedPerSubject[s.code] = 0;
    remainingPerSubject[s.code] = 0;
  });

  const holidayMap = new Map<string, string>();
  ACADEMIC_EVENTS_2026.forEach((ev) => {
    if (ev.isHoliday) holidayMap.set(ev.date, ev.title);
  });

  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  const current = new Date(currentDateStr + 'T23:59:59');

  const cur = new Date(start);
  const dayNames: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'> = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];

  while (cur <= end) {
    const dayOfWeekIdx = cur.getDay(); // 0 is Sunday, 6 is Saturday
    const yyyy = cur.getFullYear();
    const mm = String(cur.getMonth() + 1).padStart(2, '0');
    const dd = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    if (dayOfWeekIdx >= 1 && dayOfWeekIdx <= 5) {
      const dayName = dayNames[dayOfWeekIdx - 1];
      const isHoliday = holidayMap.has(dateStr);
      const holidayTitle = holidayMap.get(dateStr);

      const daySchedule = section.schedule[dayName] || [];

      for (const slot of daySchedule) {
        if (!slot.subjectCode) continue;

        const isCompleted = cur <= current;
        const occId = `${dateStr}_P${slot.period}_${slot.subjectCode}`;
        const planStatus = userCustomPlan[occId] || 'unplanned';

        occurrences.push({
          id: occId,
          date: dateStr,
          dayOfWeek: dayName,
          period: slot.period,
          time: slot.time,
          subjectCode: slot.subjectCode,
          room: slot.room,
          isCompleted,
          isHoliday,
          holidayTitle,
          planStatus,
        });

        if (!isHoliday) {
          if (isCompleted) {
            conductedPerSubject[slot.subjectCode] = (conductedPerSubject[slot.subjectCode] || 0) + 1;
          } else {
            remainingPerSubject[slot.subjectCode] = (remainingPerSubject[slot.subjectCode] || 0) + 1;
          }
        }
      }
    }

    cur.setDate(cur.getDate() + 1);
  }

  return { occurrences, conductedPerSubject, remainingPerSubject };
}

/**
 * Main Subject Calculator
 */
export function calculateSubjectAttendance(
  section: ClassSection,
  input: SubjectAttendanceInput,
  remainingClasses: number,
  targetPercentage: TargetPercentage
): SubjectCalculationResult {
  const subject = section.subjects.find((s) => s.code === input.subjectCode) || {
    code: input.subjectCode,
    name: input.subjectCode,
    slot: 'A',
    color: '#50E3FF',
    faculty: 'Department Faculty',
    credits: '3-0-0-3',
    department: 'Engineering',
    periodsPerWeek: 3,
  };

  const conducted = Math.max(0, input.conductedClasses);
  const attended = Math.min(conducted, Math.max(0, input.attendedClasses));
  const missed = conducted - attended;
  const currentPercentage = calculateCurrentAttendance(attended, conducted);

  const requiredRecovery = calculateRequiredRecoveryClasses(conducted, attended, targetPercentage);
  const maxAchievable = calculateMaxAchievableAttendance(attended, conducted, remainingClasses);
  const safelyMissable = calculateSafelyMissableClasses(attended, conducted, remainingClasses, targetPercentage);
  const instantSkip = calculateInstantSkipMargin(attended, conducted, targetPercentage);

  // Recovery is mathematically possible if max achievable is >= target
  const recoveryPossible = maxAchievable >= targetPercentage;
  const isIrreversibleDetention = conducted > 0 && !recoveryPossible;

  // Zone classification:
  let zone: AttendanceZone = 'safe';
  if (isIrreversibleDetention) {
    zone = 'critical';
  } else if (currentPercentage < targetPercentage) {
    zone = 'caution';
  } else {
    // If student is above target but can safely miss 0 or 1 class
    if (safelyMissable <= 1 && remainingClasses > 5) {
      zone = 'caution';
    } else {
      zone = 'safe';
    }
  }

  const predictedAttendance = calculateMaxAchievableAttendance(attended, conducted, remainingClasses);

  const recoveryStepSimulation = generateRecoverySteps(
    conducted,
    attended,
    targetPercentage,
    remainingClasses
  );

  return {
    subjectCode: subject.code,
    subjectName: subject.name,
    slot: subject.slot,
    color: subject.color,
    faculty: subject.faculty,
    conductedClasses: conducted,
    attendedClasses: attended,
    missedClasses: missed,
    currentPercentage: Number(currentPercentage.toFixed(2)),
    remainingClasses,
    totalSemesterClasses: conducted + remainingClasses,
    targetPercentage,
    requiredRecoveryClasses: requiredRecovery === Infinity ? 999 : requiredRecovery,
    maxAchievablePercentage: Number(maxAchievable.toFixed(2)),
    predictedAttendance: Number(predictedAttendance.toFixed(2)),
    safelyMissableFromRemaining: safelyMissable,
    instantSkipMargin: instantSkip,
    zone,
    isIrreversibleDetention,
    recoveryPossible,
    recoveryStepSimulation,
  };
}

/**
 * Calculate full semester metrics across all subjects
 */
export function calculateOverallSemester(
  section: ClassSection,
  inputs: Record<string, SubjectAttendanceInput>,
  remainingPerSubject: Record<string, number>,
  targetPercentage: TargetPercentage
): OverallSemesterCalculation {
  const subjectResults: SubjectCalculationResult[] = section.subjects.map((sub) => {
    const input = inputs[sub.code] || {
      subjectCode: sub.code,
      conductedClasses: 0,
      attendedClasses: 0,
    };
    const remaining = remainingPerSubject[sub.code] ?? 0;
    return calculateSubjectAttendance(section, input, remaining, targetPercentage);
  });

  const totalConducted = subjectResults.reduce((acc, s) => acc + s.conductedClasses, 0);
  const totalAttended = subjectResults.reduce((acc, s) => acc + s.attendedClasses, 0);
  const totalMissed = totalConducted - totalAttended;
  const totalRemaining = subjectResults.reduce((acc, s) => acc + s.remainingClasses, 0);
  const totalSemesterClasses = totalConducted + totalRemaining;

  const currentPercentage = calculateCurrentAttendance(totalAttended, totalConducted);
  const maxAchievablePercentage = calculateMaxAchievableAttendance(
    totalAttended,
    totalConducted,
    totalRemaining
  );
  const requiredRecoveryClasses = calculateRequiredRecoveryClasses(
    totalConducted,
    totalAttended,
    targetPercentage
  );
  const safelyMissableFromRemaining = calculateSafelyMissableClasses(
    totalAttended,
    totalConducted,
    totalRemaining,
    targetPercentage
  );
  const instantSkipMargin = calculateInstantSkipMargin(
    totalAttended,
    totalConducted,
    targetPercentage
  );

  let zone: AttendanceZone = 'safe';
  const criticalCount = subjectResults.filter((s) => s.zone === 'critical').length;
  const cautionCount = subjectResults.filter((s) => s.zone === 'caution').length;
  const safeCount = subjectResults.filter((s) => s.zone === 'safe').length;

  if (criticalCount > 0 || maxAchievablePercentage < targetPercentage) {
    zone = 'critical';
  } else if (cautionCount > 0 || currentPercentage < targetPercentage) {
    zone = 'caution';
  } else {
    zone = 'safe';
  }

  return {
    totalConducted,
    totalAttended,
    totalMissed,
    totalRemaining,
    totalSemesterClasses,
    currentPercentage: Number(currentPercentage.toFixed(2)),
    maxAchievablePercentage: Number(maxAchievablePercentage.toFixed(2)),
    requiredRecoveryClasses: requiredRecoveryClasses === Infinity ? 999 : requiredRecoveryClasses,
    safelyMissableFromRemaining,
    instantSkipMargin,
    targetPercentage,
    zone,
    hasCriticalSubjects: criticalCount > 0,
    criticalSubjectsCount: criticalCount,
    cautionSubjectsCount: cautionCount,
    safeSubjectsCount: safeCount,
    subjectResults,
  };
}
