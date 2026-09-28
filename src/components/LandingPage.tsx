import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { CLASS_SECTIONS } from '../data/timetableData';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  Calendar,
  Layers,
  Activity,
  Compass,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onInitialize: () => void;
  onExplore: () => void;
  onSelectSection: (sectionId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onInitialize,
  onExplore,
  onSelectSection,
}) => {
  const { overallCalculation, currentSection, state, applyAttendancePreset } = useAttendance();

  const percentage = overallCalculation.currentPercentage;
  const isSafe = percentage >= state.targetPercentage;
  const isCritical = overallCalculation.zone === 'critical';

  // Local live date formatting
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(state.endDate).getTime() - new Date(state.currentDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  // Recovery score 0-100: normalized ratio of current to target plus achievable buffer
  const recoveryScore = Math.min(
    100,
    Math.round(
      (overallCalculation.currentPercentage / state.targetPercentage) * 70 +
        (overallCalculation.maxAchievablePercentage >= state.targetPercentage ? 30 : 0)
    )
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-grid-cyber">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#50E3FF]/10 via-[#B7FF5A]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#50E3FF]/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-[#B7FF5A]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Main Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            {/* Live date indicator */}
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-[#50E3FF] bg-[#151B32] border border-[#50E3FF]/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF5A] animate-pulse" />
                MISSION CONTROL ACTIVE
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {todayFormatted}
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="font-display font-extrabold text-4xl sm:text-6xl xl:text-7xl tracking-tight text-white leading-none">
                YOUR ATTENDANCE. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B7FF5A] via-[#50E3FF] to-white">
                  YOUR NEXT MOVE.
                </span>
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed pt-2">
                An intelligent academic command center that turns attendance data into a strategy for your semester.
                Real SRM timetables, mathematical recovery simulations, and predictive time travel.
              </p>
            </div>

            {/* Quick Preset Selector */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-mono text-[11px] mr-1">SIMULATE PROFILE:</span>
              <button
                onClick={() => applyAttendancePreset('timetable')}
                className="px-2.5 py-1 rounded-md bg-[#151B32] border border-slate-700 hover:border-[#50E3FF]/40 text-slate-300 text-xs font-mono transition-colors"
              >
                Standard (82%)
              </button>
              <button
                onClick={() => applyAttendancePreset('borderline')}
                className="px-2.5 py-1 rounded-md bg-[#151B32] border border-[#FFB84D]/40 text-[#FFB84D] text-xs font-mono transition-colors"
              >
                Borderline (73%)
              </button>
              <button
                onClick={() => applyAttendancePreset('critical')}
                className="px-2.5 py-1 rounded-md bg-[#151B32] border border-[#FF5263]/40 text-[#FF5263] text-xs font-mono transition-colors"
              >
                Critical (58%)
              </button>
            </div>

            {/* Two Primary Large CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onInitialize}
                className="px-6 py-3.5 rounded-xl bg-[#B7FF5A] text-[#0B1020] font-display font-bold text-sm tracking-wide hover:bg-[#a6f343] transition-all transform hover:-translate-y-0.5 shadow-[0_0_25px_rgba(183,255,90,0.35)] flex items-center gap-2.5"
              >
                <span>INITIALIZE MY DASHBOARD</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={onExplore}
                className="px-6 py-3.5 rounded-xl bg-[#151B32] border border-[#50E3FF]/30 text-white font-display font-semibold text-sm tracking-wide hover:border-[#50E3FF] hover:bg-[#1B223F] transition-all flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#50E3FF]" />
                <span>EXPLORE THE SYSTEM</span>
              </button>
            </div>

            {/* Quick stats inline proof */}
            <div className="flex items-center gap-6 pt-4 text-xs font-mono text-slate-400 border-t border-slate-800/80 w-full">
              <div>
                <span className="text-[#50E3FF] font-bold text-sm">{CLASS_SECTIONS.length}</span> CLASS SECTIONS
              </div>
              <div>
                <span className="text-[#B7FF5A] font-bold text-sm">100%</span> DETERMINISTIC MATH
              </div>
              <div>
                <span className="text-white font-bold text-sm">SRM IST</span> TIRUCHIRAPPALLI
              </div>
            </div>
          </div>

          {/* Right Column: Visual Centerpiece — Futuristic Attendance Orb */}
          <div className="lg:col-span-5 flex justify-center items-center relative py-6">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
              
              {/* Outer rotating decorative rings */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#50E3FF]/20 animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-[#B7FF5A]/15 animate-[spin_40s_linear_infinite_reverse]" />
              <div className="absolute inset-8 rounded-full border border-slate-800" />

              {/* Glowing circular progress SVG */}
              <svg className="w-64 h-64 sm:w-72 sm:h-72 -rotate-90 transform" viewBox="0 0 240 240">
                <circle
                  cx="120"
                  cy="120"
                  r="95"
                  className="stroke-[#151B32]"
                  strokeWidth="14"
                  fill="transparent"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="95"
                  className={`transition-all duration-1000 ${
                    isCritical
                      ? 'stroke-[#FF5263]'
                      : isSafe
                      ? 'stroke-[#B7FF5A]'
                      : 'stroke-[#FFB84D]'
                  }`}
                  strokeWidth="14"
                  strokeDasharray={2 * Math.PI * 95}
                  strokeDashoffset={2 * Math.PI * 95 * (1 - Math.min(100, percentage) / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
                {/* 75% Target Marker Notch */}
                <circle
                  cx={120 + 95 * Math.cos(2 * Math.PI * 0.75)}
                  cy={120 + 95 * Math.sin(2 * Math.PI * 0.75)}
                  r="4"
                  fill="#50E3FF"
                  className="animate-pulse"
                />
              </svg>

              {/* Center Core Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 rounded-full bg-[#0B1020]/90 backdrop-blur-md m-10 border border-slate-700/50 shadow-[0_0_50px_rgba(80,227,255,0.15)]">
                <span className="text-[10px] font-mono tracking-widest text-[#50E3FF] uppercase mb-1">
                  SEMESTER AGGREGATE
                </span>
                <span className="font-display font-extrabold text-5xl sm:text-6xl text-white tracking-tight tabular-nums">
                  {percentage.toFixed(1)}%
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCritical
                        ? 'bg-[#FF5263] animate-ping'
                        : isSafe
                        ? 'bg-[#B7FF5A]'
                        : 'bg-[#FFB84D]'
                    }`}
                  />
                  <span className="text-xs font-mono font-medium text-slate-300">
                    TARGET: {state.targetPercentage}%
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-1">
                  {currentSection.name}
                </span>
              </div>

              {/* Floating Data Chip 1: Classes Completed (Top Left) */}
              <div className="absolute -top-3 -left-4 sm:left-0 bg-[#151B32]/95 border border-[#50E3FF]/30 px-3.5 py-2 rounded-xl shadow-lg backdrop-blur-md transform hover:scale-105 transition-transform">
                <div className="text-[10px] font-mono text-slate-400">CLASSES COMPLETED</div>
                <div className="text-base font-bold text-white font-mono tabular-nums">
                  {overallCalculation.totalAttended} <span className="text-xs text-slate-400">/ {overallCalculation.totalConducted}</span>
                </div>
              </div>

              {/* Floating Data Chip 2: Classes Remaining (Top Right) */}
              <div className="absolute -top-3 -right-4 sm:right-0 bg-[#151B32]/95 border border-[#B7FF5A]/30 px-3.5 py-2 rounded-xl shadow-lg backdrop-blur-md transform hover:scale-105 transition-transform">
                <div className="text-[10px] font-mono text-slate-400">CLASSES REMAINING</div>
                <div className="text-base font-bold text-[#B7FF5A] font-mono tabular-nums">
                  {overallCalculation.totalRemaining} <span className="text-xs text-slate-400">held ahead</span>
                </div>
              </div>

              {/* Floating Data Chip 3: Recovery Score (Bottom Left) */}
              <div className="absolute -bottom-3 -left-4 sm:left-2 bg-[#151B32]/95 border border-[#FFB84D]/30 px-3.5 py-2 rounded-xl shadow-lg backdrop-blur-md transform hover:scale-105 transition-transform">
                <div className="text-[10px] font-mono text-slate-400">RECOVERY SCORE</div>
                <div className="text-base font-bold text-[#FFB84D] font-mono tabular-nums">
                  {recoveryScore} <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>

              {/* Floating Data Chip 4: Semester Countdown (Bottom Right) */}
              <div className="absolute -bottom-3 -right-4 sm:right-2 bg-[#151B32]/95 border border-[#50E3FF]/30 px-3.5 py-2 rounded-xl shadow-lg backdrop-blur-md transform hover:scale-105 transition-transform">
                <div className="text-[10px] font-mono text-slate-400">DAYS REMAINING</div>
                <div className="text-base font-bold text-[#50E3FF] font-mono tabular-nums">
                  {daysLeft} <span className="text-xs text-slate-400">days left</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Horizontal Feature Strip */}
      <div className="w-full bg-[#151B32]/80 border-y border-[#50E3FF]/15 backdrop-blur-md py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs font-mono tracking-wider">
          <div className="flex items-center gap-2 text-[#50E3FF]">
            <Activity className="w-4 h-4" />
            <span>LIVE ATTENDANCE</span>
          </div>
          <div className="text-slate-600 hidden sm:block">/</div>
          <div className="flex items-center gap-2 text-[#B7FF5A]">
            <Sparkles className="w-4 h-4" />
            <span>SMART PREDICTIONS</span>
          </div>
          <div className="text-slate-600 hidden sm:block">/</div>
          <div className="flex items-center gap-2 text-[#FFB84D]">
            <Zap className="w-4 h-4" />
            <span>RECOVERY ENGINE</span>
          </div>
          <div className="text-slate-600 hidden sm:block">/</div>
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4 text-[#50E3FF]" />
            <span>TIME MACHINE</span>
          </div>
        </div>
      </div>

      {/* Section Selection Quick Drawer Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-display font-bold text-white">
              SRM INSTITUTE TIMETABLE REPOSITORY
            </h2>
            <p className="text-xs text-slate-400">
              Select any of the 10 authentic class sections to inspect subjects, faculty, and weekly schedules.
            </p>
          </div>
          <button
            onClick={onInitialize}
            className="text-xs font-mono text-[#50E3FF] hover:underline"
          >
            Launch Setup Wizard →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CLASS_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className={`p-3 rounded-xl text-left border transition-all ${
                sec.id === currentSection.id
                  ? 'bg-[#151B32] border-[#B7FF5A] shadow-[0_0_15px_rgba(183,255,90,0.15)]'
                  : 'bg-[#151B32]/40 border-slate-800 hover:border-slate-600 hover:bg-[#151B32]/80'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{sec.semester}</span>
                {sec.id === currentSection.id && (
                  <span className="w-2 h-2 rounded-full bg-[#B7FF5A]" />
                )}
              </div>
              <div className="font-display font-bold text-sm text-white mt-1">
                {sec.name}
              </div>
              <div className="text-[11px] text-[#50E3FF] truncate mt-0.5">
                {sec.venue}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {sec.subjects.length} Subjects
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
