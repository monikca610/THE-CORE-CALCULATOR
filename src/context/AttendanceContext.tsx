import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  CLASS_SECTIONS,
  ClassSection,
  DEFAULT_SEMESTER_CONFIG,
  ACADEMIC_EVENTS_2026,
} from '../data/timetableData';
import {
  TargetPercentage,
  SubjectAttendanceInput,
  generateClassOccurrences,
  calculateOverallSemester,
  OverallSemesterCalculation,
  ScheduledClassOccurrence,
} from '../utils/attendanceEngine';
import {
  ODPolicy,
  MLPolicy,
  LeaveSimulationResult,
  simulateLeave,
  LeaveSimulationRequest,
} from '../utils/leaveSimulator';
import { ChatMessage } from '../utils/advisorEngine';

export interface SmartNotification {
  id: string;
  type: 'critical' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  subjectCode?: string;
}

export interface AttendanceState {
  sectionId: string;
  startDate: string;
  endDate: string;
  currentDate: string;
  checkpointDate: string;
  targetPercentage: TargetPercentage;
  subjectInputs: Record<string, SubjectAttendanceInput>;
  futurePlan: Record<string, 'attend' | 'absent' | 'unplanned'>;
  timeMachineScenario: 'perfect' | 'miss_all' | 'custom';
  isInitialized: boolean;
  // Phase 2 Leave Policies
  odPolicy: ODPolicy;
  mlPolicy: MLPolicy;
  maxODSessionsAllowed: number;
}

interface AttendanceContextType {
  state: AttendanceState;
  currentSection: ClassSection;
  overallCalculation: OverallSemesterCalculation;
  simulatedCalculation: OverallSemesterCalculation;
  isSimulationActive: boolean;
  activeSimulation: LeaveSimulationResult | null;
  savedScenarios: LeaveSimulationResult[];
  occurrences: ScheduledClassOccurrence[];
  conductedFromTimetable: Record<string, number>;
  remainingFromTimetable: Record<string, number>;
  notifications: SmartNotification[];
  unreadNotificationCount: number;
  // Chatbot State
  isChatOpen: boolean;
  chatMessages: ChatMessage[];
  setIsChatOpen: (open: boolean) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatMessages: () => void;
  // Actions
  setSectionId: (id: string) => void;
  setSemesterDates: (start: string, end: string, current: string, checkpoint?: string) => void;
  setTargetPercentage: (target: TargetPercentage) => void;
  updateSubjectAttendance: (code: string, conducted: number, attended: number) => void;
  applyAttendancePreset: (preset: 'timetable' | 'high' | 'borderline' | 'critical') => void;
  setTimeMachineScenario: (scenario: 'perfect' | 'miss_all' | 'custom') => void;
  setFuturePlanForClass: (occurrenceId: string, status: 'attend' | 'absent' | 'unplanned') => void;
  bulkSetFuturePlan: (status: 'attend' | 'absent' | 'unplanned') => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  completeInitialization: () => void;
  resetAllData: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
  // Leave Simulator Actions
  setODPolicy: (policy: ODPolicy) => void;
  setMLPolicy: (policy: MLPolicy) => void;
  setMaxODSessionsAllowed: (count: number) => void;
  applySimulation: (sim: LeaveSimulationResult) => void;
  resetSimulation: () => void;
  saveScenario: (sim: LeaveSimulationResult) => void;
  deleteScenario: (id: string) => void;
}

const STORAGE_KEY = 'the_core_calculator_v2_state';
const SCENARIOS_STORAGE_KEY = 'the_core_calculator_v2_scenarios';
const CHAT_STORAGE_KEY = 'the_core_calculator_v2_chat';

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AttendanceState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved state:', e);
    }

    const defaultSec = CLASS_SECTIONS[0];
    const initialInputs: Record<string, SubjectAttendanceInput> = {};
    defaultSec.subjects.forEach((sub) => {
      const baseConducted = Math.round(sub.periodsPerWeek * 7);
      const baseAttended = Math.round(baseConducted * 0.78);
      initialInputs[sub.code] = {
        subjectCode: sub.code,
        conductedClasses: baseConducted,
        attendedClasses: baseAttended,
      };
    });

    return {
      sectionId: defaultSec.id,
      startDate: DEFAULT_SEMESTER_CONFIG.startDate,
      endDate: DEFAULT_SEMESTER_CONFIG.endDate,
      currentDate: DEFAULT_SEMESTER_CONFIG.currentDate,
      checkpointDate: DEFAULT_SEMESTER_CONFIG.checkpointDate,
      targetPercentage: DEFAULT_SEMESTER_CONFIG.defaultTarget as TargetPercentage,
      subjectInputs: initialInputs,
      futurePlan: {},
      timeMachineScenario: 'perfect',
      isInitialized: false,
      odPolicy: 'counts_attended',
      mlPolicy: 'ordinary_absence',
      maxODSessionsAllowed: 12,
    };
  });

  const [activeSimulation, setActiveSimulation] = useState<LeaveSimulationResult | null>(null);

  const [savedScenarios, setSavedScenarios] = useState<LeaveSimulationResult[]>(() => {
    try {
      const saved = localStorage.getItem(SCENARIOS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load scenarios:', e);
    }
    return [];
  });

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'welcome',
        sender: 'assistant',
        text: 'Greetings. I am your Attendance Advisor for SRM Institute. Ask me about upcoming classes, safe bunk margins, or simulate On-Duty and Medical Leave impacts before taking time off.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: 'local',
      },
    ];
  });

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(savedScenarios));
    } catch (e) {}
  }, [savedScenarios]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages));
    } catch (e) {}
  }, [chatMessages]);

  const currentSection = useMemo(() => {
    return CLASS_SECTIONS.find((s) => s.id === state.sectionId) || CLASS_SECTIONS[0];
  }, [state.sectionId]);

  // Generate class occurrences from timetable
  const { occurrences, conductedPerSubject, remainingPerSubject } = useMemo(() => {
    return generateClassOccurrences(
      currentSection,
      state.startDate,
      state.endDate,
      state.currentDate,
      state.futurePlan
    );
  }, [currentSection, state.startDate, state.endDate, state.currentDate, state.futurePlan]);

  // Actual Historical/Configured Overall calculation
  const overallCalculation = useMemo(() => {
    return calculateOverallSemester(
      currentSection,
      state.subjectInputs,
      remainingPerSubject,
      state.targetPercentage
    );
  }, [currentSection, state.subjectInputs, remainingPerSubject, state.targetPercentage]);

  // Simulated Calculation (when an active leave simulation is applied)
  const simulatedCalculation = useMemo(() => {
    if (!activeSimulation) return overallCalculation;

    const simInputs: Record<string, SubjectAttendanceInput> = {};
    const simRemaining: Record<string, number> = {};

    activeSimulation.subjectImpacts.forEach((imp) => {
      simInputs[imp.subjectCode] = {
        subjectCode: imp.subjectCode,
        conductedClasses: imp.simulatedConducted,
        attendedClasses: imp.simulatedAttended,
      };
      simRemaining[imp.subjectCode] = imp.remainingAfterLeave;
    });

    return calculateOverallSemester(
      currentSection,
      simInputs,
      simRemaining,
      state.targetPercentage
    );
  }, [activeSimulation, overallCalculation, currentSection, state.targetPercentage]);

  // Smart dynamic notifications
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

  const notifications = useMemo<SmartNotification[]>(() => {
    const list: SmartNotification[] = [];

    // Check if simulation is active
    if (activeSimulation) {
      list.push({
        id: 'sim_active_notice',
        type: 'info',
        title: `Simulation Active: ${activeSimulation.request.name}`,
        message: `Projected attendance is ${activeSimulation.overallAfterPercentage}% (${activeSimulation.totalClassesAffected} classes affected). Historical records remain unmodified.`,
        timestamp: 'Active Leave Overlay',
        read: readNotificationIds.has('sim_active_notice'),
      });
    }

    // Critical Irreversible Detention alerts
    overallCalculation.subjectResults.forEach((sub) => {
      if (sub.isIrreversibleDetention) {
        list.push({
          id: `crit_${sub.subjectCode}`,
          type: 'critical',
          title: `CRITICAL ALERT: ${sub.subjectName}`,
          message: `Maximum achievable attendance is ${sub.maxAchievablePercentage}%, below your ${state.targetPercentage}% target. Even 100% attendance cannot prevent detention!`,
          timestamp: 'Live Calculation',
          read: readNotificationIds.has(`crit_${sub.subjectCode}`),
          subjectCode: sub.subjectCode,
        });
      } else if (sub.zone === 'caution') {
        list.push({
          id: `warn_${sub.subjectCode}`,
          type: 'warning',
          title: `Caution Zone: ${sub.subjectName}`,
          message: `Current attendance is ${sub.currentPercentage}%. You must attend at least ${sub.requiredRecoveryClasses} consecutive classes to reach ${state.targetPercentage}%.`,
          timestamp: 'Live Calculation',
          read: readNotificationIds.has(`warn_${sub.subjectCode}`),
          subjectCode: sub.subjectCode,
        });
      }
    });

    // Safe zone praise
    if (overallCalculation.currentPercentage >= state.targetPercentage && !overallCalculation.hasCriticalSubjects) {
      list.push({
        id: 'target_met',
        type: 'success',
        title: `Target Met: Overall Status Nominal`,
        message: `Your aggregate attendance of ${overallCalculation.currentPercentage}% is above your ${state.targetPercentage}% target. You have ${overallCalculation.safelyMissableFromRemaining} safe miss credits remaining!`,
        timestamp: 'Academic Status',
        read: readNotificationIds.has('target_met'),
      });
    }

    // Semester Checkpoint approaching
    const daysLeft = Math.ceil(
      (new Date(state.checkpointDate).getTime() - new Date(state.currentDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysLeft > 0 && daysLeft <= 60) {
      list.push({
        id: 'checkpoint_notice',
        type: 'info',
        title: `Attendance Lock Checkpoint in ${daysLeft} Days`,
        message: `Detention cutoff locked on ${state.checkpointDate}. Verify all pending attendance logs before internal evaluation.`,
        timestamp: 'SRM IST Academic Calendar',
        read: readNotificationIds.has('checkpoint_notice'),
      });
    }

    return list;
  }, [overallCalculation, state.targetPercentage, state.checkpointDate, state.currentDate, readNotificationIds, activeSimulation]);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  // Actions
  const setSectionId = (id: string) => {
    const sec = CLASS_SECTIONS.find((s) => s.id === id);
    if (!sec) return;

    const newInputs: Record<string, SubjectAttendanceInput> = {};
    sec.subjects.forEach((sub) => {
      const baseConducted = Math.max(10, Math.round(sub.periodsPerWeek * 7));
      const baseAttended = Math.round(baseConducted * 0.78);
      newInputs[sub.code] = {
        subjectCode: sub.code,
        conductedClasses: baseConducted,
        attendedClasses: baseAttended,
      };
    });

    setState((prev) => ({
      ...prev,
      sectionId: id,
      subjectInputs: newInputs,
      futurePlan: {},
    }));
    setActiveSimulation(null);
  };

  const setSemesterDates = (start: string, end: string, current: string, checkpoint?: string) => {
    setState((prev) => ({
      ...prev,
      startDate: start,
      endDate: end,
      currentDate: current,
      checkpointDate: checkpoint || prev.checkpointDate,
    }));
    setActiveSimulation(null);
  };

  const setTargetPercentage = (target: TargetPercentage) => {
    setState((prev) => ({
      ...prev,
      targetPercentage: target,
    }));
  };

  const updateSubjectAttendance = (code: string, conducted: number, attended: number) => {
    setState((prev) => {
      const cond = Math.max(0, conducted);
      const att = Math.min(cond, Math.max(0, attended));
      return {
        ...prev,
        subjectInputs: {
          ...prev.subjectInputs,
          [code]: {
            subjectCode: code,
            conductedClasses: cond,
            attendedClasses: att,
          },
        },
      };
    });
  };

  const applyAttendancePreset = (preset: 'timetable' | 'high' | 'borderline' | 'critical') => {
    setState((prev) => {
      const newInputs: Record<string, SubjectAttendanceInput> = {};

      currentSection.subjects.forEach((sub) => {
        const conducted = conductedPerSubject[sub.code] || Math.round(sub.periodsPerWeek * 8);
        let attended = conducted;

        if (preset === 'timetable') {
          attended = Math.round(conducted * 0.82);
        } else if (preset === 'high') {
          attended = Math.round(conducted * 0.92);
        } else if (preset === 'borderline') {
          attended = Math.round(conducted * 0.73);
        } else if (preset === 'critical') {
          attended = Math.round(conducted * 0.58);
        }

        newInputs[sub.code] = {
          subjectCode: sub.code,
          conductedClasses: conducted,
          attendedClasses: Math.max(0, Math.min(conducted, attended)),
        };
      });

      return {
        ...prev,
        subjectInputs: newInputs,
      };
    });
    setActiveSimulation(null);
  };

  const setTimeMachineScenario = (scenario: 'perfect' | 'miss_all' | 'custom') => {
    setState((prev) => {
      const newPlan: Record<string, 'attend' | 'absent' | 'unplanned'> = {};
      if (scenario === 'perfect') {
        occurrences.filter((o) => !o.isCompleted && !o.isHoliday).forEach((o) => {
          newPlan[o.id] = 'attend';
        });
      } else if (scenario === 'miss_all') {
        occurrences.filter((o) => !o.isCompleted && !o.isHoliday).forEach((o) => {
          newPlan[o.id] = 'absent';
        });
      }
      return {
        ...prev,
        timeMachineScenario: scenario,
        futurePlan: scenario === 'custom' ? prev.futurePlan : newPlan,
      };
    });
  };

  const setFuturePlanForClass = (occurrenceId: string, status: 'attend' | 'absent' | 'unplanned') => {
    setState((prev) => ({
      ...prev,
      timeMachineScenario: 'custom',
      futurePlan: {
        ...prev.futurePlan,
        [occurrenceId]: status,
      },
    }));
  };

  const bulkSetFuturePlan = (status: 'attend' | 'absent' | 'unplanned') => {
    setState((prev) => {
      const updated: Record<string, 'attend' | 'absent' | 'unplanned'> = {};
      occurrences.filter((o) => !o.isCompleted && !o.isHoliday).forEach((o) => {
        updated[o.id] = status;
      });
      return {
        ...prev,
        timeMachineScenario: status === 'attend' ? 'perfect' : status === 'absent' ? 'miss_all' : 'custom',
        futurePlan: updated,
      };
    });
  };

  const markNotificationRead = (id: string) => {
    setReadNotificationIds((prev) => new Set([...prev, id]));
  };

  const markAllNotificationsRead = () => {
    setReadNotificationIds(new Set(notifications.map((n) => n.id)));
  };

  const completeInitialization = () => {
    setState((prev) => ({ ...prev, isInitialized: true }));
  };

  // Leave Simulation Actions
  const setODPolicy = (policy: ODPolicy) => {
    setState((prev) => ({ ...prev, odPolicy: policy }));
  };

  const setMLPolicy = (policy: MLPolicy) => {
    setState((prev) => ({ ...prev, mlPolicy: policy }));
  };

  const setMaxODSessionsAllowed = (count: number) => {
    setState((prev) => ({ ...prev, maxODSessionsAllowed: count }));
  };

  const applySimulation = (sim: LeaveSimulationResult) => {
    setActiveSimulation(sim);
  };

  const resetSimulation = () => {
    setActiveSimulation(null);
  };

  const saveScenario = (sim: LeaveSimulationResult) => {
    setSavedScenarios((prev) => {
      const exists = prev.some((s) => s.request.id === sim.request.id);
      if (exists) {
        return prev.map((s) => (s.request.id === sim.request.id ? sim : s));
      }
      return [sim, ...prev];
    });
  };

  const deleteScenario = (id: string) => {
    setSavedScenarios((prev) => prev.filter((s) => s.request.id !== id));
  };

  // Chatbot Actions
  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const clearChatMessages = () => {
    setChatMessages([
      {
        id: 'welcome_reset',
        sender: 'assistant',
        text: `Conversation cleared. Attendance telemetry for ${currentSection.name} ready for queries.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: 'local',
      },
    ]);
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SCENARIOS_STORAGE_KEY);
    localStorage.removeItem(CHAT_STORAGE_KEY);

    const defaultSec = CLASS_SECTIONS[0];
    const initialInputs: Record<string, SubjectAttendanceInput> = {};
    defaultSec.subjects.forEach((sub) => {
      const baseConducted = Math.round(sub.periodsPerWeek * 7);
      const baseAttended = Math.round(baseConducted * 0.78);
      initialInputs[sub.code] = {
        subjectCode: sub.code,
        conductedClasses: baseConducted,
        attendedClasses: baseAttended,
      };
    });
    setState({
      sectionId: defaultSec.id,
      startDate: DEFAULT_SEMESTER_CONFIG.startDate,
      endDate: DEFAULT_SEMESTER_CONFIG.endDate,
      currentDate: DEFAULT_SEMESTER_CONFIG.currentDate,
      checkpointDate: DEFAULT_SEMESTER_CONFIG.checkpointDate,
      targetPercentage: 75,
      subjectInputs: initialInputs,
      futurePlan: {},
      timeMachineScenario: 'perfect',
      isInitialized: false,
      odPolicy: 'counts_attended',
      mlPolicy: 'ordinary_absence',
      maxODSessionsAllowed: 12,
    });
    setActiveSimulation(null);
    setSavedScenarios([]);
    setReadNotificationIds(new Set());
    clearChatMessages();
  };

  const exportDataJson = () => {
    return JSON.stringify(
      {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        state,
        activeSimulation,
        savedScenarios,
        summary: overallCalculation,
      },
      null,
      2
    );
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.state && parsed.state.sectionId) {
        setState(parsed.state);
        if (parsed.savedScenarios) setSavedScenarios(parsed.savedScenarios);
        if (parsed.activeSimulation) setActiveSimulation(parsed.activeSimulation);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        state,
        currentSection,
        overallCalculation,
        simulatedCalculation,
        isSimulationActive: Boolean(activeSimulation),
        activeSimulation,
        savedScenarios,
        occurrences,
        conductedFromTimetable: conductedPerSubject,
        remainingFromTimetable: remainingPerSubject,
        notifications,
        unreadNotificationCount,
        isChatOpen,
        chatMessages,
        setIsChatOpen,
        addChatMessage,
        clearChatMessages,
        setSectionId,
        setSemesterDates,
        setTargetPercentage,
        updateSubjectAttendance,
        applyAttendancePreset,
        setTimeMachineScenario,
        setFuturePlanForClass,
        bulkSetFuturePlan,
        markNotificationRead,
        markAllNotificationsRead,
        completeInitialization,
        resetAllData,
        exportDataJson,
        importDataJson,
        setODPolicy,
        setMLPolicy,
        setMaxODSessionsAllowed,
        applySimulation,
        resetSimulation,
        saveScenario,
        deleteScenario,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
