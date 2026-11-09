import React, { useState } from 'react';
import { 
  Building2, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  KeyRound, 
  Camera, 
  Activity, 
  AlertTriangle, 
  Radio, 
  Wifi, 
  Server, 
  Download, 
  CheckCircle2, 
  Layers, 
  RefreshCw, 
  Send,
  Eye,
  Sliders,
  BellRing
} from 'lucide-react';
import { Facility, EntryPoint, SecurityIncident, UserRole } from '../types';
import { exportSecurityIncidentReport } from '../services/exportService';

interface FacilitySecurityCommandProps {
  facilities: Facility[];
  incidents: SecurityIncident[];
  onToggleEntryLock: (facilityId: string, entryPointId: string) => void;
  onResolveIncident: (incidentId: string) => void;
  onTriggerFacilityAlert: (facilityName: string) => void;
  onDispatchSiemWebhook: (type: string) => void;
  currentRole: UserRole;
  searchFilter: string;
}

export const FacilitySecurityCommand: React.FC<FacilitySecurityCommandProps> = ({
  facilities,
  incidents,
  onToggleEntryLock,
  onResolveIncident,
  onTriggerFacilityAlert,
  onDispatchSiemWebhook,
  currentRole,
  searchFilter
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(facilities[0]?.id || 'fac-1');
  const [simulatedTrafficStep, setSimulatedTrafficStep] = useState<number>(0);
  const [siemDispatched, setSiemDispatched] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'access' | 'network' | 'incidents' | 'siem'>('access');

  const selectedFacility = facilities.find(f => f.id === selectedFacilityId) || facilities[0];

  const filteredIncidents = incidents.filter(i => {
    if (!searchFilter) return true;
    return i.facilityName.toLowerCase().includes(searchFilter.toLowerCase()) ||
           i.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
           i.category.toLowerCase().includes(searchFilter.toLowerCase());
  });

  const handleSiemDispatch = () => {
    onDispatchSiemWebhook('ANOMALOUS_IOT_PROBE');
    setSiemDispatched(true);
    setTimeout(() => setSiemDispatched(false), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Multi-Location Overview Header */}
      <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-[#1e2638]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c98a]">
                <Building2 className="w-4 h-4" />
              </span>
              <h2 className="font-serif-luxury text-lg font-bold text-slate-100">
                Multi-Location Facility Infrastructure &amp; Access Oversight
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Oversee building automation, biometric turnstiles, penthouse elevators, and IoT security fabrics across all locations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onTriggerFacilityAlert(selectedFacility.name)}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5" />
              Broadcast Site Alert
            </button>

            <button
              onClick={() => exportSecurityIncidentReport(incidents, facilities)}
              className="px-3 py-1.5 rounded-lg bg-[#162033] hover:bg-[#1e2c46] border border-[#2a3a5a] text-slate-200 text-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#c5a059]" />
              Export Compliance Audit
            </button>
          </div>
        </div>

        {/* Facility Location Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
          {facilities.map((fac) => {
            const isSelected = fac.id === selectedFacilityId;
            return (
              <button
                key={fac.id}
                onClick={() => setSelectedFacilityId(fac.id)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#121929] to-[#0a0e1a] border-[#c5a059] shadow-lg shadow-[#c5a059]/10'
                    : 'bg-[#080c14] border-[#1e2638] hover:border-slate-600'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#c5a059]/10 rounded-full blur-lg pointer-events-none"></div>
                )}
                <div className="flex items-center justify-between mb-1">
                  <span className="font-tech text-[10px] text-[#c5a059] font-bold tracking-wider">{fac.code}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                    fac.activeThreatLevel === 'Low (Normal)'
                      ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950/50 text-amber-300 border-amber-800 animate-pulse'
                  }`}>
                    {fac.activeThreatLevel}
                  </span>
                </div>
                <h4 className="font-serif-luxury text-sm font-bold text-slate-100">{fac.name}</h4>
                <p className="text-[11px] text-slate-400 font-light mt-0.5">{fac.city}</p>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-[#1e2638] text-[10px] text-slate-400">
                  <div>
                    <span className="block text-slate-500">Sensors</span>
                    <strong className="text-slate-200">{fac.onlineSensors}/{fac.totalSensors}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-500">Latency</span>
                    <strong className="text-emerald-400">{fac.networkLatency}ms</strong>
                  </div>
                  <div>
                    <span className="block text-slate-500">Cameras</span>
                    <strong className="text-slate-200">{fac.cameraFeedsCount}</strong>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Facility Tabbed Sub-View: Entry Points, Network Traffic, Incidents, SIEM */}
      <div className="flex items-center gap-2 border-b border-[#1e2638] pb-2">
        <button
          onClick={() => setActiveTab('access')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'access'
              ? 'bg-[#c5a059] text-black'
              : 'text-slate-400 hover:text-slate-200 bg-[#0d121c] border border-[#1e2638]'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Access Control &amp; Entry Points ({selectedFacility.entryPoints.length})
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'network'
              ? 'bg-[#c5a059] text-black'
              : 'text-slate-400 hover:text-slate-200 bg-[#0d121c] border border-[#1e2638]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Network Traffic &amp; Vulnerabilities
        </button>

        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'incidents'
              ? 'bg-[#c5a059] text-black'
              : 'text-slate-400 hover:text-slate-200 bg-[#0d121c] border border-[#1e2638]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Site Incident Workflow ({incidents.filter(i => !i.resolved).length} Open)
        </button>

        <button
          onClick={() => setActiveTab('siem')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'siem'
              ? 'bg-[#c5a059] text-black'
              : 'text-slate-400 hover:text-slate-200 bg-[#0d121c] border border-[#1e2638]'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          External SIEM Integration
        </button>
      </div>

      {/* Sub-View 1: Remote Entry Point Access Permissions */}
      {activeTab === 'access' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Real-time permission overrides for <strong className="text-slate-200">{selectedFacility.name}</strong>. Operations logged to tamper-evident audit ledger.
            </span>
            <span className="text-[11px] font-tech text-[#c5a059]">Hardware Root of Trust Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {selectedFacility.entryPoints.map((entry) => {
              const isLocked = entry.status === 'locked';

              return (
                <div
                  key={entry.id}
                  className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-4 flex flex-col justify-between hover:border-[#2a3a5a] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {entry.type}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isLocked 
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                      }`}>
                        {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {isLocked ? 'SECURE / LOCKED' : 'UNLOCKED / ACTIVE'}
                      </span>
                    </div>

                    <h4 className="font-serif-luxury text-base font-bold text-slate-100">{entry.name}</h4>

                    <div className="mt-3 p-2.5 rounded-lg bg-[#080b12] border border-[#1a2233] space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Last Verified Access:</span>
                        <strong className="text-slate-200">{entry.lastAccessedBy}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Timestamp:</span>
                        <span className="text-slate-300">{entry.lastAccessTime}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Authentication Method:</span>
                        <span className="text-[#e5c98a] font-medium">{entry.authMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1e2638] flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-tech">ID: {entry.id}</span>

                    <button
                      onClick={() => onToggleEntryLock(selectedFacility.id, entry.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isLocked
                          ? 'bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 text-amber-300'
                          : 'bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-300'
                      }`}
                    >
                      {isLocked ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" /> Trigger Remote Unlock
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Trigger Remote Lock
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-View 2: Network Traffic & Potential Vulnerability Visualizer */}
      {activeTab === 'network' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Visualizer Chart */}
            <div className="lg:col-span-2 bg-[#0d121c] border border-[#1e2638] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif-luxury text-sm font-bold text-slate-100">
                    Real-Time IoT &amp; Building Network Telemetry
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Encrypted stream packets across BACnet, Zigbee, and IP Camera VLANs
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Valid Encrypted Traffic
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span> Deflected Threat Probes
                  </span>
                </div>
              </div>

              {/* Interactive SVG Network Graph */}
              <div className="w-full h-56 bg-[#080b12] rounded-lg border border-[#182030] p-4 flex flex-col justify-end relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e2638_1px,transparent_1px),linear-gradient(to_bottom,#1e2638_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"></div>
                
                <svg className="w-full h-40 overflow-visible">
                  {/* Grid lines */}
                  <line x1="0" y1="20" x2="100%" y2="20" stroke="#1e2638" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="100%" y2="60" stroke="#1e2638" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="100%" y2="100" stroke="#1e2638" strokeDasharray="3 3" />
                  
                  {/* Path for Normal Traffic (Emerald) */}
                  <path
                    d="M0,90 Q80,40 160,75 T320,50 T480,65 T640,30 T800,45"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    className="drop-shadow-sm"
                  />
                  {/* Area under emerald curve */}
                  <path
                    d="M0,90 Q80,40 160,75 T320,50 T480,65 T640,30 T800,45 L800,140 L0,140 Z"
                    fill="url(#emeraldGrad)"
                    opacity="0.15"
                  />
                  
                  {/* Path for Threat Anomaly Spikes (Rose) */}
                  <path
                    d="M0,135 Q120,135 240,130 T360,110 T460,40 T520,125 T800,135"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />

                  <defs>
                    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="flex justify-between text-[10px] text-slate-500 font-tech mt-2">
                  <span>00:00 UTC</span>
                  <span>06:00 UTC</span>
                  <span>12:00 UTC</span>
                  <span>18:00 UTC</span>
                  <span className="text-[#c5a059] font-bold">LIVE TELEMETRY</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
                <div className="p-2.5 rounded-lg bg-[#080b12] border border-[#1e2638]">
                  <span className="text-[10px] text-slate-500 block">Bandwidth Throughput</span>
                  <strong className="text-slate-200">842.6 Mbps</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-[#080b12] border border-[#1e2638]">
                  <span className="text-[10px] text-slate-500 block">Zero-Trust Packet Drops</span>
                  <strong className="text-emerald-400">100% Mitigated</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-[#080b12] border border-[#1e2638]">
                  <span className="text-[10px] text-slate-500 block">Active Micro-VLANs</span>
                  <strong className="text-slate-200">12 Segments</strong>
                </div>
              </div>
            </div>

            {/* Vulnerability Audit Checklist */}
            <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-3">
              <h3 className="font-serif-luxury text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Vulnerability Assessment
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#080b12] border border-[#1e2638] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">BACnet Protocol Isolation</span>
                    <span className="text-[10px] text-slate-400">Air-gapped from public WAN</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                    PASSED
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#080b12] border border-[#1e2638] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">CCTV Camera TLS 1.3</span>
                    <span className="text-[10px] text-slate-400">All 64 streams encrypted</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                    PASSED
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#080b12] border border-[#1e2638] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">Biometric Gateway Firmware</span>
                    <span className="text-[10px] text-slate-400">Patch v4.2.1 installed</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                    PASSED
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#080b12] border border-[#1e2638] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">Elevator Keypad Replay Shield</span>
                    <span className="text-[10px] text-slate-400">Rolling OTP cryptotoken active</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                    PASSED
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#121927] border border-[#22304d] text-[11px] text-slate-300">
                <strong>Zero Known Vulnerabilities:</strong> Complies with NIST SP 800-82 standard for smart building automation security.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Sub-View 3: Site Incident Workflow & Triage */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Real-time incident log across all enterprise locations. Click triage to resolve or escalate.
            </span>
            <span className="text-rose-400 font-semibold">
              {incidents.filter(i => !i.resolved).length} Unresolved Incidents
            </span>
          </div>

          <div className="space-y-3">
            {filteredIncidents.map((inc) => {
              return (
                <div
                  key={inc.id}
                  className={`p-4 rounded-xl border transition-all ${
                    inc.resolved
                      ? 'bg-[#0a0d14] border-[#1e2638] opacity-75'
                      : inc.severity === 'CRITICAL'
                        ? 'bg-rose-950/20 border-rose-800/60'
                        : 'bg-[#0d121c] border-amber-800/40'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          inc.severity === 'CRITICAL'
                            ? 'bg-rose-600 text-white'
                            : inc.severity === 'WARNING'
                              ? 'bg-amber-600 text-black'
                              : 'bg-blue-600 text-white'
                        }`}>
                          {inc.severity}
                        </span>
                        <span className="font-tech text-xs text-[#c5a059] font-bold">{inc.category}</span>
                        <span className="text-xs text-slate-400">• {inc.facilityName}</span>
                        <span className="text-[11px] text-slate-500 font-tech">({inc.timestamp})</span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1">{inc.description}</p>
                      {inc.resolved && (
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3 h-3" /> Resolved by {inc.resolvedBy || 'Facility Operations'}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!inc.resolved && (
                        <button
                          onClick={() => onResolveIncident(inc.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-View 4: External SIEM Integration Hub */}
      {activeTab === 'siem' && (
        <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2638]">
            <div>
              <h3 className="font-serif-luxury text-base font-bold text-slate-100 flex items-center gap-2">
                <Server className="w-4 h-4 text-[#c5a059]" />
                Enterprise Security Information &amp; Event Management (SIEM) Hub
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Stream incident logs, facility access triggers, and biometric events directly into your corporate SIEM.
              </p>
            </div>

            <button
              onClick={handleSiemDispatch}
              disabled={siemDispatched}
              className="px-3 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {siemDispatched ? 'Dispatched to SIEM!' : 'Dispatch Test Threat Webhook'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#080b12] border border-[#1e2638] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-xs">Splunk Cloud HEC</span>
                <span className="text-[10px] text-emerald-400 font-tech font-bold">CONNECTED</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Endpoint: <span className="font-tech text-slate-300">https://aura-hec.splunkcloud.com:8088</span>
              </p>
              <span className="text-[10px] text-slate-500 block">Latency: 18ms • TLS 1.3 Strict</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080b12] border border-[#1e2638] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-xs">Datadog Security Agent</span>
                <span className="text-[10px] text-emerald-400 font-tech font-bold">CONNECTED</span>
              </div>
              <p className="text-[11px] text-slate-400">
                VPC Peer: <span className="font-tech text-slate-300">us-east-1 / aura-cluster-prod</span>
              </p>
              <span className="text-[10px] text-slate-500 block">Agent v7.52 • Anomaly ML Active</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080b12] border border-[#1e2638] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-xs">Microsoft Sentinel</span>
                <span className="text-[10px] text-emerald-400 font-tech font-bold">STANDBY</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Log Analytics Workspace: <span className="font-tech text-slate-300">AURA-DEFENSE-WS</span>
              </p>
              <span className="text-[10px] text-slate-500 block">Auto-Sync on Critical Incidents</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
