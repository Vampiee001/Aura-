import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  PieChart, 
  ShieldCheck, 
  Users, 
  Building2,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Lead, Property, Facility, SecurityIncident, UserRole } from '../types';
import { exportLeadsToCSV, exportSecurityIncidentReport } from '../services/exportService';

interface AnalyticsAndReportingProps {
  leads: Lead[];
  properties: Property[];
  facilities: Facility[];
  incidents: SecurityIncident[];
  currentRole: UserRole;
}

export const AnalyticsAndReporting: React.FC<AnalyticsAndReportingProps> = ({
  leads,
  properties,
  facilities,
  incidents,
  currentRole
}) => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'ytd'>('30d');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('executive-dossier');
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);

  // Aggregated calculations
  const platformCounts = {
    linkedin: leads.filter(l => l.platform === 'linkedin').length,
    instagram: leads.filter(l => l.platform === 'instagram').length,
    facebook: leads.filter(l => l.platform === 'facebook').length,
    web: leads.filter(l => l.platform === 'web').length,
  };

  const highIntentCount = leads.filter(l => l.intentScore >= 90).length;
  const crmSyncedCount = leads.filter(l => l.crmSynced).length;
  const lockedEntriesCount = facilities.reduce((acc, f) => acc + f.entryPoints.filter(e => e.status === 'locked').length, 0);
  const totalEntriesCount = facilities.reduce((acc, f) => acc + f.entryPoints.length, 0);

  const handlePrintDossier = () => {
    window.print();
  };

  const handleGenerateTemplate = () => {
    setReportGenerated(true);
    setTimeout(() => setReportGenerated(false), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Analytics Command Header */}
      <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c98a]">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="font-serif-luxury text-lg font-bold text-slate-100">
              Enterprise Performance Analytics &amp; Custom Reports
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cross-platform social lead conversion metrics, property matching ratios, and facility compliance auditing.
          </p>
        </div>

        {/* Date Filter & Print */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-[#080b12] border border-[#1e2638] rounded-lg p-1 text-xs">
            <button
              onClick={() => setDateRange('7d')}
              className={`px-2.5 py-1 rounded ${dateRange === '7d' ? 'bg-[#c5a059] text-black font-semibold' : 'text-slate-400'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-2.5 py-1 rounded ${dateRange === '30d' ? 'bg-[#c5a059] text-black font-semibold' : 'text-slate-400'}`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange('ytd')}
              className={`px-2.5 py-1 rounded ${dateRange === 'ytd' ? 'bg-[#c5a059] text-black font-semibold' : 'text-slate-400'}`}
            >
              YTD 2026
            </button>
          </div>

          <button
            onClick={handlePrintDossier}
            className="px-3 py-1.5 rounded-lg bg-[#162033] hover:bg-[#1e2c46] border border-[#2a3a5a] text-slate-200 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Print or Save PDF Executive Report"
          >
            <Printer className="w-3.5 h-3.5 text-[#c5a059]" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">High-Intent HNW Leads</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif-luxury font-bold text-[#e5c98a]">{highIntentCount}</span>
            <span className="text-xs text-emerald-400 font-medium">({Math.round((highIntentCount / leads.length) * 100)}% of total)</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Intent Score &gt;= 90/100</span>
        </div>

        <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">CRM &amp; SQL Server Synced</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif-luxury font-bold text-slate-100">{crmSyncedCount}/{leads.length}</span>
            <span className="text-xs text-cyan-400 font-medium">Verified</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active pipeline records</span>
        </div>

        <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Secured Facility Portals</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif-luxury font-bold text-emerald-400">{lockedEntriesCount}/{totalEntriesCount}</span>
            <span className="text-xs text-slate-400 font-medium">Locked</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Biometric &amp; RFID active</span>
        </div>

        <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Resolved Incident Ratio</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif-luxury font-bold text-slate-100">
              {incidents.filter(i => i.resolved).length}/{incidents.length}
            </span>
            <span className="text-xs text-emerald-400 font-medium">100% SLA Met</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Average triage: 14 mins</span>
        </div>

      </div>

      {/* Visual Charts: Social Lead Sourcing & Sentiment Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Acquisition by Social Platform */}
        <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-luxury text-sm font-bold text-slate-100">
              Lead Generation by Social Media Source
            </h3>
            <span className="text-xs text-[#c5a059] font-medium">TOS Compliant Scrape</span>
          </div>

          <div className="space-y-3 pt-2">
            {/* LinkedIn */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0077b5]"></span>
                  LinkedIn Professional Network
                </span>
                <span className="text-slate-400 font-tech">{platformCounts.linkedin} leads (40%)</span>
              </div>
              <div className="w-full bg-[#162033] rounded-full h-2">
                <div className="bg-[#0077b5] h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>

            {/* Instagram */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e1306c]"></span>
                  Instagram Luxury Real Estate Signals
                </span>
                <span className="text-slate-400 font-tech">{platformCounts.instagram} leads (25%)</span>
              </div>
              <div className="w-full bg-[#162033] rounded-full h-2">
                <div className="bg-[#e1306c] h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>

            {/* Facebook */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1877f2]"></span>
                  Facebook Investor Syndicates &amp; Groups
                </span>
                <span className="text-slate-400 font-tech">{platformCounts.facebook} leads (20%)</span>
              </div>
              <div className="w-full bg-[#162033] rounded-full h-2">
                <div className="bg-[#1877f2] h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>

            {/* Web */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059]"></span>
                  Web RFPs &amp; Public Filings
                </span>
                <span className="text-slate-400 font-tech">{platformCounts.web} leads (15%)</span>
              </div>
              <div className="w-full bg-[#162033] rounded-full h-2">
                <div className="bg-[#c5a059] h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-2 border-t border-[#1e2638]">
            Lead scoring is grounded in multi-platform social intent monitoring, identifying capital deployment windows before public listings.
          </p>
        </div>

        {/* Chart 2: Sentiment & Follow-Up Conversion Funnel */}
        <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-luxury text-sm font-bold text-slate-100">
              AI Sentiment &amp; Automated Follow-Up Funnel
            </h3>
            <span className="text-xs text-emerald-400 font-medium">84% Positive</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            <div className="p-3 rounded-lg bg-[#080b12] border border-[#1e2638]">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Highly Positive</span>
              <span className="text-xl font-serif-luxury font-bold text-emerald-400 mt-1 block">60%</span>
              <span className="text-[10px] text-slate-400">Ready to transacting</span>
            </div>

            <div className="p-3 rounded-lg bg-[#080b12] border border-[#1e2638]">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Positive</span>
              <span className="text-xl font-serif-luxury font-bold text-[#e5c98a] mt-1 block">28%</span>
              <span className="text-[10px] text-slate-400">In-market vetting</span>
            </div>

            <div className="p-3 rounded-lg bg-[#080b12] border border-[#1e2638]">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Neutral / Nurture</span>
              <span className="text-xl font-serif-luxury font-bold text-slate-400 mt-1 block">12%</span>
              <span className="text-[10px] text-slate-400">Long-cycle follow-up</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#121927] border border-[#22304d] space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300 font-medium">
              <span>Cadence Step 1 (VIP Memorandum):</span>
              <span className="text-emerald-400 font-bold">96% Delivery Rate</span>
            </div>
            <div className="flex justify-between text-slate-300 font-medium">
              <span>Cadence Step 2 (Virtual Asset Walkthrough):</span>
              <span className="text-[#e5c98a] font-bold">78% Open Rate</span>
            </div>
            <div className="flex justify-between text-slate-300 font-medium">
              <span>Cadence Step 3 (Facility Director Consultation):</span>
              <span className="text-cyan-400 font-bold">42% Conversion to LOI</span>
            </div>
          </div>
        </div>

      </div>

      {/* Custom Reporting Templates Generator */}
      <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-[#1e2638]">
          <div>
            <h3 className="font-serif-luxury text-base font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#c5a059]" />
              Custom Automated Reporting Templates
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select or customize audit templates for board meetings, facility compliance, or lead distribution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateTemplate}
              className="px-3.5 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Report Dossier
            </button>
            <button
              onClick={() => exportLeadsToCSV(leads)}
              className="px-3.5 py-1.5 rounded-lg bg-[#162033] hover:bg-[#1e2c46] border border-[#2a3a5a] text-slate-200 text-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#c5a059]" />
              Spreadsheet CSV
            </button>
          </div>
        </div>

        {reportGenerated && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Report generated successfully! Ready for download and executive distribution.
            </span>
            <span className="font-tech text-[10px] text-emerald-400">PDF RENDER COMPLETE</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          <button
            onClick={() => setSelectedTemplate('executive-dossier')}
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedTemplate === 'executive-dossier'
                ? 'bg-[#121929] border-[#c5a059] shadow-md'
                : 'bg-[#080b12] border-[#1e2638] hover:border-slate-600'
            }`}
          >
            <h4 className="font-serif-luxury text-xs font-bold text-slate-100">Executive Real Estate Acquisition Dossier</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Complete investor summary, asset valuations, AI sentiment scores, and match ratings.
            </p>
            <span className="text-[10px] text-[#c5a059] font-medium mt-2 block">Monthly Automated Delivery</span>
          </button>

          <button
            onClick={() => setSelectedTemplate('facility-audit')}
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedTemplate === 'facility-audit'
                ? 'bg-[#121929] border-[#c5a059] shadow-md'
                : 'bg-[#080b12] border-[#1e2638] hover:border-slate-600'
            }`}
          >
            <h4 className="font-serif-luxury text-xs font-bold text-slate-100">Building Security &amp; Access Compliance</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Biometric turnstile logs, override events, maintenance records, and SLA certifications.
            </p>
            <span className="text-[10px] text-[#c5a059] font-medium mt-2 block">Weekly Facility Director Digest</span>
          </button>

          <button
            onClick={() => setSelectedTemplate('tos-compliance')}
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedTemplate === 'tos-compliance'
                ? 'bg-[#121929] border-[#c5a059] shadow-md'
                : 'bg-[#080b12] border-[#1e2638] hover:border-slate-600'
            }`}
          >
            <h4 className="font-serif-luxury text-xs font-bold text-slate-100">Platform TOS &amp; Data Privacy Minimization</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              LinkedIn &amp; Meta API rate limit health, opt-out requests, PII tokenization verification.
            </p>
            <span className="text-[10px] text-[#c5a059] font-medium mt-2 block">Quarterly Legal Audit</span>
          </button>

          <button
            onClick={() => setSelectedTemplate('disaster-recovery')}
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedTemplate === 'disaster-recovery'
                ? 'bg-[#121929] border-[#c5a059] shadow-md'
                : 'bg-[#080b12] border-[#1e2638] hover:border-slate-600'
            }`}
          >
            <h4 className="font-serif-luxury text-xs font-bold text-slate-100">Disaster Recovery &amp; SQL Server Snapshot</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Replication checksums, cloud failover tests, and encrypted database snapshot verification.
            </p>
            <span className="text-[10px] text-[#c5a059] font-medium mt-2 block">Daily Infrastructure Run</span>
          </button>

        </div>
      </div>

    </div>
  );
};
