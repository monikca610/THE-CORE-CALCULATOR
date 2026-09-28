import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  PERIOD_TIMINGS_DEFAULT,
  PERIOD_TIMINGS_YEAR_1,
  CLASS_SECTIONS,
} from '../data/timetableData';
import {
  Calendar,
  Clock,
  Download,
  Filter,
  User,
  MapPin,
  BookOpen,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export const LiveTimetable: React.FC = () => {
  const { currentSection, setSectionId, state } = useAttendance();
  const [selectedDay, setSelectedDay] = useState<string>('all');

  const days: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'> = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];

  const timings = currentSection.semesterNumber === 1 ? PERIOD_TIMINGS_YEAR_1 : PERIOD_TIMINGS_DEFAULT;

  const exportCsv = () => {
    let csv = `Day,Period,Time,Subject Code,Subject Name,Faculty,Room\n`;
    days.forEach((day) => {
      const schedule = currentSection.schedule[day] || [];
      schedule.forEach((slot) => {
        const sub = currentSection.subjects.find((s) => s.code === slot.subjectCode);
        csv += `"${day}","${slot.period}","${slot.time}","${slot.subjectCode}","${sub?.name || ''}","${sub?.faculty || ''}","${slot.room || currentSection.venue}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSection.id}_timetable.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#50E3FF] uppercase tracking-widest mb-1">
            <Calendar className="w-4 h-4" />
            <span>AUTHENTIC SRM INSTITUTE DATASET</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            LIVE TIMETABLE INTELLIGENCE
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Section: <strong className="text-white">{currentSection.name}</strong> · Batch: {currentSection.batchYear} · Venue: <strong className="text-[#50E3FF]">{currentSection.venue}</strong>
          </p>
        </div>

        {/* Section switcher & CSV Export */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={currentSection.id}
            onChange={(e) => setSectionId(e.target.value)}
            className="bg-[#151B32] border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono focus:border-[#50E3FF] focus:outline-none"
          >
            {CLASS_SECTIONS.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name} ({sec.semester})
              </option>
            ))}
          </select>

          <button
            onClick={exportCsv}
            className="px-3.5 py-2 rounded-xl bg-[#0B1020] border border-[#50E3FF]/40 text-[#50E3FF] text-xs font-mono hover:bg-[#151B32] flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Day Filter Segmented Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-[#151B32] border border-slate-800 rounded-xl text-xs font-mono overflow-x-auto">
        <button
          onClick={() => setSelectedDay('all')}
          className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            selectedDay === 'all'
              ? 'bg-[#B7FF5A] text-[#0B1020] font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Full Week Grid
        </button>
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedDay === d
                ? 'bg-[#50E3FF] text-[#0B1020] font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Weekly Timetable Schedule Matrix */}
      <div className="rounded-2xl bg-[#151B32] border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-white font-bold">WEEKLY SCHEDULE MATRIX</span>
          <span className="text-slate-400">Timings: 09:00 AM – 04:50 PM · Mon to Fri</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3 w-28">DAY</th>
                {timings.slice(0, 9).map((t) => (
                  <th key={t.period} className="py-3 px-2 text-center border-l border-slate-800/80">
                    <div>P{t.period}</div>
                    <div className="text-[9px] text-slate-500 font-normal whitespace-nowrap">{t.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days
                .filter((d) => selectedDay === 'all' || selectedDay === d)
                .map((day) => {
                  const schedule = currentSection.schedule[day] || [];
                  const slotMap = new Map<number, (typeof schedule)[0]>();
                  schedule.forEach((s) => slotMap.set(s.period, s));

                  return (
                    <tr key={day} className="border-b border-slate-800/60 hover:bg-[#0B1020]/40 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">
                        {day}
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((p) => {
                        const slot = slotMap.get(p);
                        if (p === 5) {
                          // Lunch period
                          return (
                            <td
                              key={p}
                              className="py-2 px-1 text-center bg-[#0B1020]/40 text-slate-500 text-[10px] border-l border-slate-800/80"
                            >
                              LUNCH
                            </td>
                          );
                        }

                        if (!slot) {
                          return (
                            <td
                              key={p}
                              className="py-2 px-1 text-center text-slate-600 border-l border-slate-800/80"
                            >
                              -
                            </td>
                          );
                        }

                        const sub = currentSection.subjects.find((s) => s.code === slot.subjectCode);

                        return (
                          <td
                            key={p}
                            className="py-2 px-1.5 text-center border-l border-slate-800/80"
                          >
                            <div
                              className="p-1.5 rounded-lg border text-center transition-all"
                              style={{
                                backgroundColor: sub ? `${sub.color}15` : '#151B32',
                                borderColor: sub ? `${sub.color}40` : '#334155',
                              }}
                            >
                              <div
                                className="font-bold text-[11px] truncate"
                                style={{ color: sub?.color || '#50E3FF' }}
                              >
                                {sub?.slot ? `Slot ${sub.slot}` : slot.subjectCode}
                              </div>
                              <div className="text-[10px] text-white truncate font-sans">
                                {sub?.code || slot.subjectCode}
                              </div>
                              {slot.room && (
                                <div className="text-[9px] text-slate-400 truncate">
                                  {slot.room}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subjects Roster & Faculty Table */}
      <div className="rounded-2xl bg-[#151B32] border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-white font-bold">COURSE ROSTER & FACULTY ASSIGNMENTS</span>
          <span className="text-slate-400">{currentSection.subjects.length} registered courses</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">SLOT</th>
                <th className="py-2.5 px-3">SUB CODE</th>
                <th className="py-2.5 px-3 font-sans">SUBJECT NAME</th>
                <th className="py-2.5 px-3">CREDITS</th>
                <th className="py-2.5 px-3">HRS/WK</th>
                <th className="py-2.5 px-3 font-sans">FACULTY NAME</th>
                <th className="py-2.5 px-3">DEPT</th>
              </tr>
            </thead>
            <tbody>
              {currentSection.subjects.map((sub) => (
                <tr key={sub.code} className="border-b border-slate-800/40 hover:bg-[#0B1020]/30 transition-colors">
                  <td className="py-3 px-3">
                    <span
                      className="px-2 py-0.5 rounded font-bold text-[10px]"
                      style={{
                        backgroundColor: `${sub.color}20`,
                        color: sub.color,
                        border: `1px solid ${sub.color}40`,
                      }}
                    >
                      {sub.slot}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-white font-bold">{sub.code}</td>
                  <td className="py-3 px-3 font-sans text-slate-200 font-medium">{sub.name}</td>
                  <td className="py-3 px-3 text-slate-300">{sub.credits}</td>
                  <td className="py-3 px-3 text-[#50E3FF] font-bold">{sub.periodsPerWeek}</td>
                  <td className="py-3 px-3 font-sans text-slate-300">{sub.faculty}</td>
                  <td className="py-3 px-3 text-slate-400">{sub.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
