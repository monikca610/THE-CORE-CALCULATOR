import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { TargetPercentage } from '../utils/attendanceEngine';
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  Sparkles,
  Zap,
  SlidersHorizontal,
  Bot,
  Layers,
  Clock,
  Compass,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: any) => void;
  onOpenAdvisor: () => void;
  onOpenSettings: () => void;
  onOpenSetup: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAdvisor,
  onOpenSettings,
  onOpenSetup,
}) => {
  const {
    currentSection,
    state,
    setTargetPercentage,
    overallCalculation,
    isSimulationActive,
  } = useAttendance();

  const navItems = [
    {
      id: 'command',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: overallCalculation.criticalSubjectsCount > 0 ? 'Detention Risk' : undefined,
      badgeColor: '#FF5263',
    },
    { id: 'analytics', label: 'Attendance Lab', icon: BarChart3 },
    {
      id: 'leave',
      label: 'Leave Simulator',
      icon: Zap,
      badge: isSimulationActive ? 'Active' : undefined,
      badgeColor: '#E5C07B',
    },
    { id: 'timemachine', label: 'Time Machine', icon: Sparkles },
    { id: 'recovery', label: 'Recovery Engine', icon: Clock },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-[#080D1A]/95 backdrop-blur-xl border-r border-white/[0.08] sticky top-16 h-[calc(100vh-4rem)] p-4 justify-between z-30 select-none">
      
      {/* Top Navigation Items */}
      <div className="space-y-6">
        
        {/* Active Profile Card */}
        <div className="p-3.5 rounded-xl bg-[#0D1527] border border-white/[0.08] shadow-sm space-y-1.5 transition-all hover:border-white/[0.15]">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>ACTIVE SECTION</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF5A] animate-pulse" />
          </div>
          <button
            onClick={onOpenSetup}
            className="w-full text-left font-display font-bold text-sm text-[#FAF8F2] hover:text-[#E5C07B] transition-colors flex items-center justify-between group"
          >
            <span className="truncate">{currentSection.name}</span>
            <span className="text-[11px] font-mono text-[#E5C07B] opacity-80 group-hover:opacity-100 group-hover:underline">
              Switch
            </span>
          </button>
          <div className="text-[11px] font-mono text-slate-400 truncate">
            {currentSection.venue}
          </div>
        </div>

        {/* Navigation List */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-3 block mb-2 font-medium">
            MAIN NAVIGATION
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-sans font-medium transition-all ${
                  isActive
                    ? 'bg-white/[0.08] text-[#FAF8F2] border border-white/[0.12] shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-[#FAF8F2] hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#E5C07B]' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight"
                    style={{
                      backgroundColor: `${item.badgeColor}18`,
                      color: item.badgeColor,
                      border: `1px solid ${item.badgeColor}35`,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-3.5 pt-4 border-t border-white/[0.08]">
        
        {/* Attendance Advisor Launcher Button */}
        <button
          onClick={onOpenAdvisor}
          className="w-full p-3 rounded-xl bg-[#0D1527] border border-[#E5C07B]/20 hover:border-[#E5C07B]/50 hover:bg-[#0D1527]/90 flex items-center gap-2.5 text-left group transition-all shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-[#E5C07B]/10 text-[#E5C07B] flex items-center justify-center shrink-0 border border-[#E5C07B]/20 group-hover:scale-105 transition-transform">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-display font-bold text-[#FAF8F2] group-hover:text-[#E5C07B] transition-colors truncate">
              ATTENDANCE ADVISOR
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate">
              Ask before you miss a class
            </div>
          </div>
        </button>

        {/* Target Benchmark Selector */}
        <div className="p-2.5 rounded-xl bg-[#0D1527] border border-white/[0.08] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>TARGET BENCHMARK</span>
            <span className="text-[#FAF8F2] font-bold">{state.targetPercentage}%</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {([75, 80, 85, 90] as TargetPercentage[]).map((t) => (
              <button
                key={t}
                onClick={() => setTargetPercentage(t)}
                className={`py-1 rounded text-xs font-mono font-medium transition-colors ${
                  state.targetPercentage === t
                    ? 'bg-[#FAF8F2] text-[#080D1A] font-bold shadow-sm'
                    : 'text-slate-400 hover:text-[#FAF8F2] bg-white/[0.02]'
                }`}
              >
                {t}%
              </button>
            ))}
          </div>
        </div>

        {/* Quick Footer Links */}
        <div className="flex items-center justify-between text-xs font-sans text-slate-400 px-1 pt-1">
          <button
            onClick={() => setCurrentTab('landing')}
            className="hover:text-[#FAF8F2] flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="hover:text-[#FAF8F2] flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

      </div>

    </aside>
  );
};
