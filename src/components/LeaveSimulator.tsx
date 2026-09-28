import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  LeaveType,
  ODPolicy,
  MLPolicy,
  LeaveSimulationRequest,
  LeaveSimulationResult,
  simulateLeave,
  getScheduledClassesInDateRange,
} from '../utils/leaveSimulator';
import {
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Clock,
  Zap,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  HelpCircle,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';

export const LeaveSimulator: React.FC = () => {
  const {
    currentSection,
    state,
    overallCalculation,
    remainingFromTimetable,
    setODPolicy,
    setMLPolicy,
    setMaxODSessionsAllowed,
    activeSimulation,
    applySimulation,
    resetSimulation,
    savedScenarios,
    saveScenario,
    deleteScenario,
  } = useAttendance();

  // Form State for new simulation
  const [leaveType, setLeaveType] = useState<LeaveType>('on_duty');
  const [targetSubject, setTargetSubject] = useState<string>('all');
  const [reason, setReason] = useState<string>('IEEE National Technical Symposium');

  // Dates: default to next week for planning
  const [startDate, setStartDate] = useState<string>(() => {
    const cur = new Date(state.currentDate);
    cur.setDate(cur.getDate() + 3);
    return cur.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState<string>(() => {
    const cur = new Date(state.currentDate);
    cur.setDate(cur.getDate() + 5);
    return cur.toISOString().split('T')[0];
  });

  const [scenarioName, setScenarioName] = useState<string>('Upcoming 3-Day On-Duty Simulation');
  const [activeTab, setActiveTab] = useState<'simulator' | 'comparison' | 'history'>('simulator');

  // Compute live preview of the current simulation request
  const currentRequest: LeaveSimulationRequest = useMemo(() => {
    return {
      id: `sim_${Date.now()}`,
      name: scenarioName,
      leaveType,
      startDate,
      endDate,
      targetSubjectCode: targetSubject,
      reason,
      odPolicy: state.odPolicy,
      mlPolicy: state.mlPolicy,
      maxODSessionsAllowed: state.maxODSessionsAllowed,
    };
  }, [scenarioName, leaveType, startDate, endDate, targetSubject, reason, state.odPolicy, state.mlPolicy, state.maxODSessionsAllowed]);

  const currentInputsMap = useMemo(() => {
    const map: Record<string, { conductedClasses: number; attendedClasses: number }> = {};
    overallCalculation.subjectResults.forEach((s) => {
      map[s.subjectCode] = { conductedClasses: s.conductedClasses, attendedClasses: s.attendedClasses };
    });
    return map;
  }, [overallCalculation]);

  const liveSimulationResult: LeaveSimulationResult = useMemo(() => {
    return simulateLeave(
      currentSection,
      currentRequest,
      currentInputsMap,
      remainingFromTimetable,
      state.targetPercentage
    );
  }, [currentSection, currentRequest, currentInputsMap, remainingFromTimetable, state.targetPercentage]);

  // Compute side-by-side policy results for Medical Leave and OD
  const policyA_Result = useMemo(() => {
    const req: LeaveSimulationRequest = { ...currentRequest, odPolicy: 'counts_attended', mlPolicy: 'approved_credit' };
    return simulateLeave(currentSection, req, currentInputsMap, remainingFromTimetable, state.targetPercentage);
  }, [currentSection, currentRequest, currentInputsMap, remainingFromTimetable, state.targetPercentage]);

  const policyB_Result = useMemo(() => {
    const req: LeaveSimulationRequest = { ...currentRequest, odPolicy: 'not_attended', mlPolicy: 'ordinary_absence' };
    return simulateLeave(currentSection, req, currentInputsMap, remainingFromTimetable, state.targetPercentage);
  }, [currentSection, currentRequest, currentInputsMap, remainingFromTimetable, state.targetPercentage]);

  const handleApply = () => {
    applySimulation(liveSimulationResult);
    saveScenario(liveSimulationResult);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#E5C07B] uppercase tracking-widest mb-1.5 font-medium">
            <Zap className="w-4 h-4 text-[#B7FF5A]" />
            <span>EXEMPTION & ABSENCE MODELING</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#FAF8F2] tracking-tight">
            THE LEAVE SIMULATOR
          </h1>
          <p className="text-slate-400 font-sans text-sm mt-1 max-w-2xl">
            Model the exact impact of on-duty permissions, medical leaves, and personal absences on your semester before submitting them.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0D1527] border border-white/[0.08] rounded-2xl text-xs font-mono shadow-sm">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'simulator'
                ? 'bg-[#FAF8F2] text-[#080D1A] font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Simulator
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'comparison'
                ? 'bg-[#E5C07B] text-[#080D1A] font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Policy Comparison
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-[#50E3FF] text-[#080D1A] font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Saved Scenarios ({savedScenarios.length})
          </button>
        </div>
      </div>

      {/* Active Simulation Status Alert */}
      {activeSimulation && (
        <div className="p-5 rounded-2xl bg-[#50E3FF]/10 border border-[#50E3FF]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-[#50E3FF] shrink-0" />
            <div>
              <span className="font-bold text-[#FAF8F2] uppercase text-sm">
                SIMULATION CURRENTLY APPLIED: {activeSimulation.request.name}
              </span>
              <p className="text-slate-300 font-sans mt-0.5 text-xs">
                Affecting {activeSimulation.totalClassesAffected} classes. Dashboard telemetry across all views reflects this hypothetical scenario.
              </p>
            </div>
          </div>

          <button
            onClick={resetSimulation}
            className="px-4 py-2 rounded-xl bg-[#FF5263]/15 border border-[#FF5263]/40 text-[#FF5263] hover:bg-[#FF5263]/25 flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Simulation</span>
          </button>
        </div>
      )}

      {/* TAB 1: LIVE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Simulation Parameter Form */}
          <div className="lg:col-span-5 rounded-3xl bg-[#0D1527]/85 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-7 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="border-b border-white/[0.08] pb-4">
              <h3 className="font-display font-bold text-lg text-[#FAF8F2]">
                SIMULATION PARAMETERS
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Active Section: <strong className="text-slate-200">{currentSection.name}</strong>
              </p>
            </div>

            {/* Leave Type Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-medium">
                LEAVE CATEGORY
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setLeaveType('on_duty');
                    setReason('IEEE International Conference Presentation');
                    setScenarioName('Academic On-Duty Exemption');
                  }}
                  className={`py-2.5 px-1 rounded-xl border text-center transition-all ${
                    leaveType === 'on_duty'
                      ? 'bg-[#50E3FF] text-[#080D1A] border-[#50E3FF] font-bold shadow-[0_0_15px_rgba(80,227,255,0.3)]'
                      : 'bg-[#080D1A] text-slate-300 border-white/[0.08] hover:border-white/[0.2]'
                  }`}
                >
                  On-Duty (OD)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLeaveType('medical_leave');
                    setReason('Medical Treatment / Illness');
                    setScenarioName('Medical Leave Simulation');
                  }}
                  className={`py-2.5 px-1 rounded-xl border text-center transition-all ${
                    leaveType === 'medical_leave'
                      ? 'bg-[#B7FF5A] text-[#080D1A] border-[#B7FF5A] font-bold shadow-[0_0_15px_rgba(183,255,90,0.3)]'
                      : 'bg-[#080D1A] text-slate-300 border-white/[0.08] hover:border-white/[0.2]'
                  }`}
                >
                  Medical Leave
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLeaveType('ordinary_absence');
                    setReason('Personal Emergency / Family Function');
                    setScenarioName('Personal Absence Simulation');
                  }}
                  className={`py-2.5 px-1 rounded-xl border text-center transition-all ${
                    leaveType === 'ordinary_absence'
                      ? 'bg-[#FFB84D] text-[#080D1A] border-[#FFB84D] font-bold shadow-[0_0_15px_rgba(255,184,77,0.3)]'
                      : 'bg-[#080D1A] text-slate-300 border-white/[0.08] hover:border-white/[0.2]'
                  }`}
                >
                  Absence
                </button>
              </div>
            </div>

            {/* Scope: Specific Subject or All Subjects */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-medium">
                COURSE SCOPE
              </label>
              <select
                value={targetSubject}
                onChange={(e) => setTargetSubject(e.target.value)}
                className="w-full bg-[#080D1A] border border-white/[0.1] text-white rounded-xl px-3.5 py-2.5 text-xs font-mono focus:border-[#E5C07B] focus:outline-none cursor-pointer"
              >
                <option value="all">All Scheduled Courses in Date Range</option>
                {currentSection.subjects.map((sub) => (
                  <option key={sub.code} value={sub.code}>
                    {sub.slot}: {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1 font-medium">
                  START DATE
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#080D1A] border border-white/[0.1] text-white rounded-xl px-3.5 py-2 text-xs font-mono focus:border-[#E5C07B] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1 font-medium">
                  END DATE
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#080D1A] border border-white/[0.1] text-white rounded-xl px-3.5 py-2 text-xs font-mono focus:border-[#E5C07B] focus:outline-none"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1 font-medium">
                REASON / OFFICIAL DOCUMENTATION
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#080D1A] border border-white/[0.1] text-white rounded-xl px-3.5 py-2 text-xs font-mono focus:border-[#E5C07B] focus:outline-none"
              />
            </div>

            {/* Institutional Policy Settings */}
            <div className="p-4 rounded-2xl bg-[#080D1A]/95 border border-white/[0.08] space-y-3.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[#FAF8F2] font-bold">INSTITUTIONAL POLICY RULES</span>
                <span className="text-[10px] text-[#E5C07B]">SRM IST Standard</span>
              </div>

              {leaveType === 'on_duty' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">OD Credit Rule:</span>
                    <select
                      value={state.odPolicy}
                      onChange={(e) => setODPolicy(e.target.value as ODPolicy)}
                      className="bg-[#0D1527] border border-white/[0.1] text-xs font-mono text-[#50E3FF] rounded-lg px-2.5 py-1"
                    >
                      <option value="counts_attended">Policy A (Counts as Attended)</option>
                      <option value="not_attended">Policy B (No Attendance Credit)</option>
                      <option value="exempted">Policy C (Exempted Denominator)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Max OD Cap Allowed:</span>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={state.maxODSessionsAllowed}
                      onChange={(e) => setMaxODSessionsAllowed(parseInt(e.target.value) || 12)}
                      className="w-16 bg-[#0D1527] border border-white/[0.1] text-xs font-mono text-white rounded-lg px-2 py-1 text-center"
                    />
                  </div>
                </div>
              )}

              {leaveType === 'medical_leave' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Medical Policy:</span>
                    <select
                      value={state.mlPolicy}
                      onChange={(e) => setMLPolicy(e.target.value as MLPolicy)}
                      className="bg-[#0D1527] border border-white/[0.1] text-xs font-mono text-[#B7FF5A] rounded-lg px-2.5 py-1"
                    >
                      <option value="ordinary_absence">Ordinary Absence (Standard)</option>
                      <option value="approved_credit">Approved Attendance Credit</option>
                      <option value="exempted">Exempted from Denominator</option>
                    </select>
                  </div>
                </div>
              )}

              {leaveType === 'ordinary_absence' && (
                <p className="text-[11px] text-slate-400 font-sans">
                  Standard absence: Every scheduled timetable period in the selected date range is counted as missed without attendance credit.
                </p>
              )}
            </div>

            {/* Apply & Save Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleApply}
                className="w-full py-3.5 rounded-2xl bg-[#B7FF5A] text-[#080D1A] font-display font-bold text-xs tracking-wider hover:bg-[#a6f343] transition-all flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(183,255,90,0.25)] transform hover:-translate-y-0.5"
              >
                <span>APPLY SIMULATION TO DASHBOARD</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => saveScenario(liveSimulationResult)}
                className="w-full py-3 rounded-2xl bg-[#080D1A] border border-white/[0.1] text-slate-200 font-mono text-xs hover:bg-[#131D35] flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Save to Scenario Library</span>
              </button>
            </div>
          </div>

          {/* Right Column: Real-Time Attendance Impact Display */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Impact Telemetry Card */}
            <div className="rounded-3xl bg-[#0D1527]/85 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
                <div>
                  <span className="text-[11px] font-mono text-[#50E3FF] uppercase tracking-wider block font-semibold">
                    REAL-TIME TIMETABLE SIMULATION
                  </span>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#FAF8F2] mt-0.5">
                    YOUR ATTENDANCE IMPACT
                  </h3>
                </div>

                <span
                  className={`self-start sm:self-auto px-4 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border ${
                    liveSimulationResult.isOverallIrreversible
                      ? 'bg-[#FF5263]/15 text-[#FF5263] border-[#FF5263]'
                      : liveSimulationResult.isOverallDangerZone
                      ? 'bg-[#FFB84D]/15 text-[#FFB84D] border-[#FFB84D]'
                      : 'bg-[#B7FF5A]/15 text-[#B7FF5A] border-[#B7FF5A]'
                  }`}
                >
                  {liveSimulationResult.isOverallIrreversible
                    ? 'RECOVERY IMPOSSIBLE'
                    : liveSimulationResult.isOverallDangerZone
                    ? 'DANGER ZONE RISK'
                    : 'RECOVERY POSSIBLE'}
                </span>
              </div>

              {/* Numerical Comparison Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-4 bg-[#080D1A]/90 rounded-2xl border border-white/[0.06] shadow-sm">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block">CURRENT STANDING</span>
                  <span className="font-display font-extrabold text-2xl sm:text-3xl text-[#FAF8F2] block mt-1 tabular-nums">
                    {liveSimulationResult.overallBeforePercentage}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">before leave</span>
                </div>

                <div className="p-4 bg-[#080D1A]/90 rounded-2xl border border-white/[0.06] shadow-sm">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block">PROJECTED STANDING</span>
                  <span
                    className="font-display font-extrabold text-2xl sm:text-3xl block mt-1 tabular-nums"
                    style={{
                      color:
                        liveSimulationResult.overallAfterPercentage >= state.targetPercentage
                          ? '#B7FF5A'
                          : '#FF5263',
                    }}
                  >
                    {liveSimulationResult.overallAfterPercentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Δ {liveSimulationResult.overallDelta >= 0 ? '+' : ''}{liveSimulationResult.overallDelta}%
                  </span>
                </div>

                <div className="p-4 bg-[#080D1A]/90 rounded-2xl border border-white/[0.06] shadow-sm">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block">CLASSES AFFECTED</span>
                  <span className="font-display font-extrabold text-2xl sm:text-3xl text-[#50E3FF] block mt-1 tabular-nums">
                    {liveSimulationResult.totalClassesAffected}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    exact timetable periods
                  </span>
                </div>

                <div className="p-4 bg-[#080D1A]/90 rounded-2xl border border-white/[0.06] shadow-sm">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block">RECOVERY MANDATE</span>
                  <span
                    className="font-display font-extrabold text-2xl sm:text-3xl block mt-1 tabular-nums"
                    style={{
                      color:
                        liveSimulationResult.overallRequiredRecovery > 0 ? '#FFB84D' : '#B7FF5A',
                    }}
                  >
                    {liveSimulationResult.overallRequiredRecovery > 0
                      ? `${liveSimulationResult.overallRequiredRecovery}`
                      : '0'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    consecutive classes
                  </span>
                </div>
              </div>

              {/* Policy explanation banner */}
              <div className="p-4 bg-[#080D1A]/90 rounded-2xl border border-white/[0.08] text-xs font-mono text-slate-300">
                <span className="text-[#E5C07B] font-bold">Policy Note: </span>
                {liveSimulationResult.policyAppliedDescription}
              </div>

              {/* Warning if irreversible */}
              {liveSimulationResult.isOverallIrreversible && (
                <div className="p-5 bg-[#FF5263]/10 border border-[#FF5263]/50 rounded-2xl text-xs text-white space-y-1.5 shadow-lg">
                  <div className="flex items-center gap-2 font-bold text-[#FF5263] text-sm">
                    <ShieldAlert className="w-5 h-5" />
                    <span>IRREVERSIBLE DETENTION WARNING</span>
                  </div>
                  <p className="text-slate-200 font-sans leading-relaxed">
                    Applying this leave will make achieving your {state.targetPercentage}% attendance benchmark mathematically impossible before the semester deadline.
                  </p>
                </div>
              )}

              {/* Affected Timetable Periods List */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#FAF8F2] font-bold">SCHEDULED PERIODS AFFECTED ({liveSimulationResult.totalClassesAffected})</span>
                  <span className="text-slate-400 text-[11px]">
                    Extracted from {currentSection.name} weekly timetable
                  </span>
                </div>

                {liveSimulationResult.affectedSessions.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                    {liveSimulationResult.affectedSessions.map((sess, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#080D1A]/90 border border-white/[0.06] flex items-center justify-between hover:border-white/[0.12] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-[#E5C07B]" />
                          <span className="text-white font-bold">{sess.date} ({sess.dayOfWeek})</span>
                          <span className="text-slate-400">P{sess.period} ({sess.time})</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-200 truncate max-w-[140px] sm:max-w-xs">{sess.subjectName}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                              sess.countsAsAttended
                                ? 'bg-[#B7FF5A]/20 text-[#B7FF5A] border border-[#B7FF5A]/30'
                                : 'bg-[#FF5263]/20 text-[#FF5263] border border-[#FF5263]/30'
                            }`}
                          >
                            {sess.countsAsAttended ? 'CREDITED' : 'ABSENT'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#080D1A]/90 border border-white/[0.06] text-center text-xs font-mono text-slate-400">
                    No classes scheduled during the selected date range.
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB 2: SIDE-BY-SIDE POLICY COMPARISON */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="border-b border-white/[0.08] pb-4">
            <h3 className="font-display font-bold text-2xl text-[#FAF8F2]">
              INSTITUTIONAL POLICY COMPARATOR
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Side-by-side comparison of attendance outcomes under different university leave rules for {scenarioName}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Policy A Card */}
            <div className="p-7 rounded-3xl bg-[#0D1527]/85 backdrop-blur-2xl border border-[#B7FF5A]/40 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-[#B7FF5A]/15 text-[#B7FF5A] font-mono text-xs font-bold border border-[#B7FF5A]/30">
                  POLICY A (APPROVED CREDIT)
                </span>
                <span className="text-xs font-mono text-slate-400">Approved OD / Medical Exemption</span>
              </div>

              <div className="font-display font-bold text-4xl text-white tabular-nums">
                {policyA_Result.overallAfterPercentage}%
                <span className="text-sm font-mono text-[#B7FF5A] ml-2 font-normal">
                  (Δ {policyA_Result.overallDelta >= 0 ? '+' : ''}{policyA_Result.overallDelta}%)
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-slate-400">Classes affected:</span>
                  <span className="text-white font-bold">{policyA_Result.totalClassesAffected} classes</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-slate-400">Recovery classes needed:</span>
                  <span className="text-[#B7FF5A] font-bold">{policyA_Result.overallRequiredRecovery} classes</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-slate-400">Semester-end potential:</span>
                  <span className="text-white font-bold">{policyA_Result.overallProjectedEndPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Assessment:</span>
                  <span className="text-[#B7FF5A] font-bold">Safe Exemption</span>
                </div>
              </div>
            </div>

            {/* Policy B Card */}
            <div className="p-7 rounded-3xl bg-[#0D1527]/85 backdrop-blur-2xl border border-[#FF5263]/40 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-[#FF5263]/15 text-[#FF5263] font-mono text-xs font-bold border border-[#FF5263]/30">
                  POLICY B (ORDINARY ABSENCE)
                </span>
                <span className="text-xs font-mono text-slate-400">Uncredited Absence Rule</span>
              </div>

              <div className="font-display font-bold text-4xl text-white tabular-nums">
                {policyB_Result.overallAfterPercentage}%
                <span className="text-sm font-mono text-[#FF5263] ml-2 font-normal">
                  (Δ {policyB_Result.overallDelta}%)
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-slate-400">Classes affected:</span>
                  <span className="text-white font-bold">{policyB_Result.totalClassesAffected} classes</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-slate-400">Recovery classes needed:</span>
                  <span className="text-[#FFB84D] font-bold">{policyB_Result.overallRequiredRecovery} classes</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-slate-400">Semester-end potential:</span>
                  <span className="text-white font-bold">{policyB_Result.overallProjectedEndPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Assessment:</span>
                  <span className="text-[#FF5263] font-bold">
                    {policyB_Result.isOverallIrreversible ? 'Detention Risk' : 'Caution Required'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: SAVED SCENARIOS LIBRARY */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h3 className="font-display font-bold text-2xl text-[#FAF8F2]">
                SAVED LEAVE SCENARIOS
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Saved simulation profiles persisted in local storage.
              </p>
            </div>
            {savedScenarios.length > 0 && (
              <span className="text-xs font-mono text-[#E5C07B]">
                {savedScenarios.length} scenarios on file
              </span>
            )}
          </div>

          {savedScenarios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {savedScenarios.map((sc, idx) => (
                <div
                  key={sc.request.id || idx}
                  className="p-6 rounded-3xl bg-[#0D1527]/85 backdrop-blur-2xl border border-white/[0.08] flex flex-col justify-between space-y-5 shadow-xl hover:border-white/[0.15] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-[#080D1A] text-[#E5C07B] font-bold uppercase border border-[#E5C07B]/20">
                        {sc.request.leaveType.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => deleteScenario(sc.request.id || '')}
                        className="text-slate-400 hover:text-[#FF5263] p-1.5 rounded-lg transition-colors"
                        title="Delete scenario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-display font-bold text-lg text-[#FAF8F2] mt-3">
                      {sc.request.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 font-sans">
                      {sc.request.startDate} to {sc.request.endDate} · {sc.totalClassesAffected} classes
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">PROJECTED STANDING</span>
                      <span className="font-bold text-xl text-white tabular-nums">{sc.overallAfterPercentage}%</span>
                    </div>

                    <button
                      onClick={() => applySimulation(sc)}
                      className="px-4 py-2 rounded-xl bg-[#FAF8F2] text-[#080D1A] font-bold text-xs hover:bg-white transition-all shadow-sm"
                    >
                      Apply Scenario
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-14 text-center bg-[#0D1527]/60 border border-white/[0.08] rounded-3xl space-y-2">
              <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm text-slate-300 font-semibold font-display">
                No saved scenarios yet
              </p>
              <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
                Simulate a leave scenario in the Live Simulator tab and click "Save to Scenario Library" to compare it anytime.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
