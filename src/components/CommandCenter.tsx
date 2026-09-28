import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceCore } from './AttendanceCore';
import { SubjectIntelligenceCard } from './SubjectIntelligenceCard';
import { SubjectDetailModal } from './SubjectDetailModal';
import { SubjectCalculationResult } from '../utils/attendanceEngine';
import {
  ShieldAlert,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  Calendar,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface CommandCenterProps {
  onNavigateToRecovery: () => void;
  onNavigateToTimeMachine: () => void;
  onOpenSetup: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onNavigateToRecovery,
  onNavigateToTimeMachine,
  onOpenSetup,
}) => {
  const {
    overallCalculation,
    simulatedCalculation,
    isSimulationActive,
    activeSimulation,
    resetSimulation,
    currentSection,
    state,
  } = useAttendance();
  const [selectedSubject, setSelectedSubject] = useState<SubjectCalculationResult | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'caution' | 'safe'>('all');

  const displayCalc = isSimulationActive ? simulatedCalculation : overallCalculation;

  const formattedCurrentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(state.currentDate));

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(state.endDate).getTime() - new Date(state.currentDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const filteredSubjects = overallCalculation.subjectResults.filter((sub) => {
    if (statusFilter === 'all') return true;
    return sub.zone === statusFilter;
  });

  const criticalSubject = overallCalculation.subjectResults.find((s) => s.isIrreversibleDetention);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#50E3FF] uppercase tracking-widest mb-1">
            <span className="w-2 h-2 rounded-full bg-[#B7FF5A] animate-pulse" />
            <span>ACADEMIC MISSION CONTROL</span>
            <span>·</span>
            <span>{currentSection.name}</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            GOOD DAY, STUDENT.
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            YOUR SEMESTER STATUS — Real-time predictive telemetry for SRM Institute Odd Semester 2026.
          </p>
        </div>

        {/* Live Date and Semester Countdown display */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-[#151B32] border border-slate-800 flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-[#50E3FF]" />
            <span>{formattedCurrentDate}</span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-[#151B32] border border-[#B7FF5A]/30 flex items-center gap-2 text-[#B7FF5A]">
            <Clock className="w-4 h-4" />
            <span className="font-bold">{daysLeft} DAYS</span>
            <span className="text-slate-400">until semester end</span>
          </div>
        </div>
      </div>

      {/* Active Leave Simulation Banner */}
      {isSimulationActive && activeSimulation && (
        <div className="p-4 rounded-xl bg-[#FFB84D]/10 border border-[#FFB84D]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-[#FFB84D] shrink-0" />
            <div>
              <span className="font-bold text-white uppercase">
                ACTIVE LEAVE OVERLAY: {activeSimulation.request.name}
              </span>
              <p className="text-slate-300 font-sans mt-0.5">
                Simulating {activeSimulation.totalClassesAffected} affected classes ({activeSimulation.request.startDate} to {activeSimulation.request.endDate}). Projected attendance is <strong>{displayCalc.currentPercentage.toFixed(1)}%</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={resetSimulation}
            className="px-3 py-1.5 rounded-lg bg-[#FFB84D]/20 text-[#FFB84D] hover:bg-[#FFB84D]/30 shrink-0 font-bold"
          >
            Reset Leave Simulation
          </button>
        </div>
      )}

      {/* Irreversible Detention Alert Banner (Only shown if mathematical calculation confirms detention is irreversible) */}
      {criticalSubject && (
        <div className="relative overflow-hidden rounded-2xl bg-[#FF5263]/10 border-2 border-[#FF5263] p-6 shadow-[0_0_30px_rgba(255,82,99,0.3)] animate-[pulse_4s_ease-in-out_infinite]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FF5263] text-white flex items-center justify-center shrink-0 shadow-lg">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF5263] text-white uppercase">
                    SYSTEM ALERT
                  </span>
                  <h3 className="font-display font-bold text-lg text-white">
                    IRREVERSIBLE DETENTION ALERT: {criticalSubject.subjectName}
                  </h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
                  Even with perfect attendance in every remaining scheduled class, the selected attendance target
                  of <strong>{criticalSubject.targetPercentage}%</strong> cannot be reached before the deadline
                  (Max achievable: <strong>{criticalSubject.maxAchievablePercentage}%</strong>).
                  Immediate academic faculty intervention or formal medical waiver is required.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-2 text-slate-300">
                  <span>Current: <strong className="text-[#FF5263]">{criticalSubject.currentPercentage.toFixed(1)}%</strong></span>
                  <span>·</span>
                  <span>Required Target: <strong className="text-white">{criticalSubject.targetPercentage}%</strong></span>
                  <span>·</span>
                  <span>Max Achievable: <strong className="text-[#FFB84D]">{criticalSubject.maxAchievablePercentage}%</strong></span>
                  <span>·</span>
                  <span>Remaining Classes: <strong className="text-[#50E3FF]">{criticalSubject.remainingClasses}</strong></span>
                  <span>·</span>
                  <span>Checkpoint: <strong className="text-white">{state.checkpointDate}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={onNavigateToRecovery}
              className="px-5 py-2.5 rounded-xl bg-[#FF5263] text-white font-display font-bold text-xs tracking-wider hover:bg-[#ff3b4f] transition-colors shrink-0 flex items-center gap-2 shadow-lg"
            >
              <span>OPEN RECOVERY MISSION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Attendance Core Component */}
      <AttendanceCore />

      {/* Subject Intelligence Grid Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-xl text-white">
              SUBJECT INTELLIGENCE GRID
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Course-by-course predictive analytics. Click any card to launch detailed recovery simulations.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#151B32] border border-slate-800 rounded-xl text-xs font-mono">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-[#0B1020] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({overallCalculation.subjectResults.length})
            </button>
            <button
              onClick={() => setStatusFilter('critical')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'critical'
                  ? 'bg-[#FF5263] text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Critical ({overallCalculation.criticalSubjectsCount})
            </button>
            <button
              onClick={() => setStatusFilter('caution')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'caution'
                  ? 'bg-[#FFB84D] text-[#0B1020] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Caution ({overallCalculation.cautionSubjectsCount})
            </button>
            <button
              onClick={() => setStatusFilter('safe')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'safe'
                  ? 'bg-[#B7FF5A] text-[#0B1020] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Safe ({overallCalculation.safeSubjectsCount})
            </button>
          </div>
        </div>

        {/* Grid of Subject Intelligence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((res) => (
            <SubjectIntelligenceCard
              key={res.subjectCode}
              result={res}
              onClick={() => setSelectedSubject(res)}
            />
          ))}
        </div>
      </div>

      {/* Feature Navigation Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        
        <div
          onClick={onNavigateToRecovery}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigateToRecovery()}
          className="p-6 rounded-2xl bg-gradient-to-br from-[#151B32] to-[#1B223F] border border-[#50E3FF]/20 hover:border-[#50E3FF]/50 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#50E3FF]">
              <Zap className="w-4 h-4" />
              <span>THE RECOVERY ENGINE</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white group-hover:text-[#50E3FF] transition-colors">
              Calculate Your Minimum Recovery Mission
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Compute exact consecutive classes needed to return to 75%, 80%, or 90% attendance.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-[#50E3FF] transform group-hover:translate-x-1.5 transition-transform shrink-0" />
        </div>

        <div
          onClick={onNavigateToTimeMachine}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigateToTimeMachine()}
          className="p-6 rounded-2xl bg-gradient-to-br from-[#151B32] to-[#1B223F] border border-[#B7FF5A]/20 hover:border-[#B7FF5A]/50 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#B7FF5A]">
              <Sparkles className="w-4 h-4" />
              <span>THE TIME MACHINE</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white group-hover:text-[#B7FF5A] transition-colors">
              Travel Through Your Semester
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Simulate future dates, plan skips safely, and visualize attendance trajectories before classes occur.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-[#B7FF5A] transform group-hover:translate-x-1.5 transition-transform shrink-0" />
        </div>

      </div>

      {/* Subject Detail Drawer / Modal */}
      <SubjectDetailModal
        subjectResult={selectedSubject}
        onClose={() => setSelectedSubject(null)}
      />
    </div>
  );
};
