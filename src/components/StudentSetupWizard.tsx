import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { CLASS_SECTIONS } from '../data/timetableData';
import { TargetPercentage } from '../utils/attendanceEngine';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  Sliders,
  HelpCircle,
} from 'lucide-react';

interface StudentSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const StudentSetupWizard: React.FC<StudentSetupWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const {
    state,
    currentSection,
    setSectionId,
    setSemesterDates,
    setTargetPercentage,
    updateSubjectAttendance,
    applyAttendancePreset,
    completeInitialization,
    conductedFromTimetable,
  } = useAttendance();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form local state
  const [selectedSecId, setSelectedSecId] = useState(state.sectionId);
  const [startDate, setStartDate] = useState(state.startDate);
  const [endDate, setEndDate] = useState(state.endDate);
  const [currentDate, setCurrentDate] = useState(state.currentDate);
  const [checkpointDate, setCheckpointDate] = useState(state.checkpointDate);
  const [target, setTarget] = useState<TargetPercentage>(state.targetPercentage);

  // Alternative input mode: exact counts vs percentage
  const [inputMode, setInputMode] = useState<'counts' | 'percentage'>('counts');
  const [subjectPcts, setSubjectPcts] = useState<Record<string, number>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSectionSelect = (id: string) => {
    setSelectedSecId(id);
    setSectionId(id);
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    const cur = new Date(currentDate);

    if (isNaN(start.getTime())) errs.startDate = 'Invalid start date';
    if (isNaN(end.getTime())) errs.endDate = 'Invalid end date';
    if (isNaN(cur.getTime())) errs.currentDate = 'Invalid current date';

    if (start >= end) errs.endDate = 'End date must be after start date';
    if (cur < start) errs.currentDate = 'Current date cannot be before semester start';
    if (cur > end) errs.currentDate = 'Current date cannot be after semester end';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (validateStep2()) {
        setSemesterDates(startDate, endDate, currentDate, checkpointDate);
        setTargetPercentage(target);
        setStep(3);
      }
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      completeInitialization();
      onComplete();
      onClose();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handlePercentageChange = (code: string, pct: number) => {
    setSubjectPcts((prev) => ({ ...prev, [code]: pct }));
    const baseConducted = conductedFromTimetable[code] || 24;
    const computedAttended = Math.round((pct / 100) * baseConducted);
    updateSubjectAttendance(code, baseConducted, computedAttended);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1020]/80 backdrop-blur-md">
      <div className="bg-[#151B32] border border-[#50E3FF]/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0B1020]/50">
          <div>
            <div className="text-[11px] font-mono text-[#50E3FF] uppercase tracking-wider">
              STUDENT INITIALIZATION PROTOCOL
            </div>
            <h2 className="text-lg font-display font-bold text-white">
              {step === 1 && 'STEP 01 — SELECT SECTION'}
              {step === 2 && 'STEP 02 — SEMESTER DETAILS'}
              {step === 3 && 'STEP 03 — ATTENDANCE INPUT'}
              {step === 4 && 'STEP 04 — INITIALIZE DASHBOARD'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-4 border-b border-slate-800 bg-[#0B1020]/20 text-xs font-mono">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`py-2 px-3 text-center border-r last:border-r-0 border-slate-800 transition-colors ${
                step === s
                  ? 'bg-[#B7FF5A]/10 text-[#B7FF5A] font-bold border-b-2 border-b-[#B7FF5A]'
                  : step > s
                  ? 'text-slate-300'
                  : 'text-slate-500'
              }`}
            >
              STEP 0{s}
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* STEP 1: Select Section */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Choose your official academic class section from the SRM Institute timetable database.
                Each section loads exact course codes, weekly credit distribution, and faculty assignments.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CLASS_SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => handleSectionSelect(sec.id)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      selectedSecId === sec.id
                        ? 'bg-[#1B223F] border-[#B7FF5A] shadow-[0_0_15px_rgba(183,255,90,0.2)]'
                        : 'bg-[#0B1020]/50 border-slate-800 hover:border-slate-700 hover:bg-[#151B32]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-base text-white">
                        {sec.name}
                      </span>
                      {selectedSecId === sec.id && (
                        <span className="w-5 h-5 rounded-full bg-[#B7FF5A] text-[#0B1020] flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#50E3FF] mt-1 font-mono">{sec.semester}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{sec.program}</div>
                    <div className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-2">
                      <span>Venue: {sec.venue}</span>
                      <span>·</span>
                      <span>{sec.subjects.length} Subjects</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Semester Details */}
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-xs text-slate-300">
                Define the academic timeline for SRM Odd Semester 2026. The system calculates class frequencies
                excluding university holidays.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    SEMESTER START DATE
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#0B1020] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-[#50E3FF] focus:outline-none"
                  />
                  {errors.startDate && (
                    <p className="text-xs text-[#FF5263] mt-1">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    SEMESTER END DATE
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#0B1020] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-[#50E3FF] focus:outline-none"
                  />
                  {errors.endDate && (
                    <p className="text-xs text-[#FF5263] mt-1">{errors.endDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    CURRENT DATE (FOR SIMULATION)
                  </label>
                  <input
                    type="date"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className="w-full bg-[#0B1020] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-[#50E3FF] focus:outline-none"
                  />
                  {errors.currentDate && (
                    <p className="text-xs text-[#FF5263] mt-1">{errors.currentDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    CHECKPOINT DATE (DETENTION LOCK)
                  </label>
                  <input
                    type="date"
                    value={checkpointDate}
                    onChange={(e) => setCheckpointDate(e.target.value)}
                    className="w-full bg-[#0B1020] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-[#50E3FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Target Attendance Selector */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-2">
                  SEMESTER ATTENDANCE TARGET
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {([75, 80, 85, 90] as TargetPercentage[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTarget(t)}
                      className={`py-3 rounded-xl border text-center font-mono font-bold transition-all ${
                        target === t
                          ? 'bg-[#B7FF5A] text-[#0B1020] border-[#B7FF5A] shadow-[0_0_15px_rgba(183,255,90,0.3)]'
                          : 'bg-[#0B1020] text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-lg">{t}%</div>
                      <div className="text-[10px] font-normal opacity-80">
                        {t === 75 ? 'SRM Minimum' : t === 90 ? 'Honors Goal' : 'Safe Buffer'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Attendance Input */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B1020]/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs font-mono text-white">INPUT METHOD</div>
                  <div className="text-[11px] text-slate-400">
                    Exact class counts yield 100% deterministic prediction accuracy.
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#151B32] p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setInputMode('counts')}
                    className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                      inputMode === 'counts'
                        ? 'bg-[#50E3FF] text-[#0B1020] font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Exact Counts
                  </button>
                  <button
                    onClick={() => setInputMode('percentage')}
                    className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                      inputMode === 'percentage'
                        ? 'bg-[#50E3FF] text-[#0B1020] font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Percentage %
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">QUICK PRESETS:</span>
                <button
                  type="button"
                  onClick={() => applyAttendancePreset('timetable')}
                  className="px-2.5 py-1 rounded bg-[#0B1020] border border-slate-700 text-slate-300 hover:border-[#50E3FF] font-mono text-xs"
                >
                  Standard (82%)
                </button>
                <button
                  type="button"
                  onClick={() => applyAttendancePreset('borderline')}
                  className="px-2.5 py-1 rounded bg-[#0B1020] border border-[#FFB84D]/40 text-[#FFB84D] hover:border-[#FFB84D] font-mono text-xs"
                >
                  Borderline (73%)
                </button>
                <button
                  type="button"
                  onClick={() => applyAttendancePreset('critical')}
                  className="px-2.5 py-1 rounded bg-[#0B1020] border border-[#FF5263]/40 text-[#FF5263] hover:border-[#FF5263] font-mono text-xs"
                >
                  Critical Recovery (58%)
                </button>
              </div>

              {inputMode === 'percentage' && (
                <div className="bg-[#50E3FF]/10 border border-[#50E3FF]/30 p-3 rounded-xl text-xs text-slate-300 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-[#50E3FF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#50E3FF]">Important Notice: </span>
                    Entering percentages automatically scales into exact conducted classes based on the SRM timetable up to today ({currentDate}). For precision, switch to Exact Counts.
                  </div>
                </div>
              )}

              {/* Subject Cards List */}
              <div className="space-y-3">
                {currentSection.subjects.map((sub) => {
                  const input = state.subjectInputs[sub.code] || {
                    conductedClasses: conductedFromTimetable[sub.code] || 24,
                    attendedClasses: Math.round((conductedFromTimetable[sub.code] || 24) * 0.78),
                  };
                  const pct =
                    input.conductedClasses > 0
                      ? (input.attendedClasses / input.conductedClasses) * 100
                      : 100;

                  return (
                    <div
                      key={sub.code}
                      className="p-3.5 rounded-xl bg-[#0B1020]/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                            style={{ backgroundColor: `${sub.color}25`, color: sub.color }}
                          >
                            SLOT {sub.slot}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{sub.code}</span>
                        </div>
                        <div className="font-semibold text-sm text-white truncate mt-0.5">
                          {sub.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {sub.faculty} · {sub.periodsPerWeek} hrs/week
                        </div>
                      </div>

                      {inputMode === 'counts' ? (
                        <div className="flex items-center gap-3 shrink-0">
                          <div>
                            <span className="block text-[10px] font-mono text-slate-400">
                              ATTENDED
                            </span>
                            <input
                              type="number"
                              min="0"
                              max={input.conductedClasses}
                              value={input.attendedClasses}
                              onChange={(e) =>
                                updateSubjectAttendance(
                                  sub.code,
                                  input.conductedClasses,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 bg-[#151B32] border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white text-center focus:border-[#50E3FF] focus:outline-none"
                            />
                          </div>
                          <span className="text-slate-500 font-mono text-sm pt-4">/</span>
                          <div>
                            <span className="block text-[10px] font-mono text-slate-400">
                              CONDUCTED
                            </span>
                            <input
                              type="number"
                              min="1"
                              value={input.conductedClasses}
                              onChange={(e) =>
                                updateSubjectAttendance(
                                  sub.code,
                                  parseInt(e.target.value) || 1,
                                  input.attendedClasses
                                )
                              }
                              className="w-16 bg-[#151B32] border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white text-center focus:border-[#50E3FF] focus:outline-none"
                            />
                          </div>
                          <div className="w-14 text-right pt-4">
                            <span
                              className={`text-sm font-bold font-mono ${
                                pct < target ? 'text-[#FF5263]' : 'text-[#B7FF5A]'
                              }`}
                            >
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 shrink-0 w-48">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={subjectPcts[sub.code] ?? Math.round(pct)}
                            onChange={(e) =>
                              handlePercentageChange(sub.code, parseInt(e.target.value) || 0)
                            }
                            className="w-full accent-[#50E3FF]"
                          />
                          <span className="text-sm font-bold font-mono text-[#50E3FF] w-12 text-right">
                            {(subjectPcts[sub.code] ?? Math.round(pct))}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Review and Initialize */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-[#B7FF5A]/10 border border-[#B7FF5A]/30 p-4 rounded-xl text-center">
                <Sparkles className="w-8 h-8 text-[#B7FF5A] mx-auto mb-2" />
                <h3 className="text-base font-display font-bold text-white">
                  MISSION CONFIGURATION READY
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                  Your academic profile for {currentSection.name} has been synthesized.
                  The calculation engine is ready to track recovery trajectories and simulate time-travel scenarios.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#0B1020] rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">SECTION</div>
                  <div className="text-white font-bold text-sm mt-1">{currentSection.name}</div>
                </div>
                <div className="p-3 bg-[#0B1020] rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">TARGET</div>
                  <div className="text-[#B7FF5A] font-bold text-sm mt-1">{target}%</div>
                </div>
                <div className="p-3 bg-[#0B1020] rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">SUBJECTS</div>
                  <div className="text-white font-bold text-sm mt-1">
                    {currentSection.subjects.length} courses
                  </div>
                </div>
                <div className="p-3 bg-[#0B1020] rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">TIMELINE</div>
                  <div className="text-[#50E3FF] font-bold text-sm mt-1">{currentDate}</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0B1020]/50 flex items-center justify-between">
          <button
            onClick={handlePrevStep}
            disabled={step === 1}
            className={`px-4 py-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors ${
              step === 1
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>

          <button
            onClick={handleNextStep}
            className="px-6 py-2.5 rounded-xl bg-[#B7FF5A] text-[#0B1020] font-display font-bold text-xs tracking-wider hover:bg-[#a6f343] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(183,255,90,0.3)]"
          >
            <span>{step === 4 ? 'LAUNCH DASHBOARD' : 'CONTINUE'}</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </div>
  );
};
