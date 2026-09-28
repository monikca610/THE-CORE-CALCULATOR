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
      className={`group relative p-5 rounded-2xl bg-[#151B32] border transition-all duration-200 text-left cursor-pointer flex flex-col justify-between hover:-translate-y-1 ${
        isCritical
          ? 'border-[#FF5263]/40 hover:border-[#FF5263] hover:shadow-[0_0_20px_rgba(255,82,99,0.25)]'
          : isCaution
          ? 'border-[#FFB84D]/40 hover:border-[#FFB84D] hover:shadow-[0_0_20px_rgba(255,184,77,0.2)]'
          : 'border-slate-800 hover:border-[#50E3FF]/50 hover:shadow-[0_0_20px_rgba(80,227,255,0.15)]'
      }`}
    >
      {/* Top Header: Slot Badge, Code, and Zone Tag */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded text-[11px] font-mono font-bold"
              style={{
                backgroundColor: `${result.color}20`,
                color: result.color,
                border: `1px solid ${result.color}40`,
              }}
            >
              SLOT {result.slot}
            </span>
            <span className="text-xs font-mono text-slate-400">{result.subjectCode}</span>
          </div>

          <span
            className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider"
            style={{ color: zoneColor }}
          >
            {isCritical && <AlertOctagon className="w-3.5 h-3.5" />}
            {isCaution && <AlertTriangle className="w-3.5 h-3.5" />}
            {isSafe && <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{result.zone}</span>
          </span>
        </div>

        {/* Subject Title */}
        <h4 className="font-display font-bold text-base text-white group-hover:text-[#50E3FF] transition-colors line-clamp-1">
          {result.subjectName}
        </h4>

        {/* Faculty subtitle */}
        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 line-clamp-1">
          <User className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{result.faculty}</span>
        </p>
      </div>

      {/* Center: Big Attendance Percentage & Progress Bar */}
      <div className="my-4 space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="font-display font-extrabold text-3xl text-white tabular-nums tracking-tight">
            {result.currentPercentage.toFixed(1)}%
          </span>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {result.attendedClasses} / {result.conductedClasses} classes
          </span>
        </div>

        {/* Progress bar with target indicator marker */}
        <div className="relative w-full h-2.5 rounded-full bg-[#0B1020] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, result.currentPercentage)}%`,
              backgroundColor: zoneColor,
              boxShadow: `0 0 10px ${zoneColor}`,
            }}
          />
        </div>

        {/* Target comparison line */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Target: {result.targetPercentage}%</span>
          <span>Max: {result.maxAchievablePercentage}%</span>
        </div>
      </div>

      {/* Bottom Metrics Grid */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2 rounded-lg bg-[#0B1020]/60">
          <span className="text-[10px] text-slate-400 block">RECOVERY REQ.</span>
          <span
            className="font-bold text-sm block mt-0.5"
            style={{ color: result.requiredRecoveryClasses > 0 ? '#FFB84D' : '#B7FF5A' }}
          >
            {result.isIrreversibleDetention
              ? 'IMPOSSIBLE'
              : result.requiredRecoveryClasses > 0
              ? `${result.requiredRecoveryClasses} classes`
              : '0 classes (Met)'}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[#0B1020]/60">
          <span className="text-[10px] text-slate-400 block">SAFE MISSES</span>
          <span className="font-bold text-sm text-[#50E3FF] block mt-0.5">
            {result.safelyMissableFromRemaining}{' '}
            <span className="text-[10px] text-slate-400 font-normal">of {result.remainingClasses}</span>
          </span>
        </div>
      </div>

      {/* Hover action strip */}
      <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 group-hover:text-[#50E3FF] transition-colors">
        <span>Detailed recovery telemetry</span>
        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
