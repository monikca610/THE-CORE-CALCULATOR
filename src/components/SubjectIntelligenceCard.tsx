import React from 'react';
import { SubjectCalculationResult } from '../utils/attendanceEngine';
import {
  ChevronRight,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  User,
  BookOpen,
} from 'lucide-react';

interface SubjectIntelligenceCardProps {
  result: SubjectCalculationResult;
  onClick: () => void;
}

export const SubjectIntelligenceCard: React.FC<SubjectIntelligenceCardProps> = ({
  result,
  onClick,
}) => {
  const isCritical = result.zone === 'critical';
  const isCaution = result.zone === 'caution';
  const isSafe = result.zone === 'safe';

  const zoneColor = isCritical
    ? '#FF5263'
    : isCaution
    ? '#FFB84D'
    : '#B7FF5A';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={`group relative p-5 sm:p-6 rounded-3xl bg-[#0D1527]/85 backdrop-blur-xl border transition-all duration-300 text-left cursor-pointer flex flex-col justify-between hover:-translate-y-1.5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] ${
        isCritical
          ? 'border-[#FF5263]/40 hover:border-[#FF5263] hover:shadow-[0_15px_35px_rgba(255,82,99,0.25)]'
          : isCaution
          ? 'border-[#FFB84D]/40 hover:border-[#FFB84D] hover:shadow-[0_15px_35px_rgba(255,184,77,0.2)]'
          : 'border-white/[0.08] hover:border-[#E5C07B]/50 hover:shadow-[0_15px_35px_rgba(229,192,123,0.15)]'
      }`}
    >
      {/* Top Header: Slot Badge, Code, and Zone Tag */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase"
              style={{
                backgroundColor: `${result.color}18`,
                color: result.color,
                border: `1px solid ${result.color}35`,
              }}
            >
              SLOT {result.slot}
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">{result.subjectCode}</span>
          </div>

          <span
            className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${zoneColor}15`,
              color: zoneColor,
              border: `1px solid ${zoneColor}30`,
            }}
          >
            {isCritical && <AlertOctagon className="w-3.5 h-3.5" />}
            {isCaution && <AlertTriangle className="w-3.5 h-3.5" />}
            {isSafe && <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{result.zone}</span>
          </span>
        </div>

        {/* Subject Title in Space Grotesk */}
        <h4 className="font-display font-bold text-base text-[#FAF8F2] group-hover:text-[#E5C07B] transition-colors line-clamp-1">
          {result.subjectName}
        </h4>

        {/* Faculty subtitle */}
        <p className="text-xs text-slate-400 font-sans flex items-center gap-1.5 mt-1 line-clamp-1">
          <User className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{result.faculty}</span>
        </p>
      </div>

      {/* Center: Big Attendance Percentage & Progress Bar */}
      <div className="my-5 space-y-2.5">
        <div className="flex items-baseline justify-between">
          <span className="font-display font-extrabold text-3xl sm:text-4xl text-[#FAF8F2] tabular-nums tracking-tight">
            {result.currentPercentage.toFixed(1)}%
          </span>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            <strong className="text-slate-200">{result.attendedClasses}</strong> / {result.conductedClasses} classes
          </span>
        </div>

        {/* Progress bar with smooth glowing fill */}
        <div className="relative w-full h-2 rounded-full bg-[#080D1A] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, result.currentPercentage)}%`,
              backgroundColor: zoneColor,
              boxShadow: `0 0 10px ${zoneColor}`,
            }}
          />
        </div>

        {/* Target & Max comparison line */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Target: <strong className="text-slate-300">{result.targetPercentage}%</strong></span>
          <span>Max Achievable: <strong className="text-slate-300">{result.maxAchievablePercentage}%</strong></span>
        </div>
      </div>

      {/* Bottom Metrics Grid */}
      <div className="pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-[#080D1A]/90 border border-white/[0.04]">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">RECOVERY REQ.</span>
          <span
            className="font-bold text-sm block mt-0.5 tabular-nums"
            style={{ color: result.requiredRecoveryClasses > 0 ? '#FFB84D' : '#B7FF5A' }}
          >
            {result.isIrreversibleDetention
              ? 'IMPOSSIBLE'
              : result.requiredRecoveryClasses > 0
              ? `${result.requiredRecoveryClasses} classes`
              : '0 classes (Met)'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#080D1A]/90 border border-white/[0.04]">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">SAFE MISSES</span>
          <span className="font-bold text-sm text-[#50E3FF] block mt-0.5 tabular-nums">
            {result.safelyMissableFromRemaining}{' '}
            <span className="text-[10px] text-slate-400 font-normal">of {result.remainingClasses}</span>
          </span>
        </div>
      </div>

      {/* Hover action strip */}
      <div className="mt-3.5 flex items-center justify-between text-xs font-mono text-slate-400 group-hover:text-[#E5C07B] transition-colors">
        <span>Deep-dive analytics</span>
        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
