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
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0B1020]/60 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#151B32] border-l border-[#50E3FF]/20 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0B1020]/50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#50E3FF]" />
              <h3 className="font-display font-bold text-base text-white">
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
                  className="text-xs font-mono text-[#50E3FF] hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      !notif.read
                        ? isCrit
                          ? 'bg-[#FF5263]/10 border-[#FF5263]/40'
                          : isWarn
                          ? 'bg-[#FFB84D]/10 border-[#FFB84D]/40'
                          : isSuccess
                          ? 'bg-[#B7FF5A]/10 border-[#B7FF5A]/40'
                          : 'bg-[#50E3FF]/10 border-[#50E3FF]/40'
                        : 'bg-[#0B1020]/60 border-slate-800 opacity-75 hover:opacity-100'
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
                          <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
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
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                No active notifications. System nominal.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-[#0B1020]/50 text-center text-xs font-mono text-slate-400">
            Real-time algorithmic notifications derived from SRM timetable calculations.
          </div>

        </div>
      </div>
    </div>
  );
};
