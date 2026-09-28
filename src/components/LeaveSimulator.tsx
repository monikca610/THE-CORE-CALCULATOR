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

  // Multi-policy side-by-side comparison modal or toggle
  const [showPolicyModal, setShowPolicyModal] = useState(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#50E3FF] uppercase tracking-widest mb-1">
            <Zap className="w-4 h-4 text-[#B7FF5A]" />
            <span>EXEMPTION & ABSENCE MODELING</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            THE LEAVE SIMULATOR
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Plan your leave before it impacts your semester. Tested against actual SRM timetables and institutional policies.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-[#151B32] border border-slate-800 rounded-xl text-xs font-mono">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'simulator'
                ? 'bg-[#B7FF5A] text-[#0B1020] font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Simulator
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'comparison'
                ? 'bg-[#50E3FF] text-[#0B1020] font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Policy Comparison
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-white text-[#0B1020] font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Saved Scenarios ({savedScenarios.length})
          </button>
        </div>
      </div>

      {/* Active Simulation Status Alert */}
      {activeSimulation && (
        <div className="p-4 rounded-xl bg-[#50E3FF]/10 border border-[#50E3FF]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#50E3FF] shrink-0" />
            <div>
              <span className="font-bold text-white uppercase">
                SIMULATION CURRENTLY APPLIED: {activeSimulation.request.name}
              </span>
              <p className="text-slate-300 font-sans mt-0.5">
                Affecting {activeSimulation.totalClassesAffected} classes. Dashboard values reflect this hypothetical scenario.
              </p>
            </div>
          </div>

          <button
            onClick={resetSimulation}
            className="px-3.5 py-1.5 rounded-lg bg-[#FF5263]/15 border border-[#FF5263]/40 text-[#FF5263] hover:bg-[#FF5263]/25 flex items-center gap-1.5 shrink-0"
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
          <div className="lg:col-span-5 rounded-2xl bg-[#151B32] border border-slate-800 p-6 space-y-5 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-base text-white">
                SIMULATION PARAMETERS
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Section: <strong className="text-white">{currentSection.name}</strong>
              </p>
            </div>

            {/* Leave Type Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
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
                  className={`py-2 px-1 rounded-xl border text-center transition-all ${
                    leaveType === 'on_duty'
                      ? 'bg-[#50E3FF] text-[#0B1020] border-[#50E3FF] font-bold shadow-sm'
                      : 'bg-[#0B1020] text-slate-300 border-slate-800 hover:border-slate-700'
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
                  className={`py-2 px-1 rounded-xl border text-center transition-all ${
                    leaveType === 'medical_leave'
                      ? 'bg-[#B7FF5A] text-[#0B1020] border-[#B7FF5A] font-bold shadow-sm'
                      : 'bg-[#0B1020] text-slate-300 border-slate-800 hover:border-slate-700'
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
                  className={`py-2 px-1 rounded-xl border text-center transition-all ${
                    leaveType === 'ordinary_absence'
                      ? 'bg-[#FFB84D] text-[#0B1020] border-[#FFB84D] font-bold shadow-sm'
                      : 'bg-[#0B1020] text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Ordinary Absence
                </button>
              </div>
            </div>

            {/* Scope: Specific Subject or All Subjects */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                COURSE SCOPE
              </label>
              <select
                value={targetSubject}
                onChange={(e) => setTargetSubject(e.target.value)}
                className="w-full bg-[#0B1020] border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono focus:border-[#50E3FF] focus:outline-none"
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
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  START DATE
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono focus:border-[#50E3FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  END DATE
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono focus:border-[#50E3FF] focus:outline-none"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                REASON / DOCUMENTATION
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#0B1020] border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono focus:border-[#50E3FF] focus:outline-none"
              />
            </div>

            {/* Institutional Policy Settings */}
            <div className="p-3.5 rounded-xl bg-[#0B1020] border border-slate-800 space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">INSTITUTIONAL POLICY RULES</span>
                <span className="text-[10px] text-slate-400">SRM IST Standard</span>
              </div>

              {leaveType === 'on_duty' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">OD Attendance Credit:</span>
                    <select
                      value={state.odPolicy}
                      onChange={(e) => setODPolicy(e.target.value as ODPolicy)}
                      className="bg-[#151B32] border border-slate-700 text-xs font-mono text-[#50E3FF] rounded px-2 py-1"
                    >
                      <option value="counts_attended">Policy A (Counts as Attended)</option>
                      <option value="not_attended">Policy B (No Attendance Credit)</option>
                      <option value="exempted">Policy C (Exempted Denominator)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Max OD Cap Allowed:</span>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={state.maxODSessionsAllowed}
                      onChange={(e) => setMaxODSessionsAllowed(parseInt(e.target.value) || 12)}
                      className="w-16 bg-[#151B32] border border-slate-700 text-xs font-mono text-white rounded px-2 py-1 text-center"
                    />
                  </div>
                </div>
              )}

              {leaveType === 'medical_leave' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Medical Policy:</span>
                    <select
                      value={state.mlPolicy}
                      onChange={(e) => setMLPolicy(e.target.value as MLPolicy)}
                      className="bg-[#151B32] border border-slate-700 text-xs font-mono text-[#B7FF5A] rounded px-2 py-1"
                    >
                      <option value="ordinary_absence">Ordinary Absence (Standard)</option>
                      <option value="approved_credit">Approved Attendance Credit</option>
                      <option value="exempted">Exempted from Denominator</option>
                    </select>
                  </div>
                </div>
              )}

              {leaveType === 'ordinary_absence' && (
                <p className="text-[11px] text-slate-400">
                  Standard absence: Every scheduled timetable period in date range counts as absent.
                </p>
              )}
            </div>

            {/* Apply & Save Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleApply}
                className="w-full py-3 rounded-xl bg-[#B7FF5A] text-[#0B1020] font-display font-bold text-xs tracking-wider hover:bg-[#a6f343] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(183,255,90,0.3)]"
              >
                <span>APPLY SIMULATION TO DASHBOARD</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => saveScenario(liveSimulationResult)}
                className="w-full py-2.5 rounded-xl bg-[#0B1020] border border-slate-700 text-slate-200 font-mono text-xs hover:bg-[#151B32] flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save to Scenario Library</span>
              </button>
            </div>
          </div>

          {/* Right Column: Real-Time Attendance Impact Display */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Impact Telemetry Card */}
            <div className="rounded-2xl bg-[#151B32] border border-[#50E3FF]/30 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-[#50E3FF] uppercase tracking-wider block">
                    REAL-TIME TIMETABLE SIMULATION
                  </span>
                  <h3 className="font-display font-extrabold text-2xl text-white mt-1">
                    YOUR ATTENDANCE IMPACT
                  </h3>
                </div>

                <span
                  className={`px-3.5 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border ${
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
                <div className="p-4 bg-[#0B1020] rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">CURRENT ATTENDANCE</span>
                  <span className="font-display font-extrabold text-2xl text-white block mt-1 tabular-nums">
                    {liveSimulationResult.overallBeforePercentage}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">before requested leave</span>
                </div>

                <div className="p-4 bg-[#0B1020] rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">PROJECTED ATTENDANCE</span>
                  <span
                    className="font-display font-extrabold text-2xl block mt-1 tabular-nums"
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

                <div className="p-4 bg-[#0B1020] rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">CLASSES AFFECTED</span>
                  <span className="font-display font-extrabold text-2xl text-[#50E3FF] block mt-1 tabular-nums">
                    {liveSimulationResult.totalClassesAffected}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    exact timetable periods
                  </span>
                </div>

                <div className="p-4 bg-[#0B1020] rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">RECOVERY REQUIREMENT</span>
                  <span
                    className="font-display font-extrabold text-2xl block mt-1 tabular-nums"
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
                    consecutive classes needed
                  </span>
                </div>
              </div>

              {/* Policy explanation banner */}
              <div className="p-3.5 bg-[#0B1020]/70 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
                <span className="text-[#50E3FF] font-bold">Policy Note: </span>
                {liveSimulationResult.policyAppliedDescription}
              </div>

              {/* Warning if irreversible */}
              {liveSimulationResult.isOverallIrreversible && (
                <div className="p-4 bg-[#FF5263]/10 border-2 border-[#FF5263] rounded-xl text-xs text-white space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#FF5263]">
                    <ShieldAlert className="w-5 h-5" />
                    <span>IRREVERSIBLE DETENTION WARNING</span>
                  </div>
                  <p className="text-slate-200">
                    Applying this leave will make achieving your {state.targetPercentage}% attendance target mathematically impossible before the semester deadline.
                  </p>
                </div>
              )}

              {/* Affected Timetable Periods List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-bold">SCHEDULED PERIODS AFFECTED ({liveSimulationResult.totalClassesAffected})</span>
                  <span className="text-slate-400 text-[11px]">
                    Extracted from {currentSection.name} weekly timetable
                  </span>
                </div>

                {liveSimulationResult.affectedSessions.length > 0 ? (
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
                    {liveSimulationResult.affectedSessions.map((sess, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#0B1020] border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-3.5 h-3.5 text-[#50E3FF]" />
                          <span className="text-white font-bold">{sess.date} ({sess.dayOfWeek})</span>
                          <span className="text-slate-400">P{sess.period} ({sess.time})</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-200 truncate max-w-[140px] sm:max-w-xs">{sess.subjectName}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sess.countsAsAttended
                                ? 'bg-[#B7FF5A]/20 text-[#B7FF5A]'
                                : 'bg-[#FF5263]/20 text-[#FF5263]'
                            }`}
                          >
                            {sess.countsAsAttended ? 'CREDITED' : 'ABSENT'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#0B1020] text-center text-xs font-mono text-slate-500">
                    No timetable classes scheduled during the selected date range.
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
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-xl text-white">
              INSTITUTIONAL POLICY COMPARATOR
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side comparison of attendance outcomes under different university leave rules for {scenarioName}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Policy A Card */}
            <div className="p-6 rounded-2xl bg-[#151B32] border border-[#B7FF5A]/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-[#B7FF5A]/15 text-[#B7FF5A] font-mono text-xs font-bold">
                  POLICY A (APPROVED CREDIT)
                </span>
                <span className="text-xs font-mono text-slate-400">Approved OD / Medical Credit</span>
              </div>

              <div className="font-display font-bold text-3xl text-white tabular-nums">
                {policyA_Result.overallAfterPercentage}%
                <span className="text-sm font-mono text-[#B7FF5A] ml-2">
                  (Δ {policyA_Result.overallDelta >= 0 ? '+' : ''}{policyA_Result.overallDelta}%)
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Classes affected:</span>
                  <span className="text-white font-bold">{policyA_Result.totalClassesAffected} classes</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Recovery classes needed:</span>
                  <span className="text-[#B7FF5A] font-bold">{policyA_Result.overallRequiredRecovery} classes</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
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
            <div className="p-6 rounded-2xl bg-[#151B32] border border-[#FF5263]/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-[#FF5263]/15 text-[#FF5263] font-mono text-xs font-bold">
                  POLICY B (ORDINARY ABSENCE)
                </span>
                <span className="text-xs font-mono text-slate-400">Uncredited Absence Rule</span>
              </div>

              <div className="font-display font-bold text-3xl text-white tabular-nums">
                {policyB_Result.overallAfterPercentage}%
                <span className="text-sm font-mono text-[#FF5263] ml-2">
                  (Δ {policyB_Result.overallDelta}%)
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Classes affected:</span>
                  <span className="text-white font-bold">{policyB_Result.totalClassesAffected} classes</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Recovery classes needed:</span>
                  <span className="text-[#FFB84D] font-bold">{policyB_Result.overallRequiredRecovery} classes</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
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
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-display font-bold text-xl text-white">
                SAVED LEAVE SCENARIOS
              </h3>
              <p className="text-xs text-slate-400">
                Saved simulation profiles persisted in LocalStorage.
              </p>
            </div>
            {savedScenarios.length > 0 && (
              <span className="text-xs font-mono text-[#50E3FF]">
                {savedScenarios.length} scenarios on file
              </span>
            )}
          </div>

          {savedScenarios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedScenarios.map((sc, idx) => (
                <div
                  key={sc.request.id || idx}
                  className="p-5 rounded-2xl bg-[#151B32] border border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-[#0B1020] text-[#50E3FF] font-bold uppercase">
                        {sc.request.leaveType.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => deleteScenario(sc.request.id || '')}
                        className="text-slate-500 hover:text-[#FF5263] p-1"
                        title="Delete scenario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-display font-bold text-base text-white mt-2">
                      {sc.request.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {sc.request.startDate} to {sc.request.endDate} · {sc.totalClassesAffected} classes
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">PROJECTED %</span>
                      <span className="font-bold text-base text-white">{sc.overallAfterPercentage}%</span>
                    </div>

                    <button
                      onClick={() => applySimulation(sc)}
                      className="px-3 py-1.5 rounded-lg bg-[#50E3FF] text-[#0B1020] font-bold text-xs hover:bg-[#3ecfe8] transition-colors"
                    >
                      Apply Scenario
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#151B32] border border-slate-800 rounded-2xl space-y-2">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm text-slate-300 font-semibold font-mono">
                No saved scenarios yet
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Simulate a leave scenario in the Live Simulator tab and click "Save to Scenario Library".
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
