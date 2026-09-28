import React, { useState, useRef, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  AdvisorContext,
  ChatMessage,
  processLocalAdvisorQuery,
  buildAdvisorSystemPrompt,
} from '../utils/advisorEngine';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Trash2,
  Bot,
  User,
  Zap,
  HelpCircle,
  Clock,
  ChevronDown,
  Cpu,
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'Can I take 3 days of medical leave?',
  'How many classes can I miss and still maintain 75%?',
  'Will my Chemistry attendance fall below 75%?',
  'How many classes must I attend to reach 90%?',
  'Which subject is currently in the danger zone?',
  'Can I recover my attendance before November?',
];

export const AttendanceAdvisorChatbot: React.FC = () => {
  const {
    state,
    currentSection,
    overallCalculation,
    activeSimulation,
    isChatOpen,
    setIsChatOpen,
    chatMessages,
    addChatMessage,
    clearChatMessages,
  } = useAttendance();

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeModelMode, setActiveModelMode] = useState<'ai' | 'local'>('local');
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend AI availability once on mount
  useEffect(() => {
    async function checkAiStatus() {
      try {
        const res = await fetch('/api/advisor/status');
        if (res.ok) {
          const data = await res.json();
          if (data.aiAvailable) {
            setActiveModelMode('ai');
          } else {
            setActiveModelMode('local');
          }
        }
      } catch (e) {
        setActiveModelMode('local');
      } finally {
        setHasCheckedStatus(true);
      }
    }
    checkAiStatus();
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen, isTyping]);

  const advisorContext: AdvisorContext = {
    section: currentSection,
    overall: overallCalculation,
    currentDate: state.currentDate,
    startDate: state.startDate,
    endDate: state.endDate,
    checkpointDate: state.checkpointDate,
    targetPercentage: state.targetPercentage,
    odPolicy: state.odPolicy,
    mlPolicy: state.mlPolicy,
    activeSimulation,
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isTyping) return;

    // Add user message
    addChatMessage({
      sender: 'user',
      text: textToSend,
      mode: activeModelMode,
    });
    setInputQuery('');
    setIsTyping(true);

    // Try calling server-side Gemini 3.8 Flash endpoint first
    let responseText: string | null = null;
    let modeUsed: 'ai' | 'local' = 'local';

    try {
      const systemInstruction = buildAdvisorSystemPrompt(advisorContext);
      const res = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          systemInstruction,
          history: chatMessages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.mode === 'ai' && data.text) {
          responseText = data.text;
          modeUsed = 'ai';
          setActiveModelMode('ai');
        }
      }
    } catch (err) {
      console.warn('AI Advisor endpoint error, using deterministic calculation engine:', err);
    }

    // Fallback: Deterministic local calculation engine if AI API is unavailable or didn't answer
    if (!responseText) {
      responseText = processLocalAdvisorQuery(textToSend, advisorContext);
      modeUsed = 'local';
      setActiveModelMode('local');
    }

    setIsTyping(false);
    addChatMessage({
      sender: 'assistant',
      text: responseText,
      mode: modeUsed,
    });
  };

  return (
    <>
      {/* Floating Circular AI Assistant Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#151B32] border border-[#50E3FF]/40 text-white shadow-[0_0_25px_rgba(80,227,255,0.3)] hover:border-[#50E3FF] hover:scale-105 transition-all focus:outline-none"
            title="Open Attendance Advisor AI"
          >
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#50E3FF] to-[#B7FF5A] flex items-center justify-center text-[#0B1020] font-bold shadow-md">
              <Bot className="w-5 h-5 stroke-[2.2]" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#B7FF5A] animate-ping" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-bold text-xs tracking-wider text-white">
                ADVISOR AI
              </span>
              <span className="text-[10px] font-mono text-[#50E3FF] tracking-tight">
                Ask before you miss
              </span>
            </div>
          </button>
        ) : null}
      </div>

      {/* Slide-Up / Floating Chat Panel */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 md:w-[440px] h-[580px] max-h-[85vh] bg-[#151B32] border border-[#50E3FF]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md">
          
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-slate-800 bg-[#0B1020]/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#50E3FF]/20 to-[#B7FF5A]/20 border border-[#50E3FF]/40 flex items-center justify-center text-[#B7FF5A]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-sm text-white">
                    ATTENDANCE ADVISOR
                  </h3>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                      activeModelMode === 'ai'
                        ? 'bg-[#B7FF5A]/20 text-[#B7FF5A] border border-[#B7FF5A]/30'
                        : 'bg-[#50E3FF]/20 text-[#50E3FF] border border-[#50E3FF]/30'
                    }`}
                  >
                    {activeModelMode === 'ai' ? 'GEMINI 3.8 FLASH' : 'LOCAL ENGINE'}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400">
                  {currentSection.name} · Target {state.targetPercentage}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={clearChatMessages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Advisor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Viewport */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#0B1020] border border-[#50E3FF]/30 flex items-center justify-center text-[#50E3FF] shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-1 shadow-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#50E3FF] text-[#0B1020] font-medium rounded-tr-sm'
                      : 'bg-[#0B1020]/90 text-slate-200 border border-slate-800 rounded-tl-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div
                    className={`text-[9px] font-mono flex items-center justify-end gap-1.5 pt-1 ${
                      msg.sender === 'user' ? 'text-[#0B1020]/70' : 'text-slate-500'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <span>· {msg.mode === 'ai' ? 'Gemini AI' : 'Deterministic'}</span>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-[#50E3FF] flex items-center justify-center text-[#0B1020] shrink-0 mt-0.5 font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] p-2 bg-[#0B1020]/50 rounded-xl w-max">
                <span className="w-2 h-2 rounded-full bg-[#50E3FF] animate-ping" />
                <span>Advisor is computing timetable trajectory...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Questions Carousel */}
          <div className="px-4 py-2 border-t border-slate-800/80 bg-[#0B1020]/50 overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-max">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-lg bg-[#151B32] border border-slate-800 hover:border-[#50E3FF]/50 text-slate-300 hover:text-white text-[11px] font-mono whitespace-nowrap transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800 bg-[#0B1020]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about leaves, safe bunks, or targets..."
                className="flex-1 bg-[#151B32] border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs font-mono focus:border-[#50E3FF] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="p-2 rounded-xl bg-[#B7FF5A] text-[#0B1020] hover:bg-[#a6f343] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_rgba(183,255,90,0.2)]"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
