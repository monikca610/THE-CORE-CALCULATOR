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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D1A]/80 backdrop-blur-xl">
      <div className="bg-[#0D1527]/95 border border-white/[0.12] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-[#080D1A]/60">
          <div className="flex items-center gap-3.5">
            <span
              className="px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${subjectResult.color}18`,
                color: subjectResult.color,
                border: `1px solid ${subjectResult.color}35`,
              }}
            >
              SLOT {subjectResult.slot}
            </span>
            <div>
              <div className="text-xs font-mono text-slate-400 font-medium">{subjectResult.subjectCode}</div>
              <h3 className="font-display font-bold text-xl text-[#FAF8F2]">
                {subjectResult.subjectName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6 font-sans">
          
          {/* Critical Irreversible Detention Notice */}
          {subjectResult.isIrreversibleDetention && (
            <div className="bg-[#FF5263]/10 border border-[#FF5263]/40 p-5 rounded-2xl flex items-start gap-3.5 shadow-lg">
              <ShieldAlert className="w-5 h-5 text-[#FF5263] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-[#FF5263] font-display">
                  IRREVERSIBLE DETENTION ALERT
                </h4>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  Even with perfect 100% attendance in all {subjectResult.remainingClasses} remaining classes,
                  the maximum achievable attendance is {subjectResult.maxAchievablePercentage}%, which is
                  mathematically below your {subjectResult.targetPercentage}% target.
                </p>
              </div>
            </div>
          )}

          {/* Quick Metrics 4-Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-4 bg-[#080D1A]/90 rounded-2xl border border-white/[0.06] shadow-sm">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">CURRENT RATE</span>
              <span
                className="font-display font-extrabold text-2xl block mt-1 tabular-nums"
                style={{ color: zoneColor }}
              >
                {subjectResult.currentPercentage.toFixed(1)}%
              </span>
              <span className="text-slate-400 text-[11px] block mt-0.5 font-sans">
                {subjectResult.attendedClasses} of {subjectResult.conductedClasses}
              </span>
            </div>

            <div className="p-4 bg-[#080D1A]/90 rounded-2xl border border-white/[0.06] shadow-sm">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">MAX ACHIEVABLE</span>
              <span className="font-display font-extrabold text-2xl text-white block mt-1 tabular-nums">
                {subjectResult.maxAchievablePercentage}%
              </span>
              <span className="text-slate-400 text-[11px] block mt-0.5 font-sans">
                + {subjectResult.remainingClasses} classes
              </span>
            </div>

            <div className="p-4 bg-[#080D1A]/90 rounded-2xl border border-white/[0.06] shadow-sm">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">RECOVERY REQUIREMENT</span>
              <span
                className="font-display font-extrabold text-2xl block mt-1 tabular-nums"
                style={{ color: subjectResult.requiredRecoveryClasses > 0 ? '#FFB84D' : '#B7FF5A' }}
              >
                {subjectResult.requiredRecoveryClasses > 0
                  ? `${subjectResult.requiredRecoveryClasses}`
                  : 'Target Met'}
              </span>
              <span className="text-slate-400 text-[11px] block mt-0.5 font-sans">
                Consecutive mandatory
              </span>
            </div>

            <div className="p-4 bg-[#080D1A]/90 rounded-2xl border border-white/[0.06] shadow-sm">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">SAFE BUNK MARGIN</span>
              <span className="font-display font-extrabold text-2xl text-[#50E3FF] block mt-1 tabular-nums">
                {subjectResult.safelyMissableFromRemaining}
              </span>
              <span className="text-slate-400 text-[11px] block mt-0.5 font-sans">
                Can miss from upcoming
              </span>
            </div>
          </div>

          {/* Quick Counter Adjustment Controls */}
          <div className="p-5 bg-[#080D1A]/90 rounded-2xl border border-white/[0.06] space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#FAF8F2] font-semibold">QUICK ATTENDANCE ADJUSTMENT</span>
              <span className="text-slate-400 text-[11px]">Instant recalculation</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="text-slate-400">Attended:</span>
                <button
                  onClick={() =>
                    updateSubjectAttendance(
                      subjectResult.subjectCode,
                      subjectResult.conductedClasses,
                      Math.max(0, subjectResult.attendedClasses - 1)
                    )
                  }
                  className="w-8 h-8 rounded-xl bg-[#131D35] border border-white/[0.1] text-white font-bold hover:bg-[#1A2645] transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center text-base font-bold text-white tabular-nums">
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
                  className="w-8 h-8 rounded-xl bg-[#131D35] border border-white/[0.1] text-white font-bold hover:bg-[#1A2645] transition-colors"
                >
                  +
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-slate-400">Conducted:</span>
                <button
                  onClick={() =>
                    updateSubjectAttendance(
                      subjectResult.subjectCode,
                      Math.max(subjectResult.attendedClasses, subjectResult.conductedClasses - 1),
                      subjectResult.attendedClasses
                    )
                  }
                  className="w-8 h-8 rounded-xl bg-[#131D35] border border-white/[0.1] text-white font-bold hover:bg-[#1A2645] transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center text-base font-bold text-white tabular-nums">
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
                  className="w-8 h-8 rounded-xl bg-[#131D35] border border-white/[0.1] text-white font-bold hover:bg-[#1A2645] transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Recovery Trajectory Progression Track */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#FAF8F2] font-semibold">ATTENDANCE RECOVERY TRAJECTORY</span>
              <span className="text-slate-400 text-[11px]">
                Target: {subjectResult.targetPercentage}%
              </span>
            </div>

            <div className="p-4 bg-[#080D1A]/90 rounded-2xl border border-white/[0.06] overflow-x-auto shadow-sm">
              <div className="min-w-[500px] flex items-center gap-2.5 py-1">
                {/* Starting point */}
                <div className="px-3.5 py-2.5 rounded-xl bg-[#0D1527] border border-white/[0.08] text-center shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">CURRENT</span>
                  <span className="font-mono font-bold text-sm text-white block mt-0.5">
                    {subjectResult.currentPercentage.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    {subjectResult.attendedClasses}/{subjectResult.conductedClasses}
                  </span>
                </div>

                {subjectResult.recoveryStepSimulation.map((st) => (
                  <React.Fragment key={st.step}>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <div
                      className={`px-3.5 py-2.5 rounded-xl text-center shrink-0 border transition-all ${
                        st.reachesTarget
                          ? 'bg-[#B7FF5A]/15 border-[#B7FF5A] text-[#B7FF5A] shadow-[0_0_12px_rgba(183,255,90,0.2)]'
                          : 'bg-[#0D1527] border-white/[0.06] text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-mono block opacity-85 font-semibold">
                        +{st.step} CLASS{st.step > 1 ? 'ES' : ''}
                      </span>
                      <span className="font-mono font-bold text-sm block mt-0.5 tabular-nums">
                        {st.percentage.toFixed(1)}%
                      </span>
                      <span className="text-[10px] opacity-70 block font-mono">
                        {st.attended}/{st.conducted}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Class Sessions according to timetable */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#FAF8F2] font-semibold">UPCOMING TIMETABLE SESSIONS</span>
              <span className="text-slate-400 text-[11px]">
                {subjectResult.remainingClasses} classes scheduled until semester end
              </span>
            </div>

            {futureOccurrences.length > 0 ? (
              <div className="space-y-2">
                {futureOccurrences.map((occ) => (
                  <div
                    key={occ.id}
                    className="p-3 rounded-xl bg-[#080D1A]/90 border border-white/[0.06] flex items-center justify-between text-xs font-mono hover:border-white/[0.12] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-3.5 h-3.5 text-[#E5C07B]" />
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
              <p className="text-xs text-slate-400 italic font-mono">
                No future sessions scheduled before the semester end date.
              </p>
            )}
          </div>

          {/* Course Details Footer */}
          <div className="p-4 rounded-2xl bg-[#080D1A]/90 border border-white/[0.06] text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3">
            <span>Faculty: <strong className="text-white">{subjectResult.faculty}</strong></span>
            <span>Credits: <strong className="text-white">{subjectInfo?.credits || '3-0-0-3'}</strong></span>
            <span>Dept: <strong className="text-white">{subjectInfo?.department || 'EEE'}</strong></span>
          </div>

        </div>
      </div>
    </div>
  );
};
