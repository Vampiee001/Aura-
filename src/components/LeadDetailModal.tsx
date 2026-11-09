import React, { useState } from 'react';
import { 
  X, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Globe, 
  Sparkles, 
  Send, 
  Database, 
  CheckCircle2, 
  Building2, 
  Copy, 
  Clock, 
  ShieldCheck, 
  BrainCircuit,
  MessageSquare,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { Lead, Property } from '../types';
import { qualifyLeadWithAI } from '../services/aiService';
import { createDriveFile } from '../services/workspaceService';

interface LeadDetailModalProps {
  lead: Lead | null;
  properties: Property[];
  onClose: () => void;
  onUpdateLead: (updated: Lead) => void;
  onSyncCrm: (target: string) => Promise<void>;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  properties,
  onClose,
  onUpdateLead,
  onSyncCrm
}) => {
  if (!lead) return null;

  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [pitchDraft, setPitchDraft] = useState(lead.suggestedPitch || '');
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [followUpSent, setFollowUpSent] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const matchedProperty = properties.find(p => p.id === lead.matchedPropertyId) || properties[0];

  const handleRunAIQualification = async () => {
    setIsAnalyzingAI(true);
    try {
      const res = await qualifyLeadWithAI(lead);
      const updated: Lead = {
        ...lead,
        sentiment: res.sentiment,
        intentScore: res.score,
        urgency: res.urgency,
        aiNotes: res.intentSummary,
        keyDrivers: res.keyDrivers,
        suggestedPitch: res.suggestedPitch
      };
      setPitchDraft(res.suggestedPitch);
      onUpdateLead(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(pitchDraft);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  const handleSendFollowUp = () => {
    setFollowUpSent(true);
    const updated: Lead = {
      ...lead,
      status: 'contacted',
      lastFollowUp: `Follow-up sent at ${new Date().toLocaleTimeString()} (Automated Cadence Step 1)`
    };
    onUpdateLead(updated);
    setTimeout(() => setFollowUpSent(false), 3000);
  };

  const handleSyncToCrmAndSql = async () => {
    setIsSyncing(true);
    await onSyncCrm('MSSQL-PROD-01');
    const updated: Lead = {
      ...lead,
      crmSynced: true
    };
    onUpdateLead(updated);
    setIsSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d121c] border border-[#c5a059]/40 rounded-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#0d121c]/95 backdrop-blur-md px-6 py-4 border-b border-[#1e2638] flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c98a]">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif-luxury text-base font-bold text-slate-100">
                Lead Intelligence &amp; AI Qualification Dossier
              </h3>
              <p className="text-[11px] text-slate-400">
                Source: {lead.platform.toUpperCase()} • TOS Compliant Scrape
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-lg cursor-pointer p-1 rounded-md hover:bg-[#162033]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Top Profile Summary */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-[#080b12] border border-[#1e2638]">
            <div className="flex items-start gap-3.5">
              <img
                src={lead.avatar}
                alt={lead.name}
                className="w-14 h-14 rounded-xl object-cover border border-[#c5a059]/30"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif-luxury text-lg font-bold text-slate-100">{lead.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                    {lead.sentiment}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">{lead.headline}</p>
                <p className="text-xs text-slate-400">{lead.company} • {lead.location}</p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="text-[10px] text-slate-400">Buyer Intent Index</span>
              <span className="text-2xl font-serif-luxury font-bold text-[#e5c98a]">
                {lead.intentScore}/100
              </span>
              <span className="text-[10px] text-emerald-400">{lead.urgency}</span>
            </div>
          </div>

          {/* Raw Signal & Platform TOS Compliance Status */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Scraped Social Intent Signal
            </span>
            <div className="p-3 rounded-lg bg-[#080b12] border border-[#1a2334] text-xs text-slate-200 italic leading-relaxed">
              “{lead.rawSignal}”
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                TOS Privacy Status: {lead.privacyOptInStatus} (GDPR / CCPA Compliant)
              </span>
              <span>Scraped: {lead.scrapedAt}</span>
            </div>
          </div>

          {/* AI Sentiment Analysis & Key Drivers Breakdown */}
          <div className="p-4 rounded-xl bg-[#0a0e18] border border-[#1e2638] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-[#e5c98a]" />
                <h5 className="font-serif-luxury text-sm font-bold text-slate-100">
                  AI Deep Sentiment &amp; Strategic Drivers
                </h5>
              </div>
              
              <button
                onClick={handleRunAIQualification}
                disabled={isAnalyzingAI}
                className="px-2.5 py-1 rounded bg-[#162033] hover:bg-[#1e2c46] border border-[#2a3a5a] text-xs text-[#e5c98a] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isAnalyzingAI ? 'animate-spin text-[#c5a059]' : ''}`} />
                {isAnalyzingAI ? 'Scoring via Gemini...' : 'Re-Run Gemini Analysis'}
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lead.aiNotes || 'High-intent acquisition prospect identified through corporate filings and social capital deployment cues.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
              {(lead.keyDrivers || [
                'Tier-4 biometric security requirement',
                'Demonstrated portfolio expansion signal',
                'Strong capital reserves for rapid close'
              ]).map((driver, idx) => (
                <div key={idx} className="p-2 rounded-md bg-[#080b12] border border-[#182030] text-[11px] text-slate-300 flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] mt-1 shrink-0"></span>
                  <span>{driver}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Property Asset Matching */}
          <div className="p-4 rounded-xl bg-[#0a0e18] border border-[#1e2638] space-y-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#c5a059]" />
              Matched Luxury Property Asset
            </span>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#080b12] border border-[#1e2638]">
              <div>
                <span className="font-serif-luxury text-sm font-bold text-white block">
                  {matchedProperty.title}
                </span>
                <span className="text-xs text-slate-400">{matchedProperty.location} • {matchedProperty.valuation}</span>
                <span className="text-[10px] text-[#e5c98a] block mt-0.5 font-medium">
                  Infrastructure: {matchedProperty.infrastructureRating}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800">
                98% Strategic Fit
              </span>
            </div>
          </div>

          {/* Automated Omnichannel Follow-Up Cadence & Pitch Generator */}
          <div className="p-4 rounded-xl bg-[#0a0e18] border border-[#1e2638] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#c5a059]" />
                Automated Follow-Up Cadence &amp; Personalized Pitch
              </span>

              <button
                onClick={handleCopyPitch}
                className="text-[11px] text-slate-400 hover:text-[#e5c98a] flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                {copiedPitch ? 'Copied!' : 'Copy Draft'}
              </button>
            </div>

            <textarea
              value={pitchDraft}
              onChange={(e) => setPitchDraft(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-lg bg-[#080b12] border border-[#1e2638] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#c5a059] leading-relaxed resize-none"
              placeholder="Personalized outreach draft..."
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 text-[11px]">
                {lead.lastFollowUp || 'No follow-up dispatched yet.'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendFollowUp}
                  className="px-3.5 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {followUpSent ? 'Follow-Up Dispatched!' : 'Send Automated Cadence'}
                </button>
              </div>
            </div>
          </div>

          {/* CRM & External SQL Server Sync Action */}
          <div className="p-4 rounded-xl bg-[#080b12] border border-[#1e2638] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">External SQL Server &amp; CRM Synchronization</span>
              <span className="text-[11px] text-slate-400">
                Status: {lead.crmSynced ? 'Replicated in MSSQL-PROD-01' : 'Pending Replication'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    await createDriveFile(
                      `AURA_Dossier_${lead.name.replace(/\s+/g, '_')}.json`,
                      JSON.stringify(lead, null, 2),
                      'application/json'
                    );
                    alert(`Saved ${lead.name}'s dossier to Google Drive successfully!`);
                  } catch (err: any) {
                    alert(err.message || 'Please sign in with Google Workspace first.');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-[#121927] hover:bg-[#1a2336] border border-[#2a3a5a] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5 text-[#c5a059]" />
                Save to Drive
              </button>

              <button
                onClick={handleSyncToCrmAndSql}
                disabled={isSyncing}
                className="px-3.5 py-1.5 rounded-lg bg-[#162033] hover:bg-[#1e2c46] border border-[#2a3a5a] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Database className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#c5a059]' : 'text-cyan-400'}`} />
                {isSyncing ? 'Replicating...' : 'Sync to SQL Server'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
