import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { calculateCurrentAttendance } from '../utils/attendanceEngine';

export const TimeMachinePlanner: React.FC = () => {
  const {
    state,
    currentSection,
    occurrences,
    overallCalculation,
    setTimeMachineScenario,
    setFuturePlanForClass,
    bulkSetFuturePlan,
  } = useAttendance();

  // Selected date on horizontal timeline (default: 2 weeks ahead or checkpoint date)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const cur = new Date(state.currentDate);
    cur.setDate(cur.getDate() + 14);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Distinct future dates with classes
  const futureOccurrences = useMemo(() => {
    return occurrences.filter((o) => !o.isCompleted && !o.isHoliday);
  }, [occurrences]);

  const uniqueFutureDates = useMemo(() => {
    const set = new Set<string>();
    futureOccurrences.forEach((o) => set.add(o.date));
    return Array.from(set).sort();
  }, [futureOccurrences]);

  // Make sure selectedDate is valid
  const activeDate = uniqueFutureDates.includes(selectedDate)
    ? selectedDate
    : uniqueFutureDates[0] || state.endDate;

  // Occurrences up to activeDate
  const occurrencesUpToDate = useMemo(() => {
    return futureOccurrences.filter((o) => o.date <= activeDate);
  }, [futureOccurrences, activeDate]);

  // Calculations for selected date:
  const baseAttended = overallCalculation.totalAttended;
  const baseConducted = overallCalculation.totalConducted;

  // 1. Scenario: Perfect attendance up to activeDate
  const countScheduledUpToDate = occurrencesUpToDate.length;
  const attendedIfPerfect = baseAttended + countScheduledUpToDate;
  const conductedUpToDate = baseConducted + countScheduledUpToDate;
  const pctIfPerfect = calculateCurrentAttendance(attendedIfPerfect, conductedUpToDate);

  // 2. Scenario: Miss all up to activeDate
  const attendedIfMissed = baseAttended;
  const pctIfMissed = calculateCurrentAttendance(attendedIfMissed, conductedUpToDate);

  // 3. User's actual custom plan projection
  const customPlannedAttended = futureOccurrences.filter((o) => o.planStatus === 'attend').length;
  const customPlannedConducted = futureOccurrences.filter(
    (o) => o.planStatus === 'attend' || o.planStatus === 'absent'
  ).length;

  const projectedFinalAttended = baseAttended + customPlannedAttended;
  const projectedFinalConducted = baseConducted + customPlannedConducted;
  const projectedFinalPct =
    projectedFinalConducted > 0
      ? (projectedFinalAttended / projectedFinalConducted) * 100
      : baseAttended / baseConducted * 100;

  // Active classes on selectedDate
  const classesOnSelectedDate = futureOccurrences.filter((o) => {
    if (o.date !== activeDate) return false;
    if (filterSubject !== 'all' && o.subjectCode !== filterSubject) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#E5C07B] uppercase tracking-widest mb-1.5 font-medium">
            <Sparkles className="w-4 h-4 text-[#B7FF5A]" />
            <span>FUTURISTIC CHRONO-PLANNER</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#FAF8F2] tracking-tight">
            THE TIME MACHINE
          </h1>
          <p className="text-slate-400 font-sans text-sm mt-1 max-w-2xl">
            Simulate your semester before it happens. Test skip decisions, verify attendance trajectories, and secure your final grade.
          </p>
        </div>

        {/* 3 Main Scenario Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0D1527] border border-white/[0.08] rounded-2xl text-xs font-mono shadow-sm">
          <button
            onClick={() => setTimeMachineScenario('perfect')}
            className={`px-4 py-2 rounded-xl transition-all ${
              state.timeMachineScenario === 'perfect'
                ? 'bg-[#B7FF5A] text-[#080D1A] font-bold shadow-[0_0_15px_rgba(183,255,90,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PERFECT ATTENDANCE
          </button>
          <button
            onClick={() => setTimeMachineScenario('miss_all')}
            className={`px-4 py-2 rounded-xl transition-all ${
              state.timeMachineScenario === 'miss_all'
                ? 'bg-[#FF5263] text-white font-bold shadow-[0_0_15px_rgba(255,82,99,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            WHAT IF I MISS?
          </button>
          <button
            onClick={() => setTimeMachineScenario('custom')}
            className={`px-4 py-2 rounded-xl transition-all ${
              state.timeMachineScenario === 'custom'
                ? 'bg-[#FAF8F2] text-[#080D1A] font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            BUILD MY OWN PLAN
          </button>
        </div>
      </div>

      {/* Horizontal Interactive Timeline Strip */}
      <div className="rounded-3xl bg-[#0D1527]/85 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-[#FAF8F2] font-semibold">
            <Clock className="w-4 h-4 text-[#E5C07B]" />
            <span>SEMESTER TIME TRAVEL SCRUBBER</span>
          </div>
          <span className="text-[#50E3FF]">
            Selected Destination: <strong className="text-white">{activeDate}</strong> ({countScheduledUpToDate} future classes to date)
          </span>
        </div>

        {/* Scrollable Date Nodes */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-2.5 min-w-max py-2">
            {uniqueFutureDates.map((d) => {
              const isSelected = d === activeDate;
              const dateObj = new Date(d + 'T00:00:00');
              const dayStr = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`px-3.5 py-2.5 rounded-2xl border text-center font-mono transition-all flex flex-col items-center ${
                    isSelected
                      ? 'bg-[#FAF8F2] text-[#080D1A] border-[#FAF8F2] font-bold shadow-[0_0_20px_rgba(250,248,242,0.3)] scale-105'
                      : 'bg-[#080D1A] text-slate-300 border-white/[0.06] hover:border-white/[0.18]'
                  }`}
                >
                  <span className="text-[10px] uppercase opacity-75">{dayStr}</span>
                  <span className="text-xs font-bold whitespace-nowrap mt-0.5">{monthDay}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline Projections Matrix for Selected Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
          
          <div className="p-5 rounded-2xl bg-[#080D1A]/90 border border-white/[0.06] shadow-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">CLASSES TO DATE</span>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#FAF8F2] tabular-nums mt-1">
              +{countScheduledUpToDate}
            </div>
            <span className="text-xs font-mono text-slate-400 block mt-1 font-sans">
              sessions between today & {activeDate}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#080D1A]/90 border border-white/[0.06] shadow-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">IF 100% ATTENDED</span>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#B7FF5A] tabular-nums mt-1">
              {pctIfPerfect.toFixed(1)}%
            </div>
            <span className="text-xs font-mono text-slate-400 block mt-1 font-sans">
              +{ (pctIfPerfect - overallCalculation.currentPercentage).toFixed(1) }% projected gain
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#080D1A]/90 border border-white/[0.06] shadow-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">IF MISSED ALL TO DATE</span>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#FF5263] tabular-nums mt-1">
              {pctIfMissed.toFixed(1)}%
            </div>
            <span className="text-xs font-mono text-slate-400 block mt-1 font-sans">
              -{ (overallCalculation.currentPercentage - pctIfMissed).toFixed(1) }% projected loss
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#080D1A]/90 border border-white/[0.06] shadow-sm">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">ACTIVE PLAN RESULT</span>
            <div
              className="font-display font-extrabold text-3xl sm:text-4xl tabular-nums mt-1"
              style={{
                color: projectedFinalPct >= state.targetPercentage ? '#B7FF5A' : '#FFB84D',
              }}
            >
              {projectedFinalPct.toFixed(1)}%
            </div>
            <span className="text-xs font-mono text-slate-400 block mt-1 font-sans">
              Target: {state.targetPercentage}%
            </span>
          </div>

        </div>
      </div>

      {/* Interactive Class Scheduler per Date (BUILD MY OWN PLAN) */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-[#FAF8F2] tracking-tight">
              SESSION DISPATCH: {activeDate}
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Toggle Attend or Absent for each class session to compute exact custom attendance predictions in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => bulkSetFuturePlan('attend')}
              className="px-4 py-2 rounded-xl bg-[#0D1527] border border-[#B7FF5A]/40 text-[#B7FF5A] text-xs font-mono hover:bg-[#131D35] transition-colors"
            >
              Mark All Attend
            </button>
            <button
              onClick={() => bulkSetFuturePlan('unplanned')}
              className="px-4 py-2 rounded-xl bg-[#0D1527] border border-white/[0.1] text-slate-300 text-xs font-mono hover:bg-[#131D35] transition-colors"
            >
              Reset Plan
            </button>
          </div>
        </div>

        {/* Classes Table / Cards on selected date */}
        {classesOnSelectedDate.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {classesOnSelectedDate.map((occ) => {
              const sub = currentSection.subjects.find((s) => s.code === occ.subjectCode);

              return (
                <div
                  key={occ.id}
                  className="p-5 rounded-3xl bg-[#0D1527]/85 backdrop-blur-xl border border-white/[0.08] flex flex-col justify-between space-y-5 shadow-xl hover:border-white/[0.15] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold tracking-wider"
                          style={{
                            backgroundColor: `${sub?.color || '#50E3FF'}18`,
                            color: sub?.color || '#50E3FF',
                            border: `1px solid ${sub?.color || '#50E3FF'}35`,
                          }}
                        >
                          SLOT {sub?.slot || 'A'}
                        </span>
                        <span className="text-xs font-mono text-slate-400 font-medium">{occ.subjectCode}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        Period {occ.period} ({occ.time})
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-lg text-[#FAF8F2] mt-2">
                      {sub?.name || occ.subjectCode}
                    </h4>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      {sub?.faculty} · Venue: {occ.room || currentSection.venue}
                    </p>
                  </div>

                  {/* 3 Interactive Scenario Action Buttons for This Class */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06] font-mono text-xs">
                    <button
                      onClick={() => setFuturePlanForClass(occ.id, 'attend')}
                      className={`flex-1 py-2 rounded-xl border text-center transition-all ${
                        occ.planStatus === 'attend'
                          ? 'bg-[#B7FF5A] text-[#080D1A] font-bold border-[#B7FF5A] shadow-[0_0_12px_rgba(183,255,90,0.3)]'
                          : 'bg-[#080D1A] text-slate-300 border-white/[0.06] hover:border-white/[0.2]'
                      }`}
                    >
                      ATTEND
                    </button>

                    <button
                      onClick={() => setFuturePlanForClass(occ.id, 'absent')}
                      className={`flex-1 py-2 rounded-xl border text-center transition-all ${
                        occ.planStatus === 'absent'
                          ? 'bg-[#FF5263] text-white font-bold border-[#FF5263] shadow-[0_0_12px_rgba(255,82,99,0.3)]'
                          : 'bg-[#080D1A] text-slate-300 border-white/[0.06] hover:border-white/[0.2]'
                      }`}
                    >
                      ABSENT
                    </button>

                    <button
                      onClick={() => setFuturePlanForClass(occ.id, 'unplanned')}
                      className={`flex-1 py-2 rounded-xl border text-center transition-all ${
                        occ.planStatus === 'unplanned'
                          ? 'bg-[#131D35] text-slate-400 border-white/[0.1]'
                          : 'bg-[#080D1A] text-slate-500 border-white/[0.06] hover:text-slate-300'
                      }`}
                    >
                      UNPLANNED
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-[#0D1527]/60 border border-white/[0.08] text-center space-y-2">
            <Calendar className="w-9 h-9 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-300 font-semibold font-display">
              No classes scheduled for {activeDate}
            </p>
            <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
              This day may be a weekend, university holiday, or timetable recess. Select another date from the scrubber above.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
