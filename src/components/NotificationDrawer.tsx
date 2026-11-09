import React from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  Users, 
  Database, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { SystemAlert } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SystemAlert[];
  onMarkAllRead: () => void;
  onSelectAlert: (alert: SystemAlert) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onMarkAllRead,
  onSelectAlert
}) => {
  if (!isOpen) return null;

  const typeIcons = {
    security: <AlertTriangle className="w-4 h-4 text-rose-400" />,
    lead: <Users className="w-4 h-4 text-[#e5c98a]" />,
    sync: <Database className="w-4 h-4 text-cyan-400" />,
    compliance: <ShieldCheck className="w-4 h-4 text-emerald-400" />
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#0d121c] border-l border-[#1e2638] h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#1e2638] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#c5a059]" />
            <h3 className="font-serif-luxury text-sm font-bold text-slate-100">
              Real-Time Security &amp; Lead Alerts
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[11px] text-slate-400 hover:text-[#e5c98a] flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.map((alt) => {
            return (
              <div
                key={alt.id}
                onClick={() => onSelectAlert(alt)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  alt.read
                    ? 'bg-[#080b12] border-[#1e2638] opacity-75'
                    : 'bg-[#121927] border-[#c5a059]/40 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-[#162033]">
                      {typeIcons[alt.type]}
                    </span>
                    <span className="font-semibold text-xs text-slate-100">
                      {alt.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-tech whitespace-nowrap">
                    {alt.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-light mt-1 pl-6 leading-relaxed">
                  {alt.description}
                </p>

                <div className="flex items-center justify-between pt-2 pl-6 mt-2 border-t border-[#1e2638]/50 text-[10px]">
                  <span className={`font-semibold uppercase tracking-wider ${
                    alt.priority === 'urgent' ? 'text-amber-400' : 'text-slate-500'
                  }`}>
                    {alt.priority} Alert
                  </span>
                  <span className="text-[#c5a059] flex items-center gap-0.5 hover:underline">
                    View telemetry <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}

          {alerts.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              No active notifications.
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-[#080b12] border-t border-[#1e2638] text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SIEM Webhook Listener Active
          </span>
          <span className="font-tech text-slate-500">TLS 1.3</span>
        </div>

      </div>
    </div>
  );
};
