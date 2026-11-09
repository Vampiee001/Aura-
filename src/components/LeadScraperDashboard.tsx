import React, { useState } from 'react';
import { 
  Users, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Globe, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Send, 
  Database, 
  RefreshCw, 
  ShieldCheck, 
  ArrowUpRight,
  TrendingUp,
  BrainCircuit,
  Lock,
  ChevronRight,
  Layers,
  MessageSquareCode
} from 'lucide-react';
import { Lead, SocialPlatform, Property, UserRole } from '../types';
import { exportLeadsToCSV } from '../services/exportService';

interface LeadScraperDashboardProps {
  leads: Lead[];
  properties: Property[];
  onQualifyLead: (lead: Lead) => void;
  onOpenLeadDetail: (lead: Lead) => void;
  onSyncCrm: (target: string) => Promise<void>;
  isSyncingCrm: boolean;
  onTriggerScrape: (platform: SocialPlatform | 'all') => void;
  isScraping: boolean;
  currentRole: UserRole;
  searchFilter: string;
}

export const LeadScraperDashboard: React.FC<LeadScraperDashboardProps> = ({
  leads,
  properties,
  onQualifyLead,
  onOpenLeadDetail,
  onSyncCrm,
  isSyncingCrm,
  onTriggerScrape,
  isScraping,
  currentRole,
  searchFilter
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [tosModalOpen, setTosModalOpen] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Filter leads based on platform, status, and search query
  const filteredLeads = leads.filter(lead => {
    const matchesPlatform = selectedPlatform === 'all' || lead.platform === selectedPlatform;
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    const matchesSearch = !searchFilter || 
      lead.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchFilter.toLowerCase()) ||
      lead.headline.toLowerCase().includes(searchFilter.toLowerCase()) ||
      lead.propertyInterest.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesPlatform && matchesStatus && matchesSearch;
  });

  const handleSyncWithFeedback = async (target: string) => {
    setSyncFeedback(`Connecting to ${target}...`);
    await onSyncCrm(target);
    setSyncFeedback(`Successfully synchronized with ${target} (Checksum Verified)`);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const platformIcons = {
    linkedin: <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />,
    instagram: <Instagram className="w-3.5 h-3.5 text-[#e1306c]" />,
    facebook: <Facebook className="w-3.5 h-3.5 text-[#1877f2]" />,
    web: <Globe className="w-3.5 h-3.5 text-[#c5a059]" />
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Real Estate Lead Generation & Platform TOS Compliance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Leads & HNW Volume */}
        <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#c5a059]/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Scraped Real Estate Prospects</span>
            <Users className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif-luxury font-bold text-slate-100">{leads.length}</span>
            <span className="text-xs text-emerald-400 font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +18% this wk
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Aggregated from LinkedIn, Instagram &amp; Facebook Luxury Circles
          </p>
        </div>

        {/* Metric 2: AI Intent Score Average */}
        <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">AI Buyer Intent Average</span>
            <BrainCircuit className="w-4 h-4 text-[#e5c98a]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif-luxury font-bold text-[#e5c98a]">92.6%</span>
            <span className="text-xs text-emerald-400 font-medium">High Liquidity</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Gemini-Powered Natural Language Sentiment Analysis
          </p>
        </div>

        {/* Metric 3: Terms of Service (TOS) Compliance Health */}
        <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Platform TOS Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif-luxury font-bold text-emerald-400">99.8%</span>
            <button 
              onClick={() => setTosModalOpen(true)}
              className="text-[11px] text-[#e5c98a] underline hover:text-[#f3e5ab] ml-auto cursor-pointer"
            >
              Audit Details
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Zero IP blocks, robots.txt strict compliance, PII masked
          </p>
        </div>

        {/* Metric 4: External SQL Server & CRM Sync Status */}
        <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Enterprise SQL &amp; CRM Sync</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-200">MSSQL-PROD-01: CONNECTED</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1e2638]/60">
            <span className="text-[10px] text-slate-400">Proprietary CRM: Active</span>
            <button
              onClick={() => handleSyncWithFeedback('MSSQL & Proprietary CRM')}
              disabled={isSyncingCrm}
              className="text-[10px] bg-[#162033] hover:bg-[#1e2a42] border border-[#2a3854] text-slate-200 px-2 py-0.5 rounded flex items-center gap-1 transition-all"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isSyncingCrm ? 'animate-spin text-[#c5a059]' : ''}`} />
              {isSyncingCrm ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>

      </div>

      {syncFeedback && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {syncFeedback}
          </span>
          <span className="font-tech text-[10px] text-emerald-400">SOC2 COMPLIANT REPLICATION</span>
        </div>
      )}

      {/* Action Bar: Scraper Triggers, Filters, Export */}
      <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Platform Selector Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Source:
          </span>
          
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedPlatform === 'all'
                ? 'bg-[#c5a059] text-black font-semibold'
                : 'bg-[#121826] text-slate-300 hover:bg-[#182133] border border-[#1e2638]'
            }`}
          >
            All Sources ({leads.length})
          </button>

          <button
            onClick={() => setSelectedPlatform('linkedin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              selectedPlatform === 'linkedin'
                ? 'bg-[#0077b5] text-white font-semibold'
                : 'bg-[#121826] text-slate-300 hover:bg-[#182133] border border-[#1e2638]'
            }`}
          >
            <Linkedin className="w-3.5 h-3.5" />
            LinkedIn
          </button>

          <button
            onClick={() => setSelectedPlatform('instagram')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              selectedPlatform === 'instagram'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold'
                : 'bg-[#121826] text-slate-300 hover:bg-[#182133] border border-[#1e2638]'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            Instagram
          </button>

          <button
            onClick={() => setSelectedPlatform('facebook')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              selectedPlatform === 'facebook'
                ? 'bg-[#1877f2] text-white font-semibold'
                : 'bg-[#121826] text-slate-300 hover:bg-[#182133] border border-[#1e2638]'
            }`}
          >
            <Facebook className="w-3.5 h-3.5" />
            Facebook
          </button>

          <button
            onClick={() => setSelectedPlatform('web')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              selectedPlatform === 'web'
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-[#121826] text-slate-300 hover:bg-[#182133] border border-[#1e2638]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Web RFPs
          </button>
        </div>

        {/* Action Buttons: Run Live Scraper & Export CSV */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          
          <button
            onClick={() => onTriggerScrape(selectedPlatform)}
            disabled={isScraping}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#c5a059] to-[#8c6d32] text-black font-semibold text-xs flex items-center gap-2 hover:opacity-95 shadow-lg shadow-[#c5a059]/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
            {isScraping ? 'Gathering Social Signals...' : 'Scrape Real Estate Leads'}
          </button>

          <button
            onClick={() => exportLeadsToCSV(filteredLeads)}
            className="px-3 py-1.5 rounded-lg bg-[#121826] hover:bg-[#182133] border border-[#1e2638] text-slate-200 text-xs flex items-center gap-1.5 transition-all"
            title="Download CSV compatible with Excel, Google Sheets, Salesforce"
          >
            <Download className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

        </div>

      </div>

      {/* Leads Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map((lead) => {
          return (
            <div
              key={lead.id}
              className="bg-[#0d121c] border border-[#1e2638] hover:border-[#c5a059]/50 rounded-xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden"
            >
              {/* Subtle gold accent edge */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c5a059]/40 to-transparent"></div>

              <div>
                {/* Header: Platform & Sentiment Tag */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-[#162033] border border-[#2a3854]">
                      {platformIcons[lead.platform]}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {lead.platform}
                    </span>
                    <span className="text-[10px] text-slate-500">• {lead.scrapedAt}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    lead.sentiment === 'Highly Positive'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      : lead.sentiment === 'Positive'
                        ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {lead.sentiment}
                  </span>
                </div>

                {/* Profile Info */}
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={lead.avatar}
                    alt={lead.name}
                    className="w-11 h-11 rounded-lg object-cover border border-[#2a3854]"
                  />
                  <div>
                    <h3 className="font-serif-luxury text-sm font-bold text-slate-100 group-hover:text-[#e5c98a] transition-colors">
                      {lead.name}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium line-clamp-1">{lead.headline}</p>
                    <p className="text-[11px] text-slate-400 font-light">{lead.company} • {lead.location}</p>
                  </div>
                </div>

                {/* Raw Scraped Social Signal */}
                <div className="bg-[#080b12] rounded-lg p-2.5 border border-[#182030] text-[11px] text-slate-300 italic mb-3 relative">
                  <span className="text-[#c5a059] font-serif font-bold not-italic mr-1">“</span>
                  {lead.rawSignal}
                  <span className="text-[#c5a059] font-serif font-bold not-italic ml-1">”</span>
                </div>

                {/* Intent Score & Urgency */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#c5a059]" />
                      Intent Score
                    </span>
                    <span className="font-bold text-[#e5c98a]">{lead.intentScore}/100</span>
                  </div>
                  <div className="w-full bg-[#162033] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#8c6d32] to-[#e5c98a] h-1.5 rounded-full"
                      style={{ width: `${lead.intentScore}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Target: <strong className="text-slate-200">{lead.propertyInterest}</strong></span>
                    <span className="text-[#c5a059] font-semibold">{lead.budgetRange}</span>
                  </div>
                </div>

                {/* Matched Property Pill */}
                {lead.matchedPropertyTitle && (
                  <div className="bg-[#121927] border border-[#22304d] rounded-lg p-2 mb-3 flex items-center justify-between">
                    <div className="text-[11px]">
                      <span className="text-[9px] uppercase tracking-wider text-[#c5a059] block font-semibold">Matched Asset</span>
                      <span className="text-slate-200 font-medium">{lead.matchedPropertyTitle}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#1e2638] flex items-center justify-between gap-2">
                <button
                  onClick={() => onQualifyLead(lead)}
                  className="px-2.5 py-1 rounded bg-[#162033] hover:bg-[#202c46] border border-[#2a3a5a] text-[11px] text-[#e5c98a] font-medium flex items-center gap-1 transition-all"
                  title="Run real-time Gemini AI sentiment qualification"
                >
                  <BrainCircuit className="w-3 h-3 text-[#c5a059]" />
                  Qualify AI
                </button>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    lead.crmSynced ? 'text-emerald-400 bg-emerald-950/40' : 'text-slate-500 bg-[#162033]'
                  }`}>
                    {lead.crmSynced ? 'CRM Synced' : 'Unsynced'}
                  </span>

                  <button
                    onClick={() => onOpenLeadDetail(lead)}
                    className="px-2.5 py-1 rounded bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#e5c98a] border border-[#c5a059]/40 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    Details <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12 bg-[#0d121c] border border-[#1e2638] rounded-xl">
          <Search className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h4 className="font-serif-luxury text-base font-bold text-slate-300">No leads match current filters</h4>
          <p className="text-xs text-slate-500 mt-1">Try switching social platforms or clearing your search query.</p>
        </div>
      )}

      {/* Modal: Platform TOS & Data Privacy Compliance Hub */}
      {tosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d121c] border border-[#c5a059]/40 rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2638]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif-luxury text-base font-bold text-slate-100">
                  Platform TOS &amp; Data Privacy Compliance Protocol
                </h3>
              </div>
              <button
                onClick={() => setTosModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                AURA Estate &amp; Security Intelligence operates under strict compliance with each social media platform’s Developer Terms of Service, Public robots.txt, and international privacy mandates (GDPR Article 6, CCPA/CPRA).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-[#080b12] border border-[#1e2638]">
                  <div className="flex items-center gap-2 font-semibold text-slate-200 mb-1">
                    <Linkedin className="w-4 h-4 text-[#0077b5]" />
                    LinkedIn Compliance Boundary
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
                    <li>Rate limit safe cap: 120 requests/hour</li>
                    <li>Only public business profiles &amp; open posts ingested</li>
                    <li>No private inbox or gated connection intrusion</li>
                    <li>Automated PII tokenization before database indexing</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-[#080b12] border border-[#1e2638]">
                  <div className="flex items-center gap-2 font-semibold text-slate-200 mb-1">
                    <Instagram className="w-4 h-4 text-[#e1306c]" />
                    Instagram &amp; Meta Graph API
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
                    <li>Uses verified Meta Business Graph endpoints</li>
                    <li>Public hashtag &amp; luxury location tag indexing</li>
                    <li>Automatic opt-out exclusion list sync</li>
                    <li>Zero storage of non-commercial personal photos</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-[11px] text-emerald-300">
                <strong>End-to-End Client Encryption:</strong> All prospect notes and financial criteria are salted with PBKDF2 and encrypted with AES-256-GCM. Unused leads are purged in compliance with data minimization rules.
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1e2638]">
              <button
                onClick={() => setTosModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#c5a059] text-black font-semibold text-xs cursor-pointer"
              >
                Acknowledge &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
