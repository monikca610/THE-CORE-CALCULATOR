import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { TargetPercentage } from '../utils/attendanceEngine';
import {
  Bell,
  Calendar,
  Layers,
  Sparkles,
  BarChart3,
  SlidersHorizontal,
  Bot,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: any) => void;
  onOpenNotifications: () => void;
  onOpenSetup: () => void;
  onOpenSettings: () => void;
  onOpenAdvisor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNotifications,
  onOpenSetup,
  onOpenSettings,
  onOpenAdvisor,
}) => {
  const {
    state,
    currentSection,
    setTargetPercentage,
    overallCalculation,
    unreadNotificationCount,
    isSimulationActive,
  } = useAttendance();

  const targets: TargetPercentage[] = [75, 80, 85, 90];

  return (
    <header className="sticky top-0 z-40 bg-[#0B1020]/95 backdrop-blur-md border-b border-[#50E3FF]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setCurrentTab('landing')}
          className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#50E3FF] rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#50E3FF]/20 to-[#B7FF5A]/20 border border-[#50E3FF]/40 flex items-center justify-center text-[#B7FF5A] font-bold text-sm shadow-[0_0_15px_rgba(80,227,255,0.2)]">
            Ω
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base tracking-wide text-white group-hover:text-[#B7FF5A] transition-colors whitespace-nowrap">
              THE CORE CALCULATOR
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#50E3FF]/70 whitespace-nowrap">
              Academic Nexus
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Clean text links with active indicator) */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-mono">
          <button
            onClick={() => setCurrentTab('command')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'command'
                ? 'text-[#50E3FF] bg-[#151B32] border border-[#50E3FF]/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-[#151B32]/60'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setCurrentTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'analytics'
                ? 'text-[#B7FF5A] bg-[#151B32] border border-[#B7FF5A]/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-[#151B32]/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Attendance Lab</span>
          </button>

          <button
            onClick={() => setCurrentTab('leave')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'leave'
                ? 'text-[#FFB84D] bg-[#151B32] border border-[#FFB84D]/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-[#151B32]/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Leave Simulator</span>
            {isSimulationActive && (
              <span className="w-2 h-2 rounded-full bg-[#FFB84D] animate-ping" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('timemachine')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'timemachine'
                ? 'text-[#50E3FF] bg-[#151B32] border border-[#50E3FF]/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-[#151B32]/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Time Machine</span>
          </button>

          <button
            onClick={() => setCurrentTab('recovery')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'recovery'
                ? 'text-[#B7FF5A] bg-[#151B32] border border-[#B7FF5A]/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-[#151B32]/60'
            }`}
          >
            Recovery Engine
          </button>

          <button
            onClick={() => setCurrentTab('timetable')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'timetable'
                ? 'text-[#50E3FF] bg-[#151B32] border border-[#50E3FF]/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-[#151B32]/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetable</span>
          </button>
        </nav>

        {/* Zone 3: Interactive controls & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Target Selector Segmented Control */}
          <div className="hidden sm:flex items-center p-0.5 bg-[#151B32] border border-slate-800 rounded-lg text-xs">
            <span className="px-2 py-1 text-[11px] font-mono text-slate-400">Target</span>
            {targets.map((t) => (
              <button
                key={t}
                onClick={() => setTargetPercentage(t)}
                className={`px-2 py-1 rounded text-xs font-mono font-medium transition-all ${
                  state.targetPercentage === t
                    ? 'bg-[#B7FF5A] text-[#0B1020] font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t}%
              </button>
            ))}
          </div>

          {/* Section Indicator button */}
          <button
            onClick={onOpenSetup}
            title="Switch Class Section"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#151B32] border border-slate-700/80 text-xs font-mono text-slate-200 hover:border-[#50E3FF]/50 transition-colors whitespace-nowrap"
          >
            <Layers className="w-3.5 h-3.5 text-[#50E3FF]" />
            <span className="font-semibold text-[#50E3FF]">{currentSection.name}</span>
          </button>

          {/* AI Advisor Button in Navbar */}
          <button
            onClick={onOpenAdvisor}
            className="p-2 rounded-lg bg-[#151B32] border border-[#50E3FF]/30 text-[#50E3FF] hover:bg-[#50E3FF]/15 transition-colors"
            title="Attendance Advisor AI"
          >
            <Bot className="w-4 h-4" />
          </button>

          {/* Smart Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-[#151B32] border border-slate-800 text-slate-300 hover:text-white hover:border-[#50E3FF]/40 transition-colors"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF5263] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-[#151B32] border border-slate-800 text-slate-300 hover:text-white hover:border-[#50E3FF]/40 transition-colors"
            title="System Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
