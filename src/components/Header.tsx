import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Bell, 
  KeyRound, 
  Radio, 
  Search,
  Wifi,
  Sparkles
} from 'lucide-react';
import { UserRole, SystemAlert } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  mfaEnabled: boolean;
  onOpenMfa: () => void;
  onToggleMobileCompanion: () => void;
  isMobileCompanionOpen: boolean;
  alerts: SystemAlert[];
  onOpenAlerts: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isOnline: boolean;
  offlineQueueCount: number;
  currentUser?: { email?: string | null; displayName?: string | null } | null;
  onOpenWorkspace?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  mfaEnabled,
  onOpenMfa,
  onToggleMobileCompanion,
  isMobileCompanionOpen,
  alerts,
  onOpenAlerts,
  searchQuery,
  onSearchChange,
  isOnline,
  offlineQueueCount,
  currentUser,
  onOpenWorkspace
}) => {
  const unreadAlerts = alerts.filter(a => !a.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-md border-b border-[#1e2638] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Emblem */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#c5a059] to-[#8c6d32] p-[1px] shadow-lg shadow-[#c5a059]/10">
              <div className="w-full h-full bg-[#0a0d14] rounded-xl flex items-center justify-center">
                <span className="font-serif-luxury text-lg font-bold text-[#e5c98a] tracking-widest">
                  A
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury text-base font-bold tracking-wider text-slate-100">
                  AURA
                </span>
                <span className="text-[10px] font-semibold tracking-widest uppercase bg-[#c5a059]/15 text-[#e5c98a] px-2 py-0.5 rounded border border-[#c5a059]/30">
                  ESTATE & INFRASTRUCTURE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-light flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Social Prospecting &amp; Facility Command
              </p>
            </div>
          </div>

          {/* Quick status pill for mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg bg-[#0e1422] border border-[#1e2638] text-slate-300"
              aria-label="Alerts"
            >
              <Bell className="w-4 h-4 text-[#e5c98a]" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-black flex items-center justify-center">
                  {unreadAlerts}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-72 lg:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search leads, facilities, access points, logs..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#0b101a] border border-[#1e2638] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#c5a059] transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')} 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Enterprise Governance & Quick Controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end w-full md:w-auto">
          
          {/* E2EE Status */}
          <div 
            title="End-to-End Encryption active with AES-256-GCM"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0e1422] border border-[#1e2638] text-[11px] text-emerald-400"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-tech">AES-256 E2EE</span>
          </div>

          {/* Offline Sync State Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0e1422] border border-[#1e2638] text-[11px]">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Online</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 animate-pulse">
                <Radio className="w-3.5 h-3.5" />
                <span>Offline Mode ({offlineQueueCount} queued)</span>
              </span>
            )}
          </div>

          {/* Google Workspace Cloud Status */}
          <button
            onClick={onOpenWorkspace}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] transition-all cursor-pointer ${
              currentUser 
                ? 'bg-blue-950/30 border-blue-800/50 text-cyan-300 hover:border-cyan-600'
                : 'bg-[#0e1422] border-[#1e2638] text-slate-300 hover:border-[#c5a059] hover:text-[#e5c98a]'
            }`}
            title="Google Workspace & Cloud Integration (Drive, Gmail, Sheets, Docs, Calendar)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span className="hidden sm:inline">
              {currentUser ? (currentUser.displayName || currentUser.email?.split('@')[0]) : 'Google Workspace'}
            </span>
          </button>

          {/* MFA Badge & Trigger */}
          <button
            onClick={onOpenMfa}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] transition-all ${
              mfaEnabled 
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300 hover:border-emerald-600'
                : 'bg-amber-950/30 border-amber-800/40 text-amber-300 hover:border-amber-600'
            }`}
            title="Multi-Factor Authentication Status"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{mfaEnabled ? 'MFA Verified' : 'Enable MFA'}</span>
          </button>

          {/* Role Based Access Control (RBAC) Switcher */}
          <div className="flex items-center gap-1.5 bg-[#0e1422] border border-[#1e2638] rounded-md px-2 py-1">
            <Lock className="w-3 h-3 text-[#c5a059]" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-xs text-[#e5c98a] font-medium focus:outline-none cursor-pointer"
            >
              <option value="Super Admin" className="bg-[#0b101a] text-slate-200">Super Admin (All Access)</option>
              <option value="Portfolio Director" className="bg-[#0b101a] text-slate-200">Portfolio Director</option>
              <option value="Facility Operations Manager" className="bg-[#0b101a] text-slate-200">Facility Operations Manager</option>
              <option value="Lead Broker" className="bg-[#0b101a] text-slate-200">Lead Broker</option>
              <option value="Field Agent" className="bg-[#0b101a] text-slate-200">Field Agent (Offline Sync)</option>
              <option value="Compliance Auditor" className="bg-[#0b101a] text-slate-200">Compliance Auditor</option>
            </select>
          </div>

          {/* Mobile Companion Toggle */}
          <button
            onClick={onToggleMobileCompanion}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-all ${
              isMobileCompanionOpen 
                ? 'bg-[#c5a059] text-black font-semibold border-[#e5c98a]'
                : 'bg-[#0e1422] border-[#1e2638] text-slate-300 hover:border-[#c5a059] hover:text-[#e5c98a]'
            }`}
            title="Toggle Mobile Companion for field inspections & offline updates"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Field Mobile View</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenAlerts}
            className="relative p-1.5 rounded-md bg-[#0e1422] border border-[#1e2638] text-slate-300 hover:border-[#c5a059] hover:text-[#e5c98a] transition-all"
            title="System Alerts & Threat Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-black flex items-center justify-center">
                {unreadAlerts}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
