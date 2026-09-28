import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { CLASS_SECTIONS } from '../data/timetableData';
import { runAttendanceEngineUnitTests } from '../utils/attendanceEngine.test';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    state,
    currentSection,
    setSectionId,
    setSemesterDates,
    setTargetPercentage,
    resetAllData,
    exportDataJson,
    importDataJson,
  } = useAttendance();

  const [testResults, setTestResults] = useState<{
    ran: boolean;
    allPassed: boolean;
    results: Array<{ test: string; passed: boolean; message?: string }>;
  } | null>(null);

  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunTests = () => {
    const res = runAttendanceEngineUnitTests();
    setTestResults({
      ran: true,
      allPassed: res.allPassed,
      results: res.results,
    });
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const success = importDataJson(importJsonText);
    if (success) {
      setImportStatus('Successfully restored state configuration.');
      setImportJsonText('');
    } else {
      setImportStatus('Failed to import JSON: Invalid state structure.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D1A]/80 backdrop-blur-xl">
      <div className="bg-[#0D1527]/95 border border-white/[0.12] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-[#080D1A]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E5C07B]/15 text-[#E5C07B] flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#FAF8F2]">
              SYSTEM SETTINGS & DATA LAB
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6 font-sans">
          
          {/* Section 1: Active Class Section Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-medium">
              CLASS SECTION ASSIGNMENT
            </label>
            <select
              value={currentSection.id}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full bg-[#080D1A] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white font-mono focus:border-[#E5C07B] focus:outline-none cursor-pointer"
            >
              {CLASS_SECTIONS.map((sec) => (
                <option key={sec.id} value={sec.id} className="bg-[#0D1527]">
                  {sec.name} — {sec.program} ({sec.semester}) · Venue: {sec.venue}
                </option>
              ))}
            </select>
          </div>

          {/* Section 2: Mathematical Engine Verification Unit Tests */}
          <div className="p-5 bg-[#080D1A]/90 border border-white/[0.08] rounded-2xl space-y-3.5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#FAF8F2] block">
                  CALCULATION ENGINE TEST RUNNER
                </span>
                <span className="text-[11px] text-slate-400 font-sans block mt-0.5">
                  Verify deterministic formulas, ceiling logic, edge cases, and irreversible detention detection.
                </span>
              </div>
              <button
                onClick={handleRunTests}
                className="px-4 py-2 rounded-xl bg-[#B7FF5A] text-[#080D1A] text-xs font-mono font-bold hover:bg-[#a6f343] flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Unit Tests</span>
              </button>
            </div>

            {testResults && (
              <div className="pt-3 border-t border-white/[0.06] space-y-2 font-mono text-xs">
                <div
                  className={`font-bold ${
                    testResults.allPassed ? 'text-[#B7FF5A]' : 'text-[#FF5263]'
                  }`}
                >
                  {testResults.allPassed ? 'ALL TEST INVARIANTS PASSED' : 'TEST FAILURES DETECTED'}
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 text-[11px] text-slate-300">
                  {testResults.results.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={r.passed ? 'text-[#B7FF5A]' : 'text-[#FF5263]'}>
                        {r.passed ? '✓ [PASS]' : '✗ [FAIL]'}
                      </span>
                      <span>{r.test}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Data Backup & Restore */}
          <div className="p-5 bg-[#080D1A]/90 border border-white/[0.08] rounded-2xl space-y-3.5 shadow-sm">
            <span className="font-mono text-xs font-bold text-[#FAF8F2] block">
              DATA PERSISTENCE & BACKUP
            </span>
            <p className="text-[11px] text-slate-400 font-sans">
              State is automatically persisted in browser local storage. Export your configuration or restore from a JSON snapshot.
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  const blob = new Blob([exportDataJson()], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `core_calculator_backup_${state.sectionId}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 rounded-xl bg-[#0D1527] border border-white/[0.1] text-[#50E3FF] text-xs font-mono hover:bg-[#131D35] flex items-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export State JSON</span>
              </button>

              <button
                onClick={resetAllData}
                className="px-4 py-2 rounded-xl bg-[#FF5263]/10 border border-[#FF5263]/40 text-[#FF5263] text-xs font-mono hover:bg-[#FF5263]/20 flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Data</span>
              </button>
            </div>

            {/* Import Area */}
            <div className="pt-2 space-y-2">
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder="Paste exported JSON string to restore..."
                rows={3}
                className="w-full bg-[#0D1527] border border-white/[0.1] rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#E5C07B]"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={handleImport}
                  className="px-4 py-1.5 rounded-xl bg-[#FAF8F2] text-[#080D1A] text-xs font-mono font-bold hover:bg-white transition-colors"
                >
                  Restore From JSON
                </button>
                {importStatus && (
                  <span className="text-xs font-mono text-[#B7FF5A]">{importStatus}</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-[#080D1A]/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#FAF8F2] text-[#080D1A] font-bold font-mono text-xs hover:bg-white transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
