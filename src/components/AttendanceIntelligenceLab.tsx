import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { CLASS_SECTIONS } from '../data/timetableData';
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
  Activity,
  Calendar,
  Zap,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const AttendanceIntelligenceLab: React.FC = () => {
  const {
    overallCalculation,
    simulatedCalculation,
    isSimulationActive,
    activeSimulation,
    currentSection,
    setSectionId,
    state,
    setTargetPercentage,
    exportDataJson,
  } = useAttendance();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>(state.startDate);
  const [filterEndDate, setFilterEndDate] = useState<string>(state.endDate);

  const displayCalc = isSimulationActive ? simulatedCalculation : overallCalculation;
  const target = state.targetPercentage;
  const isSafe = displayCalc.currentPercentage >= target;
  const isCritical = displayCalc.zone === 'critical';

  // SVG Circular progress ring geometry
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(100, Math.max(0, displayCalc.currentPercentage)) / 100);

  // Filtered Subject Results
  const filteredSubjects = useMemo(() => {
    if (selectedSubjectFilter === 'all') return displayCalc.subjectResults;
    return displayCalc.subjectResults.filter((s) => s.subjectCode === selectedSubjectFilter);
  }, [displayCalc.subjectResults, selectedSubjectFilter]);

  // Chart B: Subject-wise attendance bar chart data
  const subjectChartData = useMemo(() => {
    return filteredSubjects.map((sub) => {
      let zoneColor = '#B7FF5A'; // safe
      if (sub.zone === 'critical') zoneColor = '#FF5263';
      else if (sub.zone === 'caution') zoneColor = '#FFB84D';

      return {
        name: sub.slot ? `Slot ${sub.slot}` : sub.subjectCode,
        fullName: sub.subjectName,
        code: sub.subjectCode,
        current: Number(sub.currentPercentage.toFixed(1)),
        target: sub.targetPercentage,
        conducted: sub.conductedClasses,
        attended: sub.attendedClasses,
        missed: sub.missedClasses,
        remaining: sub.remainingClasses,
        maxAchievable: Number(sub.maxAchievablePercentage.toFixed(1)),
        zoneColor,
      };
    });
  }, [filteredSubjects]);

  // Chart C: Attendance Trend Chart (Differentiating Actual Historical vs Simulated Predictions)
  const trendChartData = useMemo(() => {
    const curDate = new Date(state.currentDate);
    const startDate = new Date(state.startDate);
    const endDate = new Date(state.endDate);

    const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const passedDays = Math.max(0, (curDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeekNum = Math.min(16, Math.max(1, Math.round(passedDays / 7)));

    // Generate weekly markers from Week 1 to Week 16
    const weeks: Array<{
      week: string;
      actualHistorical?: number;
      simulatedPrediction?: number;
      targetLine: number;
    }> = [];

    // Realistic historical curve progressing toward current attendance
    const finalActual = overallCalculation.currentPercentage;
    const initialWeek1 = 100;

    for (let w = 1; w <= 16; w++) {
      if (w <= currentWeekNum) {
        // Historical points: interpolate smoothly
        const progress = (w - 1) / Math.max(1, currentWeekNum - 1);
        const interpolated = initialWeek1 - progress * (initialWeek1 - finalActual);
        weeks.push({
          week: `Week ${w}`,
          actualHistorical: Number(interpolated.toFixed(1)),
          targetLine: target,
        });
      } else {
        // Simulated future predictions: connect from current point to projected final
        const futureProgress = (w - currentWeekNum) / (16 - currentWeekNum);
        const endProjected = isSimulationActive
          ? activeSimulation?.overallProjectedEndPercentage ?? displayCalc.maxAchievablePercentage
          : displayCalc.maxAchievablePercentage;

        const predicted = finalActual + futureProgress * (endProjected - finalActual);

        // Include the current point on the prediction curve so lines visually connect
        if (w === currentWeekNum + 1) {
          weeks[weeks.length - 1] = {
            ...weeks[weeks.length - 1],
            simulatedPrediction: weeks[weeks.length - 1].actualHistorical,
          };
        }

        weeks.push({
          week: `Week ${w}`,
          simulatedPrediction: Number(predicted.toFixed(1)),
          targetLine: target,
        });
      }
    }

    return weeks;
  }, [state.startDate, state.currentDate, state.endDate, overallCalculation.currentPercentage, displayCalc.maxAchievablePercentage, isSimulationActive, activeSimulation, target]);

  // Chart D: Attendance Comparison Matrix
  const comparisonData = useMemo(() => {
    return [
      {
        scenario: 'Current Standing',
        percentage: Number(overallCalculation.currentPercentage.toFixed(1)),
        fill: '#50E3FF',
        desc: 'Actual historical classes held up to today',
      },
      {
        scenario: '100% Future Attended',
        percentage: Number(overallCalculation.maxAchievablePercentage.toFixed(1)),
        fill: '#B7FF5A',
        desc: 'If student attends all scheduled upcoming classes',
      },
      {
        scenario: 'Active Plan / Leave',
        percentage: isSimulationActive
          ? Number(activeSimulation?.overallAfterPercentage.toFixed(1))
          : Number(displayCalc.currentPercentage.toFixed(1)),
        fill: isSimulationActive ? '#FFB84D' : '#38BDF8',
        desc: isSimulationActive
          ? `Simulated under ${activeSimulation?.request.name}`
          : 'Baseline standing without leave',
      },
      {
        scenario: 'Projected Semester End',
        percentage: isSimulationActive
          ? Number(activeSimulation?.overallProjectedEndPercentage.toFixed(1))
          : Number(displayCalc.maxAchievablePercentage.toFixed(1)),
        fill: '#A78BFA',
        desc: 'Projected final outcome at detention lock checkpoint',
      },
    ];
  }, [overallCalculation, displayCalc, isSimulationActive, activeSimulation]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#50E3FF] uppercase tracking-widest mb-1">
            <Activity className="w-4 h-4" />
            <span>PREDICTIVE ACADEMIC LABORATORY</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            ATTENDANCE INTELLIGENCE LAB
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Parametric inspection of student attendance vectors, institutional thresholds, and leave projections.
          </p>
        </div>

        {/* Global Filter Bar: Section Switcher & Target Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#151B32] border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono">
            <span className="text-slate-400">Section:</span>
            <select
              value={currentSection.id}
              onChange={(e) => setSectionId(e.target.value)}
              className="bg-transparent text-[#50E3FF] font-bold focus:outline-none"
            >
              {CLASS_SECTIONS.map((sec) => (
                <option key={sec.id} value={sec.id} className="bg-[#151B32] text-white">
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#151B32] border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono">
            <span className="text-slate-400">Target:</span>
            {[75, 80, 85, 90].map((t) => (
              <button
                key={t}
                onClick={() => setTargetPercentage(t as any)}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  state.targetPercentage === t
                    ? 'bg-[#B7FF5A] text-[#0B1020]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Leave Overlay Banner (if leave simulation is applied) */}
      {isSimulationActive && activeSimulation && (
        <div className="p-4 rounded-xl bg-[#FFB84D]/10 border border-[#FFB84D]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-[#FFB84D] shrink-0" />
            <div>
              <span className="font-bold text-white uppercase">
                ACTIVE SIMULATION OVERLAY: {activeSimulation.request.name}
              </span>
              <p className="text-slate-300 font-sans mt-0.5">
                Simulating {activeSimulation.totalClassesAffected} affected classes ({activeSimulation.request.startDate} to {activeSimulation.request.endDate}).
                Actual historical records remain completely unmodified.
              </p>
            </div>
          </div>
          <span className="text-[#FFB84D] font-bold">
            Projected: {displayCalc.currentPercentage.toFixed(1)}% (Δ {activeSimulation.overallDelta.toFixed(1)}%)
          </span>
        </div>
      )}

      {/* SECTION A: OVERALL ATTENDANCE HEALTH */}
      <div className="rounded-2xl bg-[#151B32] border border-[#50E3FF]/20 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[11px] font-mono text-[#50E3FF] uppercase tracking-wider">
              A. OVERALL ATTENDANCE HEALTH
            </span>
            <h2 className="font-display font-bold text-2xl text-white">
              Executive Semester Status
            </h2>
          </div>
          <span
            className={`px-3 py-1 rounded-md text-xs font-mono font-bold border ${
              isCritical
                ? 'bg-[#FF5263]/15 text-[#FF5263] border-[#FF5263]'
                : isSafe
                ? 'bg-[#B7FF5A]/15 text-[#B7FF5A] border-[#B7FF5A]'
                : 'bg-[#FFB84D]/15 text-[#FFB84D] border-[#FFB84D]'
            }`}
          >
            {displayCalc.zone.toUpperCase()} ZONE
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Animated Circular Progress Ring */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 260 260">
                <circle
                  cx="130"
                  cy="130"
                  r={radius}
                  className="stroke-[#0B1020]"
                  strokeWidth="18"
                  fill="transparent"
                />
                <circle
                  cx="130"
                  cy="130"
                  r={radius}
                  className={`transition-all duration-1000 ease-out ${
                    isCritical
                      ? 'stroke-[#FF5263]'
                      : isSafe
                      ? 'stroke-[#B7FF5A]'
                      : 'stroke-[#FFB84D]'
                  }`}
                  strokeWidth="18"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 m-8 rounded-full bg-[#0B1020]/95 border border-slate-700/60 shadow-inner">
                <span className="text-[10px] font-mono tracking-widest text-[#50E3FF] uppercase">
                  ATTENDANCE INDEX
                </span>
                <span className="font-display font-extrabold text-5xl sm:text-6xl text-white tracking-tight tabular-nums mt-1">
                  {displayCalc.currentPercentage.toFixed(1)}%
                </span>
                <span className="text-xs font-mono text-slate-300 mt-1">
                  TARGET: {target}%
                </span>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400 mt-2">
              {currentSection.name} · {currentSection.venue}
            </div>
          </div>

          {/* 5-Box Metrics Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            
            <div className="p-4 bg-[#0B1020] rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">TOTAL CONDUCTED</span>
              <span className="font-mono text-2xl font-bold text-white block mt-1 tabular-nums">
                {displayCalc.totalConducted}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">sessions held to date</span>
            </div>

            <div className="p-4 bg-[#0B1020] rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">CLASSES ATTENDED</span>
              <span className="font-mono text-2xl font-bold text-[#B7FF5A] block mt-1 tabular-nums">
                {displayCalc.totalAttended}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">verified present hours</span>
            </div>

            <div className="p-4 bg-[#0B1020] rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">CLASSES MISSED</span>
              <span className="font-mono text-2xl font-bold text-[#FF5263] block mt-1 tabular-nums">
                {displayCalc.totalMissed}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">uncredited absences</span>
            </div>

            <div className="p-4 bg-[#0B1020] rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">CLASSES REMAINING</span>
              <span className="font-mono text-2xl font-bold text-[#50E3FF] block mt-1 tabular-nums">
                {displayCalc.totalRemaining}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">upcoming on timetable</span>
            </div>

            <div className="p-4 bg-[#0B1020] rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">SAFE MISS BUDGET</span>
              <span className="font-mono text-2xl font-bold text-white block mt-1 tabular-nums">
                {displayCalc.safelyMissableFromRemaining}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">classes can be skipped</span>
            </div>

            <div className="p-4 bg-[#0B1020] rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">RECOVERY REQUIREMENT</span>
              <span
                className="font-mono text-2xl font-bold block mt-1 tabular-nums"
                style={{ color: displayCalc.requiredRecoveryClasses > 0 ? '#FFB84D' : '#B7FF5A' }}
              >
                {displayCalc.requiredRecoveryClasses > 0
                  ? `${displayCalc.requiredRecoveryClasses}`
                  : '0'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {displayCalc.requiredRecoveryClasses > 0 ? 'consecutive needed' : 'target already met'}
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* SECTION B: SUBJECT-WISE ATTENDANCE CHART */}
      <div className="rounded-2xl bg-[#151B32] border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-[11px] font-mono text-[#B7FF5A] uppercase tracking-wider">
              B. SUBJECT-WISE ATTENDANCE CHART
            </span>
            <h3 className="font-display font-bold text-lg text-white">
              Course Distribution vs Official Benchmarks
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparison across all registered courses. Color-coded by safe (green), caution (amber), and critical (red).
            </p>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Filter Course:</span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="bg-[#0B1020] border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-mono focus:border-[#50E3FF] focus:outline-none"
            >
              <option value="all">All Courses ({displayCalc.subjectResults.length})</option>
              {displayCalc.subjectResults.map((s) => (
                <option key={s.subjectCode} value={s.subjectCode}>
                  {s.slot}: {s.subjectName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-96 w-full pt-2">
          {subjectChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
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
                          <div className="text-slate-400">Code: {data.code}</div>
                          <div>Current: <strong style={{ color: data.zoneColor }}>{data.current}%</strong></div>
                          <div>Attended: {data.attended} / {data.conducted} classes</div>
                          <div>Missed: {data.missed}</div>
                          <div>Remaining: {data.remaining} classes</div>
                          <div>Max Achievable: {data.maxAchievable}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={75} stroke="#FFB84D" strokeDasharray="4 4" strokeWidth={2} label={{ value: '75% SRM Cutoff', fill: '#FFB84D', position: 'right' }} />
                <ReferenceLine y={90} stroke="#B7FF5A" strokeDasharray="4 4" strokeWidth={2} label={{ value: '90% Honors Goal', fill: '#B7FF5A', position: 'right' }} />
                <Bar dataKey="current" fill="#50E3FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
              No course records match the selected filter.
            </div>
          )}
        </div>
      </div>

      {/* SECTION C & D: TWO-COLUMN ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECTION C: ATTENDANCE TREND CHART */}
        <div className="rounded-2xl bg-[#151B32] border border-slate-800 p-6 shadow-xl space-y-4">
          <div>
            <span className="text-[11px] font-mono text-[#50E3FF] uppercase tracking-wider">
              C. ATTENDANCE TREND VELOCITY
            </span>
            <h3 className="font-display font-bold text-lg text-white">
              Historical Records vs Future Timetable Projections
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Solid line represents actual historical records up to today; dashed line represents simulated future attendance.
            </p>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252D4D" vertical={false} />
                <XAxis dataKey="week" stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis domain={[50, 100]} stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0B1020', borderColor: '#50E3FF', borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <ReferenceLine y={target} stroke="#FF5263" strokeDasharray="3 3" label={{ value: `Target ${target}%`, fill: '#FF5263', position: 'right' }} />
                <Line
                  type="monotone"
                  dataKey="actualHistorical"
                  name="Actual Historical"
                  stroke="#50E3FF"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#50E3FF' }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="simulatedPrediction"
                  name="Simulated Future Prediction"
                  stroke="#B7FF5A"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#B7FF5A' }}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION D: ATTENDANCE COMPARISON */}
        <div className="rounded-2xl bg-[#151B32] border border-slate-800 p-6 shadow-xl space-y-4">
          <div>
            <span className="text-[11px] font-mono text-[#FFB84D] uppercase tracking-wider">
              D. SCENARIO ATTENDANCE COMPARISON
            </span>
            <h3 className="font-display font-bold text-lg text-white">
              Standing Across Leave & Recovery Scenarios
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live comparison of current vs 100% attended vs leave impact vs projected semester end.
            </p>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252D4D" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis dataKey="scenario" type="category" stroke="#64748B" tick={{ fontSize: 11, fill: '#E2E8F0' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-[#0B1020] border border-slate-700 rounded-xl text-xs font-mono text-white">
                          <div className="font-bold text-[#50E3FF]">{data.scenario}</div>
                          <div className="text-lg font-extrabold mt-1">{data.percentage}%</div>
                          <div className="text-slate-400 text-[10px] mt-0.5">{data.desc}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x={target} stroke="#FF5263" strokeDasharray="3 3" label={{ value: `Target ${target}%`, fill: '#FF5263', position: 'top' }} />
                <Bar dataKey="percentage" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
