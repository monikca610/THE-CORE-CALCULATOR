import React from 'react';
import { useAttendance, SmartNotification } from '../context/AttendanceContext';
import {
  X,
  Bell,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  Check,
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSubject?: (code: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onSelectSubject,
}) => {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAttendance();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#080D1A]/70 backdrop-blur-md">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0D1527]/95 border-l border-white/[0.1] shadow-2xl flex flex-col backdrop-blur-2xl">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-[#080D1A]/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E5C07B]/15 text-[#E5C07B] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-base text-[#FAF8F2]">
                NOTIFICATION CENTER
              </h3>
              {unreadNotificationCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#FF5263] text-white font-bold">
                  {unreadNotificationCount} NEW
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadNotificationCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs font-mono text-[#E5C07B] hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notif) => {
                const isCrit = notif.type === 'critical';
                const isWarn = notif.type === 'warning';
                const isSuccess = notif.type === 'success';

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationRead(notif.id);
                      if (notif.subjectCode && onSelectSubject) {
                        onSelectSubject(notif.subjectCode);
                        onClose();
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      !notif.read
                        ? isCrit
                          ? 'bg-[#FF5263]/10 border-[#FF5263]/40 shadow-sm'
                          : isWarn
                          ? 'bg-[#FFB84D]/10 border-[#FFB84D]/40 shadow-sm'
                          : isSuccess
                          ? 'bg-[#B7FF5A]/10 border-[#B7FF5A]/40 shadow-sm'
                          : 'bg-[#50E3FF]/10 border-[#50E3FF]/40 shadow-sm'
                        : 'bg-[#080D1A]/60 border-white/[0.04] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {isCrit && <ShieldAlert className="w-4 h-4 text-[#FF5263]" />}
                        {isWarn && <AlertTriangle className="w-4 h-4 text-[#FFB84D]" />}
                        {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#B7FF5A]" />}
                        {!isCrit && !isWarn && !isSuccess && <Info className="w-4 h-4 text-[#50E3FF]" />}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span
                            className="font-bold uppercase tracking-wider"
                            style={{
                              color: isCrit
                                ? '#FF5263'
                                : isWarn
                                ? '#FFB84D'
                                : isSuccess
                                ? '#B7FF5A'
                                : '#50E3FF',
                            }}
                          >
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{notif.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs font-mono">
                No active notifications. System nominal.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#080D1A]/50 text-center text-xs font-mono text-slate-400">
            Real-time notifications derived from SRM timetable calculations.
          </div>

        </div>
      </div>
    </div>
  );
};
