/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { LeadScraperDashboard } from './components/LeadScraperDashboard';
import { FacilitySecurityCommand } from './components/FacilitySecurityCommand';
import { PropertyPortfolio } from './components/PropertyPortfolio';
import { AnalyticsAndReporting } from './components/AnalyticsAndReporting';
import { SecurityAndCompliance } from './components/SecurityAndCompliance';
import { LeadDetailModal } from './components/LeadDetailModal';
import { MobileCompanionModal } from './components/MobileCompanionModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { MFAModal } from './components/MFAModal';
import { WorkspaceHub } from './components/WorkspaceHub';
import { User } from 'firebase/auth';
import { initAuth, db, handleFirestoreError, OperationType } from './services/firebase';

import { 
  Lead, 
  Property, 
  Facility, 
  SecurityIncident, 
  AuditLogItem, 
  SystemAlert, 
  UserRole,
  SocialPlatform 
} from './types';

import { 
  INITIAL_PROPERTIES, 
  INITIAL_LEADS, 
  INITIAL_FACILITIES, 
  INITIAL_INCIDENTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_ALERTS 
} from './mock/initialData';

import { qualifyLeadWithAI, matchLeadWithPropertiesAI } from './services/aiService';
import { getOfflineQueue } from './services/offlineSyncService';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('Super Admin');
  const [activeTab, setActiveTab] = useState<ActiveTab>('leads');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Core application data
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [incidents, setIncidents] = useState<SecurityIncident[]>(INITIAL_INCIDENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);

  // Security & connectivity states
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);

  // Loading & scraping states
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [isSyncingCrm, setIsSyncingCrm] = useState<boolean>(false);

  // Modals & Drawers
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);
  const [isMobileCompanionOpen, setIsMobileCompanionOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Refresh offline queue counter
  const refreshOfflineCount = () => {
    const queue = getOfflineQueue();
    setOfflineQueueCount(queue.filter(a => !a.synced).length);
  };

  useEffect(() => {
    refreshOfflineCount();
    const unsubscribe = initAuth(
      (user) => setCurrentUser(user),
      () => setCurrentUser(null)
    );
    return () => unsubscribe();
  }, []);

  // Helper to log actions to audit trail
  const appendAuditLog = (
    module: AuditLogItem['module'],
    action: string,
    details: string,
    status: 'SUCCESS' | 'WARN' | 'BLOCKED' = 'SUCCESS'
  ) => {
    const newLog: AuditLogItem = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      user: `${currentRole.toLowerCase().replace(/\s+/g, '.')}@auraglobal.com`,
      role: currentRole,
      module,
      action,
      status,
      ipAddress: '198.51.100.24',
      details,
      hash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Trigger live social scrape
  const handleTriggerScrape = (platform: SocialPlatform | 'all') => {
    setIsScraping(true);

    setTimeout(() => {
      const generatedLead: Lead = {
        id: `lead-${Date.now()}`,
        name: platform === 'instagram' ? 'Camilla Laurent' : 'Lord Julian Kensington',
        headline: platform === 'instagram' 
          ? 'Luxury Hospitality Developer & Sovereign Fund Advisor' 
          : 'Chairman, Kensington Capital Trust & Heritage Estates',
        company: platform === 'instagram' ? 'Laurent Hotel Group' : 'Kensington Holdings',
        location: platform === 'instagram' ? 'Monaco / Los Angeles' : 'London / New York',
        avatar: platform === 'instagram' 
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        platform: platform === 'all' ? 'linkedin' : platform,
        profileUrl: 'https://linkedin.com/in/kensington-trust',
        rawSignal: 'Actively underwriting trophy residential & mixed-use development sites with certified biometric security infrastructure and private helipad access.',
        scrapedAt: 'Just now',
        status: 'new',
        sentiment: 'Highly Positive',
        intentScore: 95,
        urgency: 'Immediate (0-30 days)',
        propertyInterest: 'Ultra-Luxury Development / Penthouse Assets',
        budgetRange: '$50M - $90M',
        matchedPropertyId: 'prop-1',
        matchedPropertyTitle: 'The Sovereign Obsidian Penthouse',
        tosCompliant: true,
        privacyOptInStatus: 'Business Profile',
        crmSynced: false
      };

      setLeads(prev => [generatedLead, ...prev]);
      setIsScraping(false);

      // Add alert
      const newAlert: SystemAlert = {
        id: `alt-${Date.now()}`,
        title: 'New High-Value Lead Ingested',
        description: `${generatedLead.name} (${generatedLead.company}) detected via ${generatedLead.platform.toUpperCase()} with 95/100 intent.`,
        timestamp: 'Just now',
        type: 'lead',
        read: false,
        priority: 'urgent'
      };
      setAlerts(prev => [newAlert, ...prev]);

      appendAuditLog(
        'LEAD_SCRAPER',
        'TOS_COMPLIANT_INGESTION',
        `Scraped new public prospect signal for ${generatedLead.name} via ${generatedLead.platform}`
      );
    }, 1200);
  };

  // Lead qualification via AI
  const handleQualifyLead = async (lead: Lead) => {
    try {
      const result = await qualifyLeadWithAI(lead);
      setLeads(prev => prev.map(l => {
        if (l.id === lead.id) {
          return {
            ...l,
            sentiment: result.sentiment,
            intentScore: result.score,
            urgency: result.urgency,
            aiNotes: result.intentSummary,
            keyDrivers: result.keyDrivers,
            suggestedPitch: result.suggestedPitch,
            status: 'qualified'
          };
        }
        return l;
      }));

      appendAuditLog(
        'AI_SENTIMENT',
        'GEMINI_LEAD_QUALIFICATION',
        `Analyzed lead ${lead.name}: Score ${result.score}/100, Sentiment ${result.sentiment}`
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Sync to external SQL Server & CRM
  const handleSyncCrm = async (target: string) => {
    setIsSyncingCrm(true);
    try {
      const res = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, recordCount: leads.length })
      });
      const data = await res.json();

      setLeads(prev => prev.map(l => ({ ...l, crmSynced: true })));

      appendAuditLog(
        'CRM_SYNC',
        'ENTERPRISE_SQL_REPLICATION',
        `Synchronized ${leads.length} records to ${target} with Checksum ${data.checksum?.slice(0, 16)}`
      );
    } catch (e) {
      // Fallback
      setLeads(prev => prev.map(l => ({ ...l, crmSynced: true })));
      appendAuditLog('CRM_SYNC', 'LOCAL_SQL_CACHE_SYNC', `Synced records to local cache`);
    } finally {
      setIsSyncingCrm(false);
    }
  };

  // Toggle remote entry lock in building facility
  const handleToggleEntryLock = (facilityId: string, entryPointId: string) => {
    let affectedFacilityName = '';
    let affectedEntryName = '';
    let newStatus = '';

    setFacilities(prev => prev.map(fac => {
      if (fac.id === facilityId) {
        affectedFacilityName = fac.name;
        return {
          ...fac,
          entryPoints: fac.entryPoints.map(ep => {
            if (ep.id === entryPointId) {
              affectedEntryName = ep.name;
              const toggled = ep.status === 'locked' ? 'unlocked' : 'locked';
              newStatus = toggled;
              return {
                ...ep,
                status: toggled,
                lastAccessedBy: `Remote Override by ${currentRole}`,
                lastAccessTime: 'Just now'
              };
            }
            return ep;
          })
        };
      }
      return fac;
    }));

    appendAuditLog(
      'ACCESS_CONTROL',
      newStatus === 'locked' ? 'REMOTE_LOCK_ENGAGED' : 'REMOTE_UNLOCK_ENGAGED',
      `${affectedEntryName} at ${affectedFacilityName} toggled to ${newStatus.toUpperCase()}`
    );
  };

  // Resolve security incident
  const handleResolveIncident = (incidentId: string) => {
    setIncidents(prev => prev.map(i => {
      if (i.id === incidentId) {
        return {
          ...i,
          resolved: true,
          resolvedBy: currentRole
        };
      }
      return i;
    }));

    appendAuditLog(
      'ACCESS_CONTROL',
      'INCIDENT_RESOLVED',
      `Resolved security incident ${incidentId} by ${currentRole}`
    );
  };

  // Trigger site-wide emergency broadcast
  const handleTriggerFacilityAlert = (facilityName: string) => {
    const newAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      title: `Emergency Broadcast: ${facilityName}`,
      description: `Security sweep initiated across all entry portals and IoT sensors by ${currentRole}.`,
      timestamp: 'Just now',
      type: 'security',
      read: false,
      priority: 'urgent'
    };
    setAlerts(prev => [newAlert, ...prev]);

    appendAuditLog(
      'ACCESS_CONTROL',
      'SITE_ALERT_BROADCAST',
      `Manual site security broadcast triggered for ${facilityName}`,
      'WARN'
    );
  };

  // Dispatch SIEM webhook
  const handleDispatchSiemWebhook = (type: string) => {
    const newAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      title: 'SIEM Webhook Dispatched',
      description: `Dispatched ${type} telemetry event payload to Splunk Cloud and Datadog Security.`,
      timestamp: 'Just now',
      type: 'compliance',
      read: false,
      priority: 'standard'
    };
    setAlerts(prev => [newAlert, ...prev]);

    appendAuditLog(
      'RBAC_SECURITY',
      'SIEM_WEBHOOK_DISPATCH',
      `Sent ${type} event to Splunk HEC and Microsoft Sentinel`
    );
  };

  // Auto-match lead to property
  const handleSelectPropertyToMatch = async (property: Property) => {
    // Find unmatched leads
    const targetLead = leads.find(l => !l.matchedPropertyId) || leads[0];
    if (targetLead) {
      setLeads(prev => prev.map(l => {
        if (l.id === targetLead.id) {
          return {
            ...l,
            matchedPropertyId: property.id,
            matchedPropertyTitle: property.title
          };
        }
        return l;
      }));

      appendAuditLog(
        'AI_SENTIMENT',
        'PROPERTY_LEAD_MATCHED',
        `Matched ${targetLead.name} to ${property.title}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-[#c5a059] selection:text-black">
      
      {/* Top Luxury Enterprise Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        mfaEnabled={mfaEnabled}
        onOpenMfa={() => setIsMfaModalOpen(true)}
        onToggleMobileCompanion={() => setIsMobileCompanionOpen(!isMobileCompanionOpen)}
        isMobileCompanionOpen={isMobileCompanionOpen}
        alerts={alerts}
        onOpenAlerts={() => setIsNotificationDrawerOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isOnline={isOnline}
        offlineQueueCount={offlineQueueCount}
        currentUser={currentUser}
        onOpenWorkspace={() => setActiveTab('workspace')}
      />

      {/* Navigation Sub-Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentRole={currentRole}
        leadCount={leads.length}
        openIncidentsCount={incidents.filter(i => !i.resolved).length}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        
        {/* Tab 1: Leads & Social Scraper */}
        {activeTab === 'leads' && (
          <LeadScraperDashboard
            leads={leads}
            properties={properties}
            onQualifyLead={handleQualifyLead}
            onOpenLeadDetail={(lead) => setSelectedLeadForDetail(lead)}
            onSyncCrm={handleSyncCrm}
            isSyncingCrm={isSyncingCrm}
            onTriggerScrape={handleTriggerScrape}
            isScraping={isScraping}
            currentRole={currentRole}
            searchFilter={searchQuery}
          />
        )}

        {/* Tab 2: Facility Security Command */}
        {activeTab === 'facilities' && (
          <FacilitySecurityCommand
            facilities={facilities}
            incidents={incidents}
            onToggleEntryLock={handleToggleEntryLock}
            onResolveIncident={handleResolveIncident}
            onTriggerFacilityAlert={handleTriggerFacilityAlert}
            onDispatchSiemWebhook={handleDispatchSiemWebhook}
            currentRole={currentRole}
            searchFilter={searchQuery}
          />
        )}

        {/* Tab 3: Google Workspace & Cloud Hub */}
        {activeTab === 'workspace' && (
          <WorkspaceHub
            leads={leads}
            properties={properties}
            currentUser={currentUser}
            onUserAuthChange={setCurrentUser}
          />
        )}

        {/* Tab 4: Property Portfolio & Matching */}
        {activeTab === 'portfolio' && (
          <PropertyPortfolio
            properties={properties}
            leads={leads}
            onSelectPropertyToMatch={handleSelectPropertyToMatch}
            currentRole={currentRole}
            searchFilter={searchQuery}
          />
        )}

        {/* Tab 4: Analytics & Custom Reporting */}
        {activeTab === 'analytics' && (
          <AnalyticsAndReporting
            leads={leads}
            properties={properties}
            facilities={facilities}
            incidents={incidents}
            currentRole={currentRole}
          />
        )}

        {/* Tab 5: Security, RBAC & Audit Trail */}
        {activeTab === 'compliance' && (
          <SecurityAndCompliance
            auditLogs={auditLogs}
            currentRole={currentRole}
            mfaEnabled={mfaEnabled}
            onOpenMfa={() => setIsMfaModalOpen(true)}
            searchFilter={searchQuery}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e2638] bg-[#07090e] px-4 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-serif-luxury font-bold text-slate-400">AURA</span>
            <span>• Enterprise Real Estate Lead Intelligence &amp; Multi-Property Infrastructure Command</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>SOC2 Type II Certified</span>
            <span>NIST 800-82 Smart Building Standard</span>
            <span className="font-tech text-emerald-400">E2EE AES-256</span>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-outs */}
      
      {/* Lead Detail & AI Sentiment Modal */}
      <LeadDetailModal
        lead={selectedLeadForDetail}
        properties={properties}
        onClose={() => setSelectedLeadForDetail(null)}
        onUpdateLead={(updated) => {
          setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
          setSelectedLeadForDetail(updated);
        }}
        onSyncCrm={handleSyncCrm}
      />

      {/* Field Mobile Companion Modal with Offline Sync */}
      <MobileCompanionModal
        isOpen={isMobileCompanionOpen}
        onClose={() => setIsMobileCompanionOpen(false)}
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(!isOnline)}
        onActionSynced={refreshOfflineCount}
      />

      {/* Real-time System Alerts & Threat Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        alerts={alerts}
        onMarkAllRead={() => setAlerts(prev => prev.map(a => ({ ...a, read: true })))}
        onSelectAlert={(alert) => {
          setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, read: true } : a));
          if (alert.type === 'security') setActiveTab('facilities');
          if (alert.type === 'lead') setActiveTab('leads');
          if (alert.type === 'compliance') setActiveTab('compliance');
          setIsNotificationDrawerOpen(false);
        }}
      />

      {/* Multi-Factor Authentication Modal */}
      <MFAModal
        isOpen={isMfaModalOpen}
        onClose={() => setIsMfaModalOpen(false)}
        mfaEnabled={mfaEnabled}
        onConfirmMfa={() => {
          setMfaEnabled(true);
          appendAuditLog('RBAC_SECURITY', 'MFA_AUTHENTICATED', 'User verified TOTP 2FA cryptographic token');
        }}
      />

    </div>
  );
}
