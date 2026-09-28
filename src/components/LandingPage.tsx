import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { CLASS_SECTIONS } from '../data/timetableData';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
  Activity,
  Compass,
  Layers,
  Award,
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

  const recoveryScore = Math.min(
    100,
    Math.round(
      (overallCalculation.currentPercentage / state.targetPercentage) * 70 +
        (overallCalculation.maxAchievablePercentage >= state.targetPercentage ? 30 : 0)
    )
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-[#080D1A] bg-grid-modern">
      {/* Refined ambient lighting meshes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#E5C07B]/10 via-[#B7FF5A]/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#50E3FF]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#E5C07B]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Hero Viewport */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-7">
            
            {/* Live date indicator capsule */}
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2 text-[#E5C07B] bg-[#0D1527] border border-[#E5C07B]/25 px-3 py-1 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF5A] animate-pulse" />
                INTELLIGENT COMMAND ACTIVE
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {todayFormatted}
              </span>
            </div>

            {/* Main Headline in Space Grotesk */}
            <div className="space-y-3">
              <h1 className="font-display font-bold text-4xl sm:text-6xl xl:text-7xl tracking-tight text-[#FAF8F2] leading-[1.05]">
                YOUR ATTENDANCE. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAF8F2] via-[#E5C07B] to-[#B7FF5A]">
                  YOUR NEXT MOVE.
                </span>
              </h1>
              <p className="text-slate-300/80 font-sans text-base sm:text-lg max-w-xl leading-relaxed pt-1 font-normal">
                An intelligent academic command center that turns attendance data into a strategy for your semester.
                Engineered with real SRM timetables, deterministic recovery algorithms, and predictive time travel.
              </p>
            </div>

            {/* Quick Profile Simulation Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 text-[11px] mr-1">SIMULATE PROFILE:</span>
              <button
                onClick={() => applyAttendancePreset('timetable')}
                className="px-3 py-1.5 rounded-lg bg-[#0D1527] border border-white/[0.08] hover:border-white/[0.2] text-slate-200 text-xs transition-colors shadow-sm"
              >
                Standard (82%)
              </button>
              <button
                onClick={() => applyAttendancePreset('borderline')}
                className="px-3 py-1.5 rounded-lg bg-[#0D1527] border border-[#FFB84D]/30 text-[#FFB84D] hover:border-[#FFB84D] text-xs transition-colors shadow-sm"
              >
                Borderline (73%)
              </button>
              <button
                onClick={() => applyAttendancePreset('critical')}
                className="px-3 py-1.5 rounded-lg bg-[#0D1527] border border-[#FF5263]/30 text-[#FF5263] hover:border-[#FF5263] text-xs transition-colors shadow-sm"
              >
                Critical (58%)
              </button>
            </div>

            {/* Two Primary CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onInitialize}
                className="px-7 py-4 rounded-xl bg-[#FAF8F2] text-[#080D1A] font-display font-bold text-sm tracking-wide hover:bg-white transition-all transform hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(250,248,242,0.15)] flex items-center gap-2.5"
              >
                <span>INITIALIZE MY DASHBOARD</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={onExplore}
                className="px-7 py-4 rounded-xl bg-[#0D1527] border border-white/[0.12] text-[#FAF8F2] font-display font-semibold text-sm tracking-wide hover:border-[#E5C07B]/50 hover:bg-[#131D35] transition-all flex items-center gap-2 shadow-sm"
              >
                <Compass className="w-4 h-4 text-[#E5C07B]" />
                <span>EXPLORE THE SYSTEM</span>
              </button>
            </div>

            {/* Trust and ground truth indicators */}
            <div className="flex items-center gap-6 pt-4 text-xs font-mono text-slate-400 border-t border-white/[0.08] w-full">
              <div>
                <span className="text-[#FAF8F2] font-bold text-sm">{CLASS_SECTIONS.length}</span> CLASS SECTIONS
              </div>
              <div>
                <span className="text-[#B7FF5A] font-bold text-sm">100%</span> DETERMINISTIC MATH
              </div>
              <div>
                <span className="text-[#E5C07B] font-bold text-sm">SRM IST</span> TIRUCHIRAPPALLI
              </div>
            </div>
          </div>

          {/* Right Column: Visual Centerpiece — Futuristic Luxury Attendance Orb */}
          <div className="lg:col-span-5 flex justify-center items-center relative py-6">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
              
              {/* Outer rotating decorative rings with soft opacity */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#E5C07B]/15 animate-[spin_80s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-white/[0.06] animate-[spin_60s_linear_infinite_reverse]" />
              <div className="absolute inset-8 rounded-full border border-white/[0.04]" />

              {/* Glowing circular progress SVG */}
              <svg className="w-64 h-64 sm:w-72 sm:h-72 -rotate-90 transform" viewBox="0 0 240 240">
                <circle
                  cx="120"
                  cy="120"
                  r="95"
                  className="stroke-[#0D1527]"
                  strokeWidth="12"
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
                  strokeWidth="12"
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
                  fill="#E5C07B"
                />
                {/* 90% Honors Marker Notch */}
                <circle
                  cx={120 + 95 * Math.cos(2 * Math.PI * 0.90)}
                  cy={120 + 95 * Math.sin(2 * Math.PI * 0.90)}
                  r="4"
                  fill="#B7FF5A"
                />
              </svg>

              {/* Center Core Display in Glass Ivory / Navy */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 rounded-full bg-[#080D1A]/95 backdrop-blur-2xl m-10 border border-white/[0.1] shadow-2xl">
                <span className="text-[10px] font-mono tracking-widest text-[#E5C07B] uppercase mb-1 font-semibold">
                  SEMESTER AGGREGATE
                </span>
                <span className="font-display font-extrabold text-5xl sm:text-6xl text-[#FAF8F2] tracking-tight tabular-nums">
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

              {/* Floating Glass Chip 1: Classes Completed */}
              <div className="absolute -top-3 -left-4 sm:left-0 bg-[#0D1527]/90 border border-white/[0.1] px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-xl transform hover:scale-105 transition-transform">
                <div className="text-[10px] font-mono text-slate-400">CLASSES COMPLETED</div>
                <div className="text-base font-bold text-[#FAF8F2] font-mono tabular-nums">
                  {overallCalculation.totalAttended} <span className="text-xs text-slate-400">/ {overallCalculation.totalConducted}</span>
                </div>
              </div>

              {/* Floating Glass Chip 2: Classes Remaining */}
              <div className="absolute -top-3 -right-4 sm:right-0 bg-[#0D1527]/90 border border-white/[0.1] px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-xl transform hover:scale-105 transition-transform">
                <div className="text-[10px] font-mono text-slate-400">CLASSES REMAINING</div>
                <div className="text-base font-bold text-[#B7FF5A] font-mono tabular-nums">
                  {overallCalculation.totalRemaining} <span className="text-xs text-slate-400">held ahead</span>
                </div>
              </div>

              {/* Floating Glass Chip 3: Recovery Score */}
              <div className="absolute -bottom-3 -left-4 sm:left-2 bg-[#0D1527]/90 border border-white/[0.1] px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-xl transform hover:scale-105 transition-transform">
                <div className="text-[10px] font-mono text-slate-400">RECOVERY SCORE</div>
                <div className="text-base font-bold text-[#E5C07B] font-mono tabular-nums">
                  {recoveryScore} <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>

              {/* Floating Glass Chip 4: Days Remaining */}
              <div className="absolute -bottom-3 -right-4 sm:right-2 bg-[#0D1527]/90 border border-white/[0.1] px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-xl transform hover:scale-105 transition-transform">
                <div className="text-[10px] font-mono text-slate-400">DAYS REMAINING</div>
                <div className="text-base font-bold text-[#FAF8F2] font-mono tabular-nums">
                  {daysLeft} <span className="text-xs text-slate-400">days left</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Horizontal Luxury Feature Strip */}
      <div className="w-full bg-[#0D1527]/75 border-y border-white/[0.08] backdrop-blur-xl py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs font-mono tracking-wider">
          <div className="flex items-center gap-2 text-[#FAF8F2]">
            <Activity className="w-4 h-4 text-[#B7FF5A]" />
            <span>LIVE ATTENDANCE</span>
          </div>
          <div className="text-slate-600 hidden sm:block">/</div>
          <div className="flex items-center gap-2 text-[#FAF8F2]">
            <Sparkles className="w-4 h-4 text-[#E5C07B]" />
            <span>SMART PREDICTIONS</span>
          </div>
          <div className="text-slate-600 hidden sm:block">/</div>
          <div className="flex items-center gap-2 text-[#FAF8F2]">
            <Zap className="w-4 h-4 text-[#B7FF5A]" />
            <span>RECOVERY ENGINE</span>
          </div>
          <div className="text-slate-600 hidden sm:block">/</div>
          <div className="flex items-center gap-2 text-[#FAF8F2]">
            <Clock className="w-4 h-4 text-[#E5C07B]" />
            <span>TIME MACHINE</span>
          </div>
        </div>
      </div>

      {/* Section Selection Quick Repository Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-display font-bold text-[#FAF8F2]">
              SRM INSTITUTE CLASS SECTIONS
            </h2>
            <p className="text-xs text-slate-400">
              10 authentic class sections from the School of Electrical & Electronics Engineering.
            </p>
          </div>
          <button
            onClick={onInitialize}
            className="text-xs font-mono text-[#E5C07B] hover:underline flex items-center gap-1"
          >
            <span>Launch Setup Wizard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CLASS_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                sec.id === currentSection.id
                  ? 'bg-[#0D1527] border-[#E5C07B] shadow-[0_0_20px_rgba(229,192,123,0.15)]'
                  : 'bg-[#0D1527]/50 border-white/[0.06] hover:border-white/[0.15] hover:bg-[#0D1527]/80'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{sec.semester}</span>
                {sec.id === currentSection.id && (
                  <span className="w-2 h-2 rounded-full bg-[#B7FF5A]" />
                )}
              </div>
              <div className="font-display font-bold text-sm text-[#FAF8F2] mt-1.5">
                {sec.name}
              </div>
              <div className="text-[11px] text-[#E5C07B] truncate mt-0.5 font-mono">
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
