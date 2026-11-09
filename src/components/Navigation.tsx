import React from 'react';
import { 
  Users, 
  Building2, 
  ShieldAlert, 
  BarChart3, 
  FileText, 
  Server,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../types';

export type ActiveTab = 'leads' | 'facilities' | 'workspace' | 'portfolio' | 'analytics' | 'compliance';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentRole: UserRole;
  leadCount: number;
  openIncidentsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  leadCount,
  openIncidentsCount
}) => {
  const tabs = [
    {
      id: 'leads' as ActiveTab,
      label: 'Social Leads & Prospecting',
      icon: Users,
      badge: leadCount,
      badgeColor: 'bg-[#c5a059] text-black',
      roles: ['Super Admin', 'Portfolio Director', 'Lead Broker', 'Compliance Auditor']
    },
    {
      id: 'facilities' as ActiveTab,
      label: 'Facility Security & Access',
      icon: ShieldAlert,
      badge: openIncidentsCount > 0 ? openIncidentsCount : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
      roles: ['Super Admin', 'Facility Operations Manager', 'Field Agent', 'Compliance Auditor']
    },
    {
      id: 'workspace' as ActiveTab,
      label: 'Google Workspace & Cloud',
      icon: FileText,
      badge: 'Drive • Gmail • Sheets',
      badgeColor: 'bg-[#0077b5]/30 text-cyan-300 border border-cyan-800',
      roles: ['Super Admin', 'Portfolio Director', 'Facility Operations Manager', 'Lead Broker', 'Field Agent', 'Compliance Auditor']
    },
    {
      id: 'portfolio' as ActiveTab,
      label: 'Luxury Properties & Matching',
      icon: Building2,
      roles: ['Super Admin', 'Portfolio Director', 'Lead Broker', 'Field Agent']
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Analytics & Custom Reporting',
      icon: BarChart3,
      roles: ['Super Admin', 'Portfolio Director', 'Facility Operations Manager', 'Lead Broker', 'Compliance Auditor']
    },
    {
      id: 'compliance' as ActiveTab,
      label: 'RBAC, Audit Logs & SIEM',
      icon: Server,
      roles: ['Super Admin', 'Facility Operations Manager', 'Compliance Auditor']
    }
  ];

  return (
    <nav className="bg-[#0a0e17] border-b border-[#1e2638] px-4 lg:px-8 py-2 sticky top-[57px] z-30">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isAllowed = tab.roles.includes(currentRole);

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              disabled={!isAllowed}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                !isAllowed 
                  ? 'opacity-40 cursor-not-allowed text-slate-600'
                  : isActive
                    ? 'bg-gradient-to-r from-[#c5a059]/20 to-[#8c6d32]/20 border border-[#c5a059]/60 text-[#e5c98a] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121927] border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#c5a059]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
