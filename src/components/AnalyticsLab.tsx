import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

export const AnalyticsLab: React.FC = () => {
  const { overallCalculation, currentSection, state, exportDataJson } = useAttendance();
  const [activeChartTab, setActiveChartTab] = useState<'subject' | 'projected' | 'trend' | 'distribution'>('subject');

  // Chart Data 1: Subject-wise attendance comparison
  const subjectChartData = overallCalculation.subjectResults.map((sub) => ({
    name: sub.slot ? `Slot ${sub.slot}` : sub.subjectCode,
    fullName: sub.subjectName,
    code: sub.subjectCode,
    current: Number(sub.currentPercentage.toFixed(1)),
    target: sub.targetPercentage,
    maxAchievable: Number(sub.maxAchievablePercentage.toFixed(1)),
    conducted: sub.conductedClasses,
    attended: sub.attendedClasses,
    color: sub.color,
  }));

  // Chart Data 2: Current vs Projected Final Attendance
  const projectedChartData = overallCalculation.subjectResults.map((sub) => ({
    name: sub.slot ? `Slot ${sub.slot}` : sub.subjectCode,
    fullName: sub.subjectName,
    current: Number(sub.currentPercentage.toFixed(1)),
    projected: Number(sub.predictedAttendance.toFixed(1)),
    target: sub.targetPercentage,
  }));

  // Chart Data 3: Simulated Semester Attendance Trend over time (Weeks 1 to 14)
  const trendData = [
    { week: 'W1', attendance: 100, target: state.targetPercentage },
    { week: 'W2', attendance: 92, target: state.targetPercentage },
    { week: 'W3', attendance: 88, target: state.targetPercentage },
    { week: 'W4', attendance: 84, target: state.targetPercentage },
    { week: 'W5', attendance: 79, target: state.targetPercentage },
    { week: 'W6', attendance: 76, target: state.targetPercentage },
    { week: 'W7 (Mid)', attendance: Number(overallCalculation.currentPercentage.toFixed(1)), target: state.targetPercentage },
    { week: 'W9 (Proj)', attendance: Math.min(100, Number((overallCalculation.currentPercentage + 2.5).toFixed(1))), target: state.targetPercentage },
    { week: 'W11 (Proj)', attendance: Math.min(100, Number((overallCalculation.currentPercentage + 5.1).toFixed(1))), target: state.targetPercentage },
    { week: 'W14 (End)', attendance: Number(overallCalculation.maxAchievablePercentage.toFixed(1)), target: state.targetPercentage },
  ];

  // Chart Data 4: Weekly Class Distribution
  const distributionData = currentSection.subjects.map((sub) => ({
    name: sub.slot ? `Slot ${sub.slot}` : sub.code,
    fullName: sub.name,
    periodsPerWeek: sub.periodsPerWeek,
  }));

  const exportSummaryCsv = () => {
    let csv = `Subject Code,Slot,Subject Name,Faculty,Conducted,Attended,Current %,Target %,Recovery Classes Needed,Safe Misses Remaining,Max Achievable %\n`;
    overallCalculation.subjectResults.forEach((sub) => {
      csv += `"${sub.subjectCode}","${sub.slot}","${sub.subjectName}","${sub.faculty}","${sub.conductedClasses}","${sub.attendedClasses}","${sub.currentPercentage}","${sub.targetPercentage}","${sub.requiredRecoveryClasses}","${sub.safelyMissableFromRemaining}","${sub.maxAchievablePercentage}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSection.id}_analytics_summary.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportFullJson = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSection.id}_full_telemetry.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#B7FF5A] uppercase tracking-widest mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>FUTURISTIC ANALYTICS LAB</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            ATTENDANCE ANALYTICS LAB
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Deep parametric inspection of course vectors, benchmark deviations, and semester distribution.
          </p>
        </div>

        {/* Data Exports */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportSummaryCsv}
            className="px-3.5 py-2 rounded-xl bg-[#151B32] border border-[#50E3FF]/40 text-[#50E3FF] text-xs font-mono hover:bg-[#1B223F] flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportFullJson}
            className="px-3.5 py-2 rounded-xl bg-[#151B32] border border-[#B7FF5A]/40 text-[#B7FF5A] text-xs font-mono hover:bg-[#1B223F] flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Analytics Sub-Nav Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#151B32] border border-slate-800 rounded-xl text-xs font-mono overflow-x-auto">
        <button
          onClick={() => setActiveChartTab('subject')}
          className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeChartTab === 'subject'
              ? 'bg-[#B7FF5A] text-[#0B1020] font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Subject Comparison
        </button>
        <button
          onClick={() => setActiveChartTab('projected')}
          className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeChartTab === 'projected'
              ? 'bg-[#50E3FF] text-[#0B1020] font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Current vs Projected Final
        </button>
        <button
          onClick={() => setActiveChartTab('trend')}
          className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeChartTab === 'trend'
              ? 'bg-white text-[#0B1020] font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Semester Trend Curve
        </button>
        <button
          onClick={() => setActiveChartTab('distribution')}
          className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeChartTab === 'distribution'
              ? 'bg-[#A78BFA] text-[#0B1020] font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Weekly Period Distribution
        </button>
      </div>

      {/* Main Chart Canvas */}
      <div className="rounded-2xl bg-[#151B32] border border-slate-800 p-6 shadow-2xl space-y-4">
        
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              {activeChartTab === 'subject' && 'Subject Attendance vs Benchmark Lines (75% / 90%)'}
              {activeChartTab === 'projected' && 'Current Standing vs Max Achievable Final %'}
              {activeChartTab === 'trend' && 'Semester Attendance Velocity & Projections'}
              {activeChartTab === 'distribution' && 'Timetable Weekly Period Allocation'}
            </h3>
            <p className="text-xs text-slate-400">
              Interactive visual model grounded in {currentSection.name} academic dataset.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#50E3FF]" />
              75% Target Line
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B7FF5A]" />
              90% Honors Line
            </span>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-96 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartTab === 'subject' ? (
              <BarChart data={subjectChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252D4D" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-[#0B1020] border border-[#50E3FF]/40 rounded-xl shadow-xl text-xs font-mono text-white space-y-1">
                          <div className="font-bold text-[#50E3FF]">{data.fullName}</div>
                          <div>Code: {data.code}</div>
                          <div>Current Attendance: <strong className="text-[#B7FF5A]">{data.current}%</strong></div>
                          <div>Attended: {data.attended} / {data.conducted} classes</div>
                          <div>Max Achievable: {data.maxAchievable}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={75} stroke="#50E3FF" strokeDasharray="4 4" strokeWidth={2} label={{ value: '75%', fill: '#50E3FF', position: 'right' }} />
                <ReferenceLine y={90} stroke="#B7FF5A" strokeDasharray="4 4" strokeWidth={2} label={{ value: '90%', fill: '#B7FF5A', position: 'right' }} />
                <Bar dataKey="current" fill="#50E3FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : activeChartTab === 'projected' ? (
              <BarChart data={projectedChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252D4D" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1020', borderColor: '#50E3FF', borderRadius: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <ReferenceLine y={state.targetPercentage} stroke="#FFB84D" strokeDasharray="3 3" strokeWidth={1.5} />
                <Bar dataKey="current" name="Current %" fill="#50E3FF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="projected" name="Projected Max %" fill="#B7FF5A" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : activeChartTab === 'trend' ? (
              <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#50E3FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#50E3FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252D4D" vertical={false} />
                <XAxis dataKey="week" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis domain={[50, 100]} stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0B1020', borderColor: '#50E3FF', borderRadius: '12px' }} />
                <ReferenceLine y={state.targetPercentage} stroke="#FF5263" strokeDasharray="3 3" label={{ value: `Target ${state.targetPercentage}%`, fill: '#FF5263', position: 'right' }} />
                <Area type="monotone" dataKey="attendance" stroke="#50E3FF" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
              </AreaChart>
            ) : (
              <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252D4D" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-[#0B1020] border border-[#A78BFA]/40 rounded-xl text-xs font-mono text-white">
                          <div className="font-bold text-[#A78BFA]">{data.fullName}</div>
                          <div>Periods per week: <strong className="text-white">{data.periodsPerWeek} hrs</strong></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="periodsPerWeek" name="Periods per Week" fill="#A78BFA" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
};
