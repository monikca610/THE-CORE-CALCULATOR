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
  'How many classes can I miss and maintain 75%?',
  'Will my Chemistry attendance fall below 75%?',
  'How many classes must I attend to reach 90%?',
  'Which subject is currently in the danger zone?',
  'Can I recover my attendance before semester end?',
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
            className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#0D1527] border border-white/[0.12] text-white shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:border-[#E5C07B]/60 hover:scale-105 transition-all focus:outline-none"
            title="Open Attendance Advisor AI"
          >
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#E5C07B] to-[#B7FF5A] flex items-center justify-center text-[#080D1A] font-bold shadow-md">
              <Bot className="w-4 h-4 stroke-[2.4]" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#B7FF5A] animate-ping" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-bold text-xs tracking-wider text-[#FAF8F2]">
                ATTENDANCE ADVISOR
              </span>
              <span className="text-[10px] font-mono text-[#E5C07B] tracking-tight">
                Ask before you miss a class
              </span>
            </div>
          </button>
        ) : null}
      </div>

      {/* Slide-Up / Floating Chat Panel */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 md:w-[450px] h-[600px] max-h-[85vh] bg-[#0D1527]/95 border border-white/[0.12] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden backdrop-blur-2xl">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-white/[0.08] bg-[#080D1A]/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#E5C07B]/15 border border-[#E5C07B]/30 flex items-center justify-center text-[#E5C07B]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-sm text-[#FAF8F2]">
                    ATTENDANCE ADVISOR
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
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
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Close Advisor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Viewport */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5 font-sans text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#080D1A] border border-white/[0.1] flex items-center justify-center text-[#E5C07B] shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-1.5 shadow-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#FAF8F2] text-[#080D1A] font-medium rounded-tr-sm shadow-md'
                      : 'bg-[#080D1A]/90 text-slate-200 border border-white/[0.08] rounded-tl-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div
                    className={`text-[9px] font-mono flex items-center justify-end gap-1.5 pt-1 ${
                      msg.sender === 'user' ? 'text-[#080D1A]/60' : 'text-slate-500'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <span>· {msg.mode === 'ai' ? 'Gemini AI' : 'Deterministic'}</span>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-[#FAF8F2] flex items-center justify-center text-[#080D1A] shrink-0 mt-0.5 font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] p-3 bg-[#080D1A]/70 rounded-2xl w-max border border-white/[0.06]">
                <span className="w-2 h-2 rounded-full bg-[#E5C07B] animate-ping" />
                <span>Advisor is computing timetable trajectory...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Questions Carousel */}
          <div className="px-4 py-2.5 border-t border-white/[0.06] bg-[#080D1A]/60 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-3 py-1.5 rounded-xl bg-[#0D1527] border border-white/[0.08] hover:border-[#E5C07B]/50 text-slate-300 hover:text-white text-[11px] font-mono whitespace-nowrap transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3.5 border-t border-white/[0.08] bg-[#080D1A]">
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
                className="flex-1 bg-[#0D1527] border border-white/[0.1] text-white rounded-2xl px-4 py-2.5 text-xs font-mono focus:border-[#E5C07B] focus:outline-none placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="p-2.5 rounded-2xl bg-[#FAF8F2] text-[#080D1A] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
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
