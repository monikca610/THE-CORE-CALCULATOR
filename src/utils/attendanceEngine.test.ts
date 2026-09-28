import {
  calculateCurrentAttendance,
  calculateRequiredRecoveryClasses,
  calculateMaxAchievableAttendance,
  calculateSafelyMissableClasses,
  calculateInstantSkipMargin,
  generateRecoverySteps,
  calculateSubjectAttendance,
} from './attendanceEngine';
import {
  simulateLeave,
  getScheduledClassesInDateRange,
  LeaveSimulationRequest,
} from './leaveSimulator';
import { CLASS_SECTIONS } from '../data/timetableData';

export function runAttendanceEngineUnitTests() {
  const results: Array<{ test: string; passed: boolean; message?: string }> = [];

  function assert(testName: string, condition: boolean, message?: string) {
    results.push({ test: testName, passed: condition, message });
    if (!condition) {
      console.error(`[FAIL] ${testName}: ${message}`);
    } else {
      console.log(`[PASS] ${testName}`);
    }
  }

  // 1. Zero classes conducted
  const zeroAtt = calculateCurrentAttendance(0, 0);
  assert('Zero classes conducted returns 100%', zeroAtt === 100, `Got ${zeroAtt}`);

  // 2. Normal attendance calculation
  const normalAtt = calculateCurrentAttendance(18, 24);
  assert('18/24 attendance is 75%', normalAtt === 75, `Got ${normalAtt}`);

  // 3. Required future classes to reach target 75%
  // Formula: ceil((0.75 * 24 - 15) / (1 - 0.75)) = ceil((18 - 15) / 0.25) = ceil(3 / 0.25) = 12
  const reqRecovery = calculateRequiredRecoveryClasses(24, 15, 75);
  assert('Required future classes for 15/24 to hit 75% is 12', reqRecovery === 12, `Got ${reqRecovery}`);

  // 4. Required future classes when already above target
  const reqZero = calculateRequiredRecoveryClasses(24, 20, 75); // 20/24 = 83.33% > 75%
  assert('Already above target requires 0 recovery classes', reqZero === 0, `Got ${reqZero}`);

  // 5. Maximum achievable attendance
  // Attended 15, conducted 24, remaining 10 -> (15+10)/(24+10) = 25/34 = 73.53%
  const maxAch = calculateMaxAchievableAttendance(15, 24, 10);
  assert('Max achievable for 15/24 with 10 remaining is ~73.53%', Math.abs(maxAch - (25 / 34) * 100) < 0.01, `Got ${maxAch}`);

  // 6. Impossible recovery scenario (Irreversible detention check)
  // Target is 75%, but maxAchievable is 73.53% -> Irreversible detention!
  const dummySec = CLASS_SECTIONS[0];
  const subjRes = calculateSubjectAttendance(
    dummySec,
    { subjectCode: dummySec.subjects[0].code, conductedClasses: 24, attendedClasses: 15 },
    10,
    75
  );
  assert('Detects irreversible detention when maxAchievable < 75%', subjRes.isIrreversibleDetention === true, `Got ${subjRes.isIrreversibleDetention}`);
  assert('Zone is critical in impossible scenario', subjRes.zone === 'critical', `Got ${subjRes.zone}`);

  // 7. Safely missable classes calculation
  // Attended 22, conducted 24, remaining 16, total = 40. Target 75%.
  // Min required total = ceil(0.75 * 40) = 30.
  // Must attend from remaining = 30 - 22 = 8.
  // Can safely miss = 16 - 8 = 8.
  const safeMiss = calculateSafelyMissableClasses(22, 24, 16, 75);
  assert('Can safely miss 8 out of 16 remaining classes', safeMiss === 8, `Got ${safeMiss}`);

  // 8. Instant skip margin
  // Attended 22, conducted 24, target 75%.
  // floor((22 - 0.75 * 24) / 0.75) = floor((22 - 18) / 0.75) = floor(4 / 0.75) = 5.
  // After 5 misses: 22 / 29 = 75.86% >= 75%. After 6 misses: 22 / 30 = 73.33% < 75%.
  const instantMargin = calculateInstantSkipMargin(22, 24, 75);
  assert('Instant skip margin for 22/24 is 5 classes', instantMargin === 5, `Got ${instantMargin}`);

  // 9. Recovery step simulation
  const steps = generateRecoverySteps(24, 15, 75, 15);
  assert('Recovery step simulation generates steps', steps.length > 0, `Length: ${steps.length}`);
  const finalStep = steps[steps.length - 1];
  assert('Simulation tracks progress properly', finalStep.percentage > (15 / 24) * 100, `Final: ${finalStep.percentage}`);

  // 10. Timetable Multi-day class extraction test
  // Mon 2026-09-28 to Wed 2026-09-30 (3 weekdays) for Section II-BME
  const scheduledClasses = getScheduledClassesInDateRange(dummySec, '2026-09-28', '2026-09-30');
  assert('Timetable retrieves scheduled classes for 3 weekdays', scheduledClasses.length > 0, `Count: ${scheduledClasses.length}`);

  // 11. Leave Simulator: Policy A (OD counts as attended) vs Policy B (OD does not count)
  const dummyInputs: Record<string, { conductedClasses: number; attendedClasses: number }> = {};
  dummySec.subjects.forEach((s) => {
    dummyInputs[s.code] = { conductedClasses: 20, attendedClasses: 16 }; // 80% baseline
  });
  const dummyRemaining: Record<string, number> = {};
  dummySec.subjects.forEach((s) => {
    dummyRemaining[s.code] = 15;
  });

  const odReqPolicyA: LeaveSimulationRequest = {
    name: 'OD Policy A Test',
    leaveType: 'on_duty',
    startDate: '2026-10-05',
    endDate: '2026-10-07',
    targetSubjectCode: 'all',
    reason: 'Hackathon',
    odPolicy: 'counts_attended',
    mlPolicy: 'ordinary_absence',
    maxODSessionsAllowed: 12,
  };
  const resPolicyA = simulateLeave(dummySec, odReqPolicyA, dummyInputs, dummyRemaining, 75);

  const odReqPolicyB: LeaveSimulationRequest = {
    name: 'OD Policy B Test',
    leaveType: 'on_duty',
    startDate: '2026-10-05',
    endDate: '2026-10-07',
    targetSubjectCode: 'all',
    reason: 'Hackathon',
    odPolicy: 'not_attended',
    mlPolicy: 'ordinary_absence',
    maxODSessionsAllowed: 12,
  };
  const resPolicyB = simulateLeave(dummySec, odReqPolicyB, dummyInputs, dummyRemaining, 75);

  assert(
    'Policy A attendance is strictly greater than Policy B attendance',
    resPolicyA.overallAfterPercentage > resPolicyB.overallAfterPercentage,
    `Policy A: ${resPolicyA.overallAfterPercentage}%, Policy B: ${resPolicyB.overallAfterPercentage}%`
  );
  assert(
    'Policy A approves eligible OD sessions',
    resPolicyA.odSessionsApproved > 0,
    `Approved: ${resPolicyA.odSessionsApproved}`
  );

  const allPassed = results.every((r) => r.passed);
  console.log(`Unit test summary: ${results.filter((r) => r.passed).length}/${results.length} passed.`);
  return { allPassed, results };
}
