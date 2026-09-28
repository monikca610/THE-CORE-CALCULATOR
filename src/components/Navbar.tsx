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
  LayoutDashboard,
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
    unreadNotificationCount,
    isSimulationActive,
  } = useAttendance();

  const targets: TargetPercentage[] = [75, 80, 85, 90];

  return (
    <header className="sticky top-0 z-40 bg-[#080D1A]/90 backdrop-blur-xl border-b border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setCurrentTab('landing')}
          className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C07B] rounded-xl p-1"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E5C07B]/20 via-[#B7FF5A]/15 to-transparent border border-[#E5C07B]/30 flex items-center justify-center text-[#E5C07B] font-display font-bold text-sm shadow-[0_0_15px_rgba(229,192,123,0.15)] group-hover:scale-105 transition-transform">
            Ω
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base tracking-tight text-[#FAF8F2] group-hover:text-[#E5C07B] transition-colors whitespace-nowrap">
              THE CORE CALCULATOR
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 whitespace-nowrap">
              Academic Nexus
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Clean text links with refined active states) */}
        <nav className="hidden xl:flex items-center gap-1.5 text-xs font-sans font-medium">
          <button
            onClick={() => setCurrentTab('command')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'command'
                ? 'text-[#FAF8F2] bg-white/[0.08] border border-white/[0.12] shadow-sm font-semibold'
                : 'text-slate-400 hover:text-[#FAF8F2] hover:bg-white/[0.04]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 opacity-70" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'analytics'
                ? 'text-[#B7FF5A] bg-[#B7FF5A]/10 border border-[#B7FF5A]/25 font-semibold'
                : 'text-slate-400 hover:text-[#FAF8F2] hover:bg-white/[0.04]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 opacity-70" />
            <span>Attendance Lab</span>
          </button>

          <button
            onClick={() => setCurrentTab('leave')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'leave'
                ? 'text-[#E5C07B] bg-[#E5C07B]/10 border border-[#E5C07B]/25 font-semibold'
                : 'text-slate-400 hover:text-[#FAF8F2] hover:bg-white/[0.04]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 opacity-70" />
            <span>Leave Simulator</span>
            {isSimulationActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5C07B] animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('timemachine')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'timemachine'
                ? 'text-[#FAF8F2] bg-white/[0.08] border border-white/[0.12] font-semibold'
                : 'text-slate-400 hover:text-[#FAF8F2] hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 opacity-70" />
            <span>Time Machine</span>
          </button>

          <button
            onClick={() => setCurrentTab('recovery')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'recovery'
                ? 'text-[#B7FF5A] bg-[#B7FF5A]/10 border border-[#B7FF5A]/25 font-semibold'
                : 'text-slate-400 hover:text-[#FAF8F2] hover:bg-white/[0.04]'
            }`}
          >
            Recovery Engine
          </button>

          <button
            onClick={() => setCurrentTab('timetable')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'timetable'
                ? 'text-[#FAF8F2] bg-white/[0.08] border border-white/[0.12] font-semibold'
                : 'text-slate-400 hover:text-[#FAF8F2] hover:bg-white/[0.04]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            <span>Timetable</span>
          </button>
        </nav>

        {/* Zone 3: Interactive controls & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Target Selector Segmented Control */}
          <div className="hidden sm:flex items-center p-0.5 bg-[#0D1527] border border-white/[0.08] rounded-lg text-xs">
            <span className="px-2 py-1 text-[11px] font-mono text-slate-400">Target</span>
            {targets.map((t) => (
              <button
                key={t}
                onClick={() => setTargetPercentage(t)}
                className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition-all ${
                  state.targetPercentage === t
                    ? 'bg-[#FAF8F2] text-[#080D1A] font-bold shadow-sm'
                    : 'text-slate-400 hover:text-[#FAF8F2]'
                }`}
              >
                {t}%
              </button>
            ))}
          </div>

          {/* Section Indicator Button */}
          <button
            onClick={onOpenSetup}
            title="Switch Class Section"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1527] border border-white/[0.08] text-xs font-mono text-slate-300 hover:border-[#E5C07B]/40 hover:text-[#FAF8F2] transition-colors whitespace-nowrap"
          >
            <Layers className="w-3.5 h-3.5 text-[#E5C07B]" />
            <span className="font-semibold text-[#FAF8F2]">{currentSection.name}</span>
          </button>

          {/* AI Advisor Launcher Button */}
          <button
            onClick={onOpenAdvisor}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0D1527] border border-[#E5C07B]/20 text-[#E5C07B] hover:border-[#E5C07B]/50 hover:bg-[#E5C07B]/10 transition-all text-xs font-mono"
            title="Attendance Advisor AI"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-semibold">Advisor</span>
          </button>

          {/* Smart Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-[#0D1527] border border-white/[0.08] text-slate-400 hover:text-[#FAF8F2] hover:border-white/[0.15] transition-colors"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF5263] text-white text-[10px] font-bold flex items-center justify-center font-mono shadow-sm">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-[#0D1527] border border-white/[0.08] text-slate-400 hover:text-[#FAF8F2] hover:border-white/[0.15] transition-colors"
            title="System Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
