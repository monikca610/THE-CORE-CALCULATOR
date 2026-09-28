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
  FileText,
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
    { id: 'command', label: 'DASHBOARD', icon: LayoutDashboard, badge: overallCalculation.criticalSubjectsCount > 0 ? 'ALERT' : undefined, badgeColor: '#FF5263' },
    { id: 'analytics', label: 'ATTENDANCE LAB', icon: BarChart3 },
    { id: 'leave', label: 'LEAVE SIMULATOR', icon: Zap, badge: isSimulationActive ? 'SIM ACTIVE' : undefined, badgeColor: '#FFB84D' },
    { id: 'timemachine', label: 'TIME MACHINE', icon: Sparkles },
    { id: 'recovery', label: 'RECOVERY ENGINE', icon: Clock },
    { id: 'timetable', label: 'TIMETABLE', icon: Calendar },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-[#0B1020] border-r border-[#50E3FF]/15 sticky top-16 h-[calc(100vh-4rem)] p-4 justify-between z-30 select-none">
      
      {/* Top Navigation Items */}
      <div className="space-y-6">
        
        {/* Section Profile Card */}
        <div className="p-3.5 rounded-xl bg-[#151B32] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>ACTIVE PROFILE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF5A] animate-pulse" />
          </div>
          <button
            onClick={onOpenSetup}
            className="w-full text-left font-display font-bold text-sm text-white hover:text-[#50E3FF] transition-colors flex items-center justify-between group"
          >
            <span className="truncate">{currentSection.name}</span>
            <span className="text-[10px] font-mono text-[#50E3FF] group-hover:underline">Switch</span>
          </button>
          <div className="text-[11px] font-mono text-slate-400 truncate">
            {currentSection.venue}
          </div>
        </div>

        {/* Navigation List */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-3 block mb-2">
            NAVIGATION
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-[#151B32] text-[#50E3FF] border border-[#50E3FF]/30 shadow-[0_0_12px_rgba(80,227,255,0.15)] font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-[#151B32]/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#50E3FF]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold"
                    style={{
                      backgroundColor: `${item.badgeColor}20`,
                      color: item.badgeColor,
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
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        
        {/* Attendance Advisor Launcher Button */}
        <button
          onClick={onOpenAdvisor}
          className="w-full p-3 rounded-xl bg-gradient-to-r from-[#151B32] to-[#1B223F] border border-[#50E3FF]/30 hover:border-[#50E3FF] flex items-center gap-2.5 text-left group transition-all"
        >
          <div className="w-7 h-7 rounded-lg bg-[#50E3FF]/15 text-[#50E3FF] flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-display font-bold text-white group-hover:text-[#50E3FF] transition-colors truncate">
              ATTENDANCE ADVISOR
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate">
              Ask before you miss a class
            </div>
          </div>
        </button>

        {/* Target Threshold Selector */}
        <div className="p-2.5 rounded-xl bg-[#151B32] border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>TARGET BENCHMARK</span>
            <span className="text-[#B7FF5A] font-bold">{state.targetPercentage}%</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {([75, 80, 85, 90] as TargetPercentage[]).map((t) => (
              <button
                key={t}
                onClick={() => setTargetPercentage(t)}
                className={`py-1 rounded text-[11px] font-mono font-bold transition-colors ${
                  state.targetPercentage === t
                    ? 'bg-[#B7FF5A] text-[#0B1020]'
                    : 'text-slate-400 hover:text-white bg-[#0B1020]'
                }`}
              >
                {t}%
              </button>
            ))}
          </div>
        </div>

        {/* Settings & Landing Links */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <button
            onClick={() => setCurrentTab('landing')}
            className="hover:text-white flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="hover:text-white flex items-center gap-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

      </div>

    </aside>
  );
};
