import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { TargetPercentage } from '../utils/attendanceEngine';
import {
  Zap,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const RecoveryEngine: React.FC = () => {
  const {
    overallCalculation,
    currentSection,
    state,
    setTargetPercentage,
  } = useAttendance();

  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('overall');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const targets: TargetPercentage[] = [75, 80, 85, 90];

  // Selected item (either overall or specific subject)
  const isOverall = selectedSubjectCode === 'overall';
  const selectedSubject = !isOverall
    ? overallCalculation.subjectResults.find((s) => s.subjectCode === selectedSubjectCode)
    : null;

  const currentPct = isOverall
    ? overallCalculation.currentPercentage
    : selectedSubject?.currentPercentage ?? 0;

  const maxAchievable = isOverall
    ? overallCalculation.maxAchievablePercentage
    : selectedSubject?.maxAchievablePercentage ?? 0;

  const reqClasses = isOverall
    ? overallCalculation.requiredRecoveryClasses
    : selectedSubject?.requiredRecoveryClasses ?? 0;

  const safeMisses = isOverall
    ? overallCalculation.safelyMissableFromRemaining
    : selectedSubject?.safelyMissableFromRemaining ?? 0;

  const conducted = isOverall
    ? overallCalculation.totalConducted
    : selectedSubject?.conductedClasses ?? 0;

  const attended = isOverall
    ? overallCalculation.totalAttended
    : selectedSubject?.attendedClasses ?? 0;

  const remaining = isOverall
    ? overallCalculation.totalRemaining
    : selectedSubject?.remainingClasses ?? 0;

  const target = state.targetPercentage;
  const T = target / 100;

  const isPossible = maxAchievable >= target;
  const isTargetMet = currentPct >= target;

  // Simulation steps for recovery track
  const recoverySimulation: Array<{
    step: number;
    conducted: number;
    attended: number;
    pct: number;
    isTargetMet: boolean;
  }> = [];

  let simCond = conducted;
  let simAtt = attended;
  const maxSimSteps = Math.min(20, Math.max(reqClasses + 3, 6));

  for (let i = 1; i <= maxSimSteps; i++) {
    simCond += 1;
    simAtt += 1;
    const p = (simAtt / simCond) * 100;
    recoverySimulation.push({
      step: i,
      conducted: simCond,
      attended: simAtt,
      pct: Number(p.toFixed(2)),
      isTargetMet: p >= target,
    });
    if (p >= target && i >= Math.max(4, reqClasses)) {
      break;
    }
  }

  // Exact math step strings for explanation box
  const formulaStep1 = `Current Attendance = (Attended / Conducted) × 100 = (${attended} / ${conducted}) × 100 = ${currentPct.toFixed(2)}%`;
  const formulaStep2 = `Target Benchmark T = ${target}% = ${T}`;
  const formulaNumerator = `${T} × ${conducted} - ${attended} = ${(T * conducted).toFixed(4)} - ${attended} = ${(T * conducted - attended).toFixed(4)}`;
  const formulaDenominator = `1 - ${T} = ${(1 - T).toFixed(2)}`;
  const formulaDivision = ((T * conducted - attended) / (1 - T)).toFixed(4);
  const formulaStep3 = `Required Consecutive Future Classes = ⌈(${formulaNumerator}) / ${formulaDenominator}⌉ = ⌈${formulaDivision}⌉ = ${reqClasses}`;
  const formulaStep4 = `Maximum Achievable Attendance = (${attended} + ${remaining}) / (${conducted} + ${remaining}) × 100 = ${(attended + remaining)} / ${(conducted + remaining)} × 100 = ${maxAchievable.toFixed(2)}%`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#E5C07B] uppercase tracking-widest mb-1.5 font-medium">
            <Zap className="w-4 h-4 text-[#B7FF5A]" />
            <span>ALGORITHMIC RECOVERY MODULE</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#FAF8F2] tracking-tight">
            THE RECOVERY ENGINE
          </h1>
          <p className="text-slate-400 font-sans text-sm mt-1 max-w-2xl">
            Deterministic recovery trajectories for {currentSection.name}. Calculate your exact minimum attendance mission.
          </p>
        </div>

        {/* Target Percentage Segmented Control */}
        <div className="flex items-center gap-1.5 bg-[#0D1527] p-1.5 rounded-2xl border border-white/[0.08] shadow-sm">
          <span className="text-xs font-mono text-slate-400 px-2.5">TARGET:</span>
          {targets.map((t) => (
            <button
              key={t}
              onClick={() => setTargetPercentage(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                state.targetPercentage === t
                  ? 'bg-[#FAF8F2] text-[#080D1A] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}%
            </button>
          ))}
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 border-b border-white/[0.08]">
        <button
          onClick={() => setSelectedSubjectCode('overall')}
          className={`px-4 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
            selectedSubjectCode === 'overall'
              ? 'bg-[#FAF8F2] text-[#080D1A] font-bold shadow-sm'
              : 'bg-[#0D1527] text-slate-400 hover:text-white border border-white/[0.08]'
          }`}
        >
          Overall Semester
        </button>

        {overallCalculation.subjectResults.map((sub) => (
          <button
            key={sub.subjectCode}
            onClick={() => setSelectedSubjectCode(sub.subjectCode)}
            className={`px-4 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedSubjectCode === sub.subjectCode
                ? 'bg-[#50E3FF] text-[#080D1A] font-bold shadow-sm'
                : 'bg-[#0D1527] text-slate-400 hover:text-white border border-white/[0.08]'
            }`}
          >
            <span>{sub.slot}: {sub.subjectCode}</span>
            {sub.isIrreversibleDetention && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5263]" />
            )}
          </button>
        ))}
      </div>

      {/* Main Mission Display Board */}
      <div className="relative rounded-3xl bg-[#0D1527]/85 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-[#E5C07B]/15 to-transparent blur-3xl pointer-events-none" />

        <div className="relative space-y-8">
          
          {/* Mission Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono text-[#E5C07B] uppercase tracking-widest block font-semibold">
                {isOverall ? 'AGGREGATE SEMESTER TARGET' : `${selectedSubject?.subjectName} (${selectedSubject?.subjectCode})`}
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#FAF8F2] mt-0.5">
                RECOVERY MISSION SPECIFICATION
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-1.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider border ${
                  !isPossible
                    ? 'bg-[#FF5263]/15 text-[#FF5263] border-[#FF5263]'
                    : isTargetMet
                    ? 'bg-[#B7FF5A]/15 text-[#B7FF5A] border-[#B7FF5A]'
                    : 'bg-[#FFB84D]/15 text-[#FFB84D] border-[#FFB84D]'
                }`}
              >
                {!isPossible ? 'RECOVERY: IMPOSSIBLE (CRITICAL)' : isTargetMet ? 'TARGET: ACHIEVED' : 'RECOVERY: POSSIBLE'}
              </span>
            </div>
          </div>

          {/* Large Animated Telemetry Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-[#080D1A]/90 border border-white/[0.06] shadow-sm">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">CURRENT STANDING</span>
              <div className="font-display font-extrabold text-4xl text-[#FAF8F2] tabular-nums tracking-tight mt-1">
                {currentPct.toFixed(1)}%
              </div>
              <span className="text-xs font-mono text-slate-400 block mt-1 font-sans">
                {attended} of {conducted} attended
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#080D1A]/90 border border-white/[0.06] shadow-sm">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">TARGET THRESHOLD</span>
              <div className="font-display font-extrabold text-4xl text-[#E5C07B] tabular-nums tracking-tight mt-1">
                {target}%
              </div>
              <span className="text-xs font-mono text-slate-400 block mt-1 font-sans">
                institutional cutoff benchmark
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#080D1A]/90 border border-white/[0.06] shadow-sm">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">CLASSES TO ATTEND</span>
              <div
                className="font-display font-extrabold text-4xl tabular-nums tracking-tight mt-1"
                style={{ color: !isPossible ? '#FF5263' : reqClasses > 0 ? '#FFB84D' : '#B7FF5A' }}
              >
                {!isPossible ? '∞' : reqClasses}
              </div>
              <span className="text-xs font-mono text-slate-400 block mt-1 font-sans">
                {reqClasses > 0 ? 'Consecutive future classes' : 'Target already satisfied'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#080D1A]/90 border border-white/[0.06] shadow-sm">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">MAX ACHIEVABLE</span>
              <div className="font-display font-extrabold text-4xl text-[#B7FF5A] tabular-nums tracking-tight mt-1">
                {maxAchievable.toFixed(1)}%
              </div>
              <span className="text-xs font-mono text-slate-400 block mt-1 font-sans">
                with {remaining} classes remaining
              </span>
            </div>

          </div>

          {/* Classes You Can Safely Miss Calculation Card */}
          <div className="p-6 rounded-3xl bg-[#080D1A]/95 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#B7FF5A]" />
                <h4 className="font-display font-bold text-lg text-[#FAF8F2]">
                  Safe Bunk Margin Analytics
                </h4>
              </div>
              <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">
                Calculated based on current standing, target percentage ({target}%), and total remaining scheduled classes ({remaining}).
              </p>
            </div>

            <div className="flex items-center gap-8 font-mono shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">SAFE MISSES BUDGET</span>
                <span className="text-3xl font-bold text-[#50E3FF] tabular-nums">
                  {safeMisses} <span className="text-xs text-slate-400 font-normal">classes</span>
                </span>
              </div>
              <div className="text-right border-l border-white/[0.08] pl-8">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">INSTANT SKIP MARGIN</span>
                <span className="text-3xl font-bold text-[#B7FF5A] tabular-nums">
                  {isOverall ? overallCalculation.instantSkipMargin : selectedSubject?.instantSkipMargin ?? 0}{' '}
                  <span className="text-xs text-slate-400 font-normal">classes</span>
                </span>
              </div>
            </div>
          </div>

          {/* Visual Recovery Progress Track */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#FAF8F2] font-semibold">ATTENDANCE TRAJECTORY SIMULATION TRACK</span>
              <span className="text-slate-400 text-[11px]">
                Progression assuming 100% attendance in future classes
              </span>
            </div>

            <div className="p-5 bg-[#080D1A]/90 rounded-2xl border border-white/[0.06] overflow-x-auto">
              <div className="min-w-[640px] flex items-center gap-3 py-2">
                
                {/* Starting Node */}
                <div className="px-4 py-3 rounded-2xl bg-[#0D1527] border border-white/[0.1] text-center shrink-0 shadow-sm">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">INITIAL</span>
                  <span className="font-display font-bold text-base text-white block mt-0.5">
                    {currentPct.toFixed(1)}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    {attended}/{conducted}
                  </span>
                </div>

                {recoverySimulation.map((st) => (
                  <React.Fragment key={st.step}>
                    <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                    <div
                      className={`px-4 py-3 rounded-2xl text-center shrink-0 border transition-all ${
                        st.isTargetMet
                          ? 'bg-[#B7FF5A]/15 border-[#B7FF5A] text-[#B7FF5A] shadow-[0_0_15px_rgba(183,255,90,0.2)]'
                          : 'bg-[#0D1527] border-white/[0.08] text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-mono block font-semibold opacity-90">
                        CLASS +{st.step}
                      </span>
                      <span className="font-display font-bold text-base block mt-0.5 tabular-nums">
                        {st.pct.toFixed(1)}%
                      </span>
                      <span className="text-[10px] font-mono block opacity-70">
                        {st.attended}/{st.conducted}
                      </span>
                    </div>
                  </React.Fragment>
                ))}

              </div>
            </div>
          </div>

          {/* Expandable "How was this calculated?" Panel */}
          <div className="border border-white/[0.08] rounded-2xl bg-[#080D1A]/60 overflow-hidden">
            <button
              onClick={() => setShowExplanation((prev) => !prev)}
              className="w-full px-6 py-4 flex items-center justify-between text-xs font-mono text-slate-300 hover:text-white hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-[#E5C07B]" />
                <span className="font-bold tracking-wide">HOW WAS THIS CALCULATED? (FORMULA PROOF)</span>
              </div>
              {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showExplanation && (
              <div className="p-6 border-t border-white/[0.08] space-y-4 text-xs font-mono text-slate-300 bg-[#080D1A]">
                <div className="space-y-1">
                  <span className="text-[#50E3FF] font-bold">1. Current Attendance Ratio:</span>
                  <div className="p-3 rounded-xl bg-[#0D1527] text-slate-200 border border-white/[0.06]">
                    <code>{formulaStep1}</code>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[#B7FF5A] font-bold">2. Minimum Classes Required to Reach Target T:</span>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Derived from equation: <code>(attended + x) / (conducted + x) ≥ T</code> ⇒ <code>x ≥ (T·conducted - attended) / (1 - T)</code>
                  </p>
                  <div className="p-3 rounded-xl bg-[#0D1527] text-slate-200 border border-white/[0.06] space-y-1">
                    <div><code>{formulaStep2}</code></div>
                    <div><code>{formulaStep3}</code></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[#E5C07B] font-bold">3. Maximum Achievable Attendance:</span>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Assuming student attends all {remaining} remaining scheduled timetable periods.
                  </p>
                  <div className="p-3 rounded-xl bg-[#0D1527] text-slate-200 border border-white/[0.06]">
                    <code>{formulaStep4}</code>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[#FAF8F2] font-bold">4. Safe Miss Budget:</span>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Total allowable absences across semester: <code>⌊(conducted + remaining) × (1 - T)⌋</code> minus already recorded absences.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
