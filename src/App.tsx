/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { CommandCenter } from './components/CommandCenter';
import { AttendanceIntelligenceLab } from './components/AttendanceIntelligenceLab';
import { LeaveSimulator } from './components/LeaveSimulator';
import { TimeMachinePlanner } from './components/TimeMachinePlanner';
import { RecoveryEngine } from './components/RecoveryEngine';
import { LiveTimetable } from './components/LiveTimetable';
import { StudentSetupWizard } from './components/StudentSetupWizard';
import { NotificationCenter } from './components/NotificationCenter';
import { SettingsModal } from './components/SettingsModal';
import { AttendanceAdvisorChatbot } from './components/AttendanceAdvisorChatbot';
import {
  LayoutDashboard,
  BarChart3,
  Zap,
  Sparkles,
  Calendar,
  Clock,
  Compass,
} from 'lucide-react';

export type ActiveTab = 'landing' | 'command' | 'analytics' | 'leave' | 'timemachine' | 'recovery' | 'timetable';

function AppContent() {
  const { state, setSectionId, setIsChatOpen, isSimulationActive } = useAttendance();
  const [currentTab, setCurrentTab] = useState<ActiveTab>('command');
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 flex flex-col font-sans selection:bg-[#B7FF5A] selection:text-[#080D1A] antialiased">
      {/* 3-Zone Header Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSetup={() => setIsSetupOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAdvisor={() => setIsChatOpen(true)}
      />

      {/* Main Layout Area: Sidebar on desktop + Viewport */}
      <div className="flex-1 flex w-full">
        {/* Consistent Desktop Sidebar (hidden when on full-screen landing page) */}
        {currentTab !== 'landing' && (
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            onOpenAdvisor={() => setIsChatOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenSetup={() => setIsSetupOpen(true)}
          />
        )}

        {/* Main Content Area */}
        <main className={`flex-1 pb-24 lg:pb-12 overflow-x-hidden ${currentTab !== 'landing' ? 'w-full' : ''}`}>
          {currentTab === 'landing' && (
            <LandingPage
              onInitialize={() => setIsSetupOpen(true)}
              onExplore={() => setCurrentTab('command')}
              onSelectSection={(id) => {
                setSectionId(id);
                setCurrentTab('command');
              }}
            />
          )}

          {currentTab === 'command' && (
            <CommandCenter
              onNavigateToRecovery={() => setCurrentTab('recovery')}
              onNavigateToTimeMachine={() => setCurrentTab('timemachine')}
              onOpenSetup={() => setIsSetupOpen(true)}
            />
          )}

          {currentTab === 'analytics' && <AttendanceIntelligenceLab />}

          {currentTab === 'leave' && <LeaveSimulator />}

          {currentTab === 'timemachine' && <TimeMachinePlanner />}

          {currentTab === 'recovery' && <RecoveryEngine />}

          {currentTab === 'timetable' && <LiveTimetable />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Touch-friendly 6-item control) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0D1527]/95 backdrop-blur-xl border-t border-white/[0.08] px-3 py-2 flex items-center justify-around text-[10px] font-mono shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => setCurrentTab('command')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-colors ${
            currentTab === 'command' ? 'text-[#FAF8F2] font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentTab('analytics')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-colors ${
            currentTab === 'analytics' ? 'text-[#B7FF5A] font-bold' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Lab</span>
        </button>

        <button
          onClick={() => setCurrentTab('leave')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl relative transition-colors ${
            currentTab === 'leave' ? 'text-[#E5C07B] font-bold' : 'text-slate-400'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Leave</span>
          {isSimulationActive && (
            <span className="absolute top-0 right-1 w-1.5 h-1.5 rounded-full bg-[#E5C07B]" />
          )}
        </button>

        <button
          onClick={() => setCurrentTab('timemachine')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-colors ${
            currentTab === 'timemachine' ? 'text-[#50E3FF] font-bold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Chrono</span>
        </button>

        <button
          onClick={() => setCurrentTab('timetable')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-colors ${
            currentTab === 'timetable' ? 'text-[#B7FF5A] font-bold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Timetable</span>
        </button>

        <button
          onClick={() => setCurrentTab('landing')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-colors ${
            currentTab === 'landing' ? 'text-white font-bold' : 'text-slate-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Home</span>
        </button>
      </nav>

      {/* Floating Attendance Advisor AI Assistant on all pages */}
      <AttendanceAdvisorChatbot />

      {/* Modals & Drawers */}
      <StudentSetupWizard
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onComplete={() => setCurrentTab('command')}
      />

      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectSubject={() => {
          setCurrentTab('command');
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
}
