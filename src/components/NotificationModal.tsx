import React from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Volume2,
  AlertTriangle,
  Clock,
  Layers,
  Users
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    testNotificationChime
  } = useStudy();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Notifications & Alerts</h3>
              <p className="text-[11px] text-slate-400">
                Automated countdown thresholds and revision reminders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between py-2.5 px-1 border-b border-slate-800/60 text-xs">
          <button
            onClick={testNotificationChime}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Test Web Audio Alert</span>
          </button>

          <button
            onClick={markAllNotificationsRead}
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Mark all read
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 mt-3 overflow-y-auto flex-1 pr-1">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all ${
                item.urgency === 'high'
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : item.read
                  ? 'bg-slate-950/60 border-slate-800/60 opacity-70'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {item.urgency === 'high' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ) : item.type === 'revision_due' ? (
                      <Layers className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Users className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
                      {item.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!item.read && (
                    <button
                      onClick={() => markNotificationRead(item.id)}
                      className="p-1 text-slate-400 hover:text-indigo-400"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => dismissNotification(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                    title="Dismiss"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-xs">
              No notifications at this time
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
