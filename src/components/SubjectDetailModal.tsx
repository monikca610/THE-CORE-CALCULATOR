import React, { useState } from 'react';
import { SubjectCalculationResult } from '../utils/attendanceEngine';
import { useAttendance } from '../context/AttendanceContext';
import {
  X,
  User,
  BookOpen,
  Calendar,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Zap,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface SubjectDetailModalProps {
  subjectResult: SubjectCalculationResult | null;
  onClose: () => void;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  subjectResult,
  onClose,
}) => {
  const {
    currentSection,
    occurrences,
    updateSubjectAttendance,
    state,
  } = useAttendance();

  if (!subjectResult) return null;

  const subjectInfo = currentSection.subjects.find((s) => s.code === subjectResult.subjectCode);

  // Filter future occurrences for this subject
  const futureOccurrences = occurrences
    .filter((o) => o.subjectCode === subjectResult.subjectCode && !o.isCompleted && !o.isHoliday)
    .slice(0, 10);

  const zoneColor =
    subjectResult.zone === 'critical'
      ? '#FF5263'
      : subjectResult.zone === 'caution'
      ? '#FFB84D'
      : '#B7FF5A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1020]/80 backdrop-blur-md">
      <div className="bg-[#151B32] border border-[#50E3FF]/30 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0B1020]/50">
          <div className="flex items-center gap-3">
            <span
              className="px-2.5 py-1 rounded text-xs font-mono font-bold"
              style={{
                backgroundColor: `${subjectResult.color}20`,
                color: subjectResult.color,
                border: `1px solid ${subjectResult.color}40`,
              }}
            >
              SLOT {subjectResult.slot}
            </span>
            <div>
              <div className="text-xs font-mono text-slate-400">{subjectResult.subjectCode}</div>
              <h3 className="font-display font-bold text-lg text-white">
                {subjectResult.subjectName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Critical Irreversible Detention Notice */}
          {subjectResult.isIrreversibleDetention && (
            <div className="bg-[#FF5263]/10 border border-[#FF5263]/40 p-4 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#FF5263] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-[#FF5263] font-display">
                  IRREVERSIBLE DETENTION ALERT
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Even with perfect 100% attendance in all {subjectResult.remainingClasses} remaining classes,
                  the maximum achievable attendance is {subjectResult.maxAchievablePercentage}%, which is
                  mathematically below your {subjectResult.targetPercentage}% target.
                </p>
              </div>
            </div>
          )}

          {/* Quick Metrics 4-Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-[#0B1020] rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">CURRENT RATE</span>
              <span
                className="font-bold text-xl block mt-1"
                style={{ color: zoneColor }}
              >
                {subjectResult.currentPercentage.toFixed(1)}%
              </span>
              <span className="text-slate-400 text-[10px] block mt-0.5">
                {subjectResult.attendedClasses} of {subjectResult.conductedClasses}
              </span>
            </div>

            <div className="p-3 bg-[#0B1020] rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">MAX ACHIEVABLE</span>
              <span className="font-bold text-xl text-white block mt-1">
                {subjectResult.maxAchievablePercentage}%
              </span>
              <span className="text-slate-400 text-[10px] block mt-0.5">
                + {subjectResult.remainingClasses} future classes
              </span>
            </div>

            <div className="p-3 bg-[#0B1020] rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">RECOVERY REQUIREMENT</span>
              <span
                className="font-bold text-xl block mt-1"
                style={{ color: subjectResult.requiredRecoveryClasses > 0 ? '#FFB84D' : '#B7FF5A' }}
              >
                {subjectResult.requiredRecoveryClasses > 0
                  ? `${subjectResult.requiredRecoveryClasses} classes`
                  : 'Target Met'}
              </span>
              <span className="text-slate-400 text-[10px] block mt-0.5">
                Consecutive mandatory
              </span>
            </div>

            <div className="p-3 bg-[#0B1020] rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">SAFE BUNK MARGIN</span>
              <span className="font-bold text-xl text-[#50E3FF] block mt-1">
                {subjectResult.safelyMissableFromRemaining}
              </span>
              <span className="text-slate-400 text-[10px] block mt-0.5">
                Can miss from upcoming
              </span>
            </div>
          </div>

          {/* Quick Counter Adjustment Controls */}
          <div className="p-4 bg-[#0B1020]/60 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-semibold">QUICK ATTENDANCE ADJUSTMENT</span>
              <span className="text-slate-400 text-[11px]">Instant recalculation</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Attended:</span>
                <button
                  onClick={() =>
                    updateSubjectAttendance(
                      subjectResult.subjectCode,
                      subjectResult.conductedClasses,
                      Math.max(0, subjectResult.attendedClasses - 1)
                    )
                  }
                  className="w-7 h-7 rounded bg-[#151B32] border border-slate-700 text-white font-bold hover:bg-slate-700"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold text-white">
                  {subjectResult.attendedClasses}
                </span>
                <button
                  onClick={() =>
                    updateSubjectAttendance(
                      subjectResult.subjectCode,
                      subjectResult.conductedClasses,
                      Math.min(subjectResult.conductedClasses, subjectResult.attendedClasses + 1)
                    )
                  }
                  className="w-7 h-7 rounded bg-[#151B32] border border-slate-700 text-white font-bold hover:bg-slate-700"
                >
                  +
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Conducted:</span>
                <button
                  onClick={() =>
                    updateSubjectAttendance(
                      subjectResult.subjectCode,
                      Math.max(subjectResult.attendedClasses, subjectResult.conductedClasses - 1),
                      subjectResult.attendedClasses
                    )
                  }
                  className="w-7 h-7 rounded bg-[#151B32] border border-slate-700 text-white font-bold hover:bg-slate-700"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold text-white">
                  {subjectResult.conductedClasses}
                </span>
                <button
                  onClick={() =>
                    updateSubjectAttendance(
                      subjectResult.subjectCode,
                      subjectResult.conductedClasses + 1,
                      subjectResult.attendedClasses
                    )
                  }
                  className="w-7 h-7 rounded bg-[#151B32] border border-slate-700 text-white font-bold hover:bg-slate-700"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Recovery Trajectory Progression Track */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-semibold">ATTENDANCE RECOVERY TRAJECTORY</span>
              <span className="text-slate-400 text-[11px]">
                Target: {subjectResult.targetPercentage}%
              </span>
            </div>

            <div className="p-3 bg-[#0B1020] rounded-xl border border-slate-800 overflow-x-auto">
              <div className="min-w-[500px] flex items-center gap-2 py-2">
                {/* Starting point */}
                <div className="px-3 py-2 rounded-lg bg-[#151B32] border border-slate-700 text-center shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 block">CURRENT</span>
                  <span className="font-mono font-bold text-sm text-white block">
                    {subjectResult.currentPercentage.toFixed(1)}%
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    {subjectResult.attendedClasses}/{subjectResult.conductedClasses}
                  </span>
                </div>

                {subjectResult.recoveryStepSimulation.map((st) => (
                  <React.Fragment key={st.step}>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <div
                      className={`px-3 py-2 rounded-lg text-center shrink-0 border ${
                        st.reachesTarget
                          ? 'bg-[#B7FF5A]/15 border-[#B7FF5A] text-[#B7FF5A]'
                          : 'bg-[#151B32] border-slate-800 text-slate-200'
                      }`}
                    >
                      <span className="text-[10px] font-mono block opacity-80">
                        +{st.step} CLASS{st.step > 1 ? 'ES' : ''}
                      </span>
                      <span className="font-mono font-bold text-sm block">
                        {st.percentage.toFixed(1)}%
                      </span>
                      <span className="text-[9px] opacity-70 block font-mono">
                        {st.attended}/{st.conducted}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Class Sessions according to timetable */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-semibold">UPCOMING TIMETABLE SESSIONS</span>
              <span className="text-slate-400 text-[11px]">
                {subjectResult.remainingClasses} classes scheduled until semester end
              </span>
            </div>

            {futureOccurrences.length > 0 ? (
              <div className="space-y-1.5">
                {futureOccurrences.map((occ) => (
                  <div
                    key={occ.id}
                    className="p-2.5 rounded-lg bg-[#0B1020] border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-3.5 h-3.5 text-[#50E3FF]" />
                      <span className="text-white font-medium">{occ.date} ({occ.dayOfWeek})</span>
                      <span className="text-slate-400">Period {occ.period} ({occ.time})</span>
                    </div>
                    <span className="text-[#B7FF5A] font-medium">
                      {occ.room || currentSection.venue}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No future sessions scheduled before the semester end date.
              </p>
            )}
          </div>

          {/* Course Details Footer */}
          <div className="p-3 rounded-xl bg-[#0B1020]/40 border border-slate-800 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>Faculty: <strong className="text-white">{subjectResult.faculty}</strong></span>
            <span>Credits: <strong className="text-white">{subjectInfo?.credits || '3-0-0-3'}</strong></span>
            <span>Dept: <strong className="text-white">{subjectInfo?.department || 'EEE'}</strong></span>
          </div>

        </div>
      </div>
    </div>
  );
};
