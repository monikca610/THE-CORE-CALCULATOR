import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  ShieldAlert,
  ShieldCheck,
  Flame,
  Clock,
  Calendar,
  AlertTriangle,
  Award,
  Zap,
} from 'lucide-react';

export const AttendanceCore: React.FC = () => {
  const { overallCalculation, state, currentSection } = useAttendance();

  const percentage = overallCalculation.currentPercentage;
  const target = state.targetPercentage;
  const isSafe = percentage >= target;
  const isCritical = overallCalculation.zone === 'critical';

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(state.endDate).getTime() - new Date(state.currentDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  // SVG circular geometry
  const radius = 98;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(100, Math.max(0, percentage)) / 100);

  // Target positions on circumference (in radians)
  const angle75 = (0.75 * 360 - 90) * (Math.PI / 180);
  const x75 = 125 + radius * Math.cos(angle75);
  const y75 = 125 + radius * Math.sin(angle75);

  const angle90 = (0.90 * 360 - 90) * (Math.PI / 180);
  const x90 = 125 + radius * Math.cos(angle90);
  const y90 = 125 + radius * Math.sin(angle90);

  return (
    <div className="relative bg-[#0D1527]/85 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#E5C07B]/10 via-[#B7FF5A]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-[#50E3FF]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left: Circular Attendance Core visualization */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-68 h-68 sm:w-76 sm:h-76 flex items-center justify-center">
            
            {/* Glowing outer aura */}
            <div
              className={`absolute inset-4 rounded-full blur-2xl opacity-25 transition-all duration-700 ${
                isCritical
                  ? 'bg-[#FF5263]'
                  : isSafe
                  ? 'bg-[#B7FF5A]'
                  : 'bg-[#FFB84D]'
              }`}
            />

            {/* SVG Ring */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 250 250">
              {/* Outer decorative subtle guide ring */}
              <circle
                cx="125"
                cy="125"
                r="115"
                className="stroke-white/[0.04]"
                strokeWidth="1"
                fill="transparent"
                strokeDasharray="4 6"
              />

              {/* Background Track */}
              <circle
                cx="125"
                cy="125"
                r={radius}
                className="stroke-[#080D1A]"
                strokeWidth="15"
                fill="transparent"
              />
              {/* Target 75% tick marker */}
              <circle
                cx={x75}
                cy={y75}
                r="5"
                fill="#E5C07B"
                className="shadow-[0_0_10px_#E5C07B]"
              />
              {/* Target 90% tick marker */}
              <circle
                cx={x90}
                cy={y90}
                r="5"
                fill="#B7FF5A"
                className="shadow-[0_0_10px_#B7FF5A]"
              />
              {/* Progress Arc */}
              <circle
                cx="125"
                cy="125"
                r={radius}
                className={`transition-all duration-1000 ease-out ${
                  isCritical
                    ? 'stroke-[#FF5263]'
                    : isSafe
                    ? 'stroke-[#B7FF5A]'
                    : 'stroke-[#FFB84D]'
                }`}
                strokeWidth="15"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Content Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 m-7 rounded-full bg-[#080D1A]/95 backdrop-blur-xl border border-white/[0.1] shadow-[inset_0_2px_20px_rgba(0,0,0,0.8)]">
              <span className="text-[10px] font-mono tracking-widest text-[#E5C07B] uppercase font-semibold">
                ATTENDANCE INDEX
              </span>
              <div className="font-display font-extrabold text-5xl sm:text-6xl text-[#FAF8F2] tracking-tight tabular-nums mt-1">
                {percentage.toFixed(1)}%
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCritical
                      ? 'bg-[#FF5263] animate-ping'
                      : isSafe
                      ? 'bg-[#B7FF5A]'
                      : 'bg-[#FFB84D]'
                  }`}
                />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  {overallCalculation.zone.toUpperCase()} ZONE
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 mt-1">
                TARGET: <strong className="text-[#FAF8F2]">{target}%</strong>
              </span>
            </div>
          </div>

          {/* Benchmark Legend */}
          <div className="flex items-center gap-5 mt-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5C07B] shadow-[0_0_8px_#E5C07B]" />
              <span className="text-slate-300">75% SRM Cutoff</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B7FF5A] shadow-[0_0_8px_#B7FF5A]" />
              <span className="text-slate-300">90% Honors Goal</span>
            </span>
          </div>
        </div>

        {/* Right: Telemetry & Analytical Metrics Grid */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono text-[#E5C07B] tracking-wider uppercase font-semibold">
                  {currentSection.name} · {currentSection.venue}
                </span>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#FAF8F2] tracking-tight mt-0.5">
                  Semester Standing & Telemetry
                </h3>
              </div>
              <span
                className={`self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors ${
                  isCritical
                    ? 'bg-[#FF5263]/15 text-[#FF5263] border-[#FF5263]/40'
                    : isSafe
                    ? 'bg-[#B7FF5A]/15 text-[#B7FF5A] border-[#B7FF5A]/40'
                    : 'bg-[#FFB84D]/15 text-[#FFB84D] border-[#FFB84D]/40'
                }`}
              >
                {isCritical
                  ? 'DETENTION RISK DETECTED'
                  : isSafe
                  ? 'SAFE MARGIN ACTIVE'
                  : 'RECOVERY MISSION REQUIRED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-1.5 max-w-xl">
              Calculated across {overallCalculation.subjectResults.length} registered academic subjects from the official School of Electrical & Electronics Engineering timetable.
            </p>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div className="p-4 bg-[#080D1A]/90 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-colors shadow-sm">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">CLASSES HELD</span>
              <span className="font-mono text-2xl font-bold text-[#FAF8F2] tabular-nums block mt-1">
                {overallCalculation.totalAttended}{' '}
                <span className="text-xs text-slate-400 font-normal">/ {overallCalculation.totalConducted}</span>
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Missed: <strong className="text-[#FF5263]">{overallCalculation.totalMissed}</strong>
              </span>
            </div>

            <div className="p-4 bg-[#080D1A]/90 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-colors shadow-sm">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">UPCOMING CLASSES</span>
              <span className="font-mono text-2xl font-bold text-[#50E3FF] tabular-nums block mt-1">
                {overallCalculation.totalRemaining}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Total: {overallCalculation.totalSemesterClasses} classes
              </span>
            </div>

            <div className="p-4 bg-[#080D1A]/90 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-colors shadow-sm">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">COUNTDOWN</span>
              <span className="font-mono text-2xl font-bold text-[#E5C07B] tabular-nums block mt-1">
                {daysLeft}{' '}
                <span className="text-xs text-slate-400 font-normal">days</span>
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Ends: {state.endDate}
              </span>
            </div>

            <div className="p-4 bg-[#080D1A]/90 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-colors shadow-sm">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">MAX ACHIEVABLE</span>
              <span className="font-mono text-2xl font-bold text-[#B7FF5A] tabular-nums block mt-1">
                {overallCalculation.maxAchievablePercentage}%
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                with 100% future rate
              </span>
            </div>

          </div>

          {/* Bottom Insights Strip */}
          <div className="p-4 rounded-2xl bg-[#080D1A]/95 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E5C07B]/10 text-[#E5C07B] border border-[#E5C07B]/20 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[#FAF8F2] font-semibold block text-sm">
                  {overallCalculation.safelyMissableFromRemaining > 0
                    ? `Safe Miss Budget: ${overallCalculation.safelyMissableFromRemaining} upcoming classes can be safely skipped`
                    : overallCalculation.requiredRecoveryClasses > 0
                    ? `Recovery Mandate: Must attend next ${overallCalculation.requiredRecoveryClasses} consecutive classes`
                    : 'Attendance is currently stabilized at benchmark'}
                </span>
                <span className="text-slate-400 text-xs block mt-0.5">
                  Instant consecutive skip margin: <strong className="text-slate-200">{overallCalculation.instantSkipMargin} classes</strong> without breaching {target}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 bg-[#0D1527] px-3 py-1.5 rounded-xl border border-white/[0.06]">
              <span className="text-slate-400 text-[11px]">SUBJECTS:</span>
              <span className="text-[#B7FF5A] font-bold">{overallCalculation.safeSubjectsCount} Safe</span>
              <span>·</span>
              <span className="text-[#FFB84D] font-bold">{overallCalculation.cautionSubjectsCount} Caution</span>
              {overallCalculation.criticalSubjectsCount > 0 && (
                <>
                  <span>·</span>
                  <span className="text-[#FF5263] font-bold">{overallCalculation.criticalSubjectsCount} Critical</span>
                </>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
