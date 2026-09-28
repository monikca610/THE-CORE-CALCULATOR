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
    <div className="relative bg-[#151B32] border border-[#50E3FF]/20 rounded-2xl p-6 sm:p-8 shadow-xl overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#50E3FF]/10 via-[#B7FF5A]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Circular Attendance Core visualization */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            
            {/* Glowing outer aura */}
            <div
              className={`absolute inset-4 rounded-full blur-xl opacity-30 transition-colors duration-700 ${
                isCritical
                  ? 'bg-[#FF5263]'
                  : isSafe
                  ? 'bg-[#B7FF5A]'
                  : 'bg-[#FFB84D]'
              }`}
            />

            {/* SVG Ring */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 250 250">
              {/* Background Track */}
              <circle
                cx="125"
                cy="125"
                r={radius}
                className="stroke-[#0B1020]"
                strokeWidth="16"
                fill="transparent"
              />
              {/* Target 75% tick marker */}
              <circle
                cx={x75}
                cy={y75}
                r="4.5"
                fill="#50E3FF"
                className="shadow-sm"
              />
              {/* Target 90% tick marker */}
              <circle
                cx={x90}
                cy={y90}
                r="4.5"
                fill="#B7FF5A"
                className="shadow-sm"
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
                strokeWidth="16"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Content Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 m-8 rounded-full bg-[#0B1020]/95 border border-slate-700/60 shadow-inner">
              <span className="text-[10px] font-mono tracking-widest text-[#50E3FF] uppercase">
                ATTENDANCE INDEX
              </span>
              <div className="font-display font-extrabold text-5xl sm:text-6xl text-white tracking-tight tabular-nums mt-1">
                {percentage.toFixed(1)}%
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
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
                TARGET: {target}%
              </span>
            </div>
          </div>

          {/* Benchmark Legend */}
          <div className="flex items-center gap-4 mt-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#50E3FF]" />
              75% SRM Standard
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B7FF5A]" />
              90% Honors Goal
            </span>
          </div>
        </div>

        {/* Right: Telemetry & Analytical Metrics Grid */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#50E3FF] tracking-wider uppercase">
                  {currentSection.name} · {currentSection.venue}
                </span>
                <h3 className="font-display font-bold text-2xl text-white">
                  Semester Attendance Status
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold border ${
                  isCritical
                    ? 'bg-[#FF5263]/10 text-[#FF5263] border-[#FF5263]/30'
                    : isSafe
                    ? 'bg-[#B7FF5A]/10 text-[#B7FF5A] border-[#B7FF5A]/30'
                    : 'bg-[#FFB84D]/10 text-[#FFB84D] border-[#FFB84D]/30'
                }`}
              >
                {isCritical
                  ? 'DETENTION RISK DETECTED'
                  : isSafe
                  ? 'SAFE MARGIN ACTIVE'
                  : 'RECOVERY REQUIRED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Calculated across {overallCalculation.subjectResults.length} registered courses based on the
              official weekly SRM Institute timetable.
            </p>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div className="p-3.5 bg-[#0B1020] rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">CLASSES COMPLETED</span>
              <span className="font-mono text-xl font-bold text-white tabular-nums block mt-1">
                {overallCalculation.totalAttended}{' '}
                <span className="text-xs text-slate-400 font-normal">/ {overallCalculation.totalConducted}</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Missed: {overallCalculation.totalMissed}
              </span>
            </div>

            <div className="p-3.5 bg-[#0B1020] rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">UPCOMING CLASSES</span>
              <span className="font-mono text-xl font-bold text-[#50E3FF] tabular-nums block mt-1">
                {overallCalculation.totalRemaining}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Total sem: {overallCalculation.totalSemesterClasses}
              </span>
            </div>

            <div className="p-3.5 bg-[#0B1020] rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">SEMESTER COUNTDOWN</span>
              <span className="font-mono text-xl font-bold text-[#B7FF5A] tabular-nums block mt-1">
                {daysLeft}{' '}
                <span className="text-xs text-slate-400 font-normal">days</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Ends: {state.endDate}
              </span>
            </div>

            <div className="p-3.5 bg-[#0B1020] rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block">MAX ACHIEVABLE</span>
              <span className="font-mono text-xl font-bold text-white tabular-nums block mt-1">
                {overallCalculation.maxAchievablePercentage}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                If 100% future attended
              </span>
            </div>

          </div>

          {/* Bottom Insights Strip */}
          <div className="p-4 bg-[#0B1020]/70 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#50E3FF]/10 text-[#50E3FF] flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-300 font-semibold block">
                  {overallCalculation.safelyMissableFromRemaining > 0
                    ? `Safe Miss Budget: ${overallCalculation.safelyMissableFromRemaining} upcoming classes can be missed`
                    : overallCalculation.requiredRecoveryClasses > 0
                    ? `Recovery Mandate: Must attend next ${overallCalculation.requiredRecoveryClasses} consecutive classes`
                    : 'Attendance is currently stabilized at target'}
                </span>
                <span className="text-slate-400 text-[11px] block">
                  Instant consecutive skip margin: {overallCalculation.instantSkipMargin} classes without dropping below {target}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="text-slate-400 text-[11px]">SUBJECT SUMMARY:</span>
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
