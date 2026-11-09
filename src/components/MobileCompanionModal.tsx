import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Clock, 
  KeyRound, 
  ShieldCheck, 
  Camera, 
  RefreshCw, 
  Send, 
  QrCode, 
  ListChecks,
  AlertCircle
} from 'lucide-react';
import { OfflineAction } from '../types';
import { getOfflineQueue, addOfflineAction, syncOfflineQueueToServer } from '../services/offlineSyncService';

interface MobileCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  onActionSynced: () => void;
}

export const MobileCompanionModal: React.FC<MobileCompanionModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  onToggleOnline,
  onActionSynced
}) => {
  if (!isOpen) return null;

  const [queue, setQueue] = useState<OfflineAction[]>([]);
  const [activeTab, setActiveTab] = useState<'inspections' | 'qr' | 'queue'>('inspections');
  const [selectedFacilityName, setSelectedFacilityName] = useState('Obsidian Sovereign Tower');
  const [checklist, setChecklist] = useState({
    biometricSensorTested: true,
    fireVLANPingsVerified: true,
    cctvWiperTested: false,
    visitorBadgesReconciled: true,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    setQueue(getOfflineQueue());
  }, []);

  const handleQueueInspection = () => {
    const action = addOfflineAction({
      type: 'FIELD_INSPECTION',
      entityId: selectedFacilityName,
      payload: {
        facility: selectedFacilityName,
        checklist,
        inspector: 'Field Agent Mobile Unit 04',
        timestamp: new Date().toISOString()
      }
    });
    setQueue(getOfflineQueue());
    setSyncMessage(isOnline ? 'Inspection logged and synchronized!' : 'Action saved offline in device buffer!');
    setTimeout(() => setSyncMessage(null), 3000);
    onActionSynced();
  };

  const handleSyncAllOffline = async () => {
    setIsSyncing(true);
    const result = await syncOfflineQueueToServer();
    setQueue(getOfflineQueue());
    setIsSyncing(false);
    setSyncMessage(`Successfully synchronized ${result.count} offline records with SQL Server.`);
    setTimeout(() => setSyncMessage(null), 4000);
    onActionSynced();
  };

  const unsyncedCount = queue.filter(q => !q.synced).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Phone Mockup Frame */}
      <div className="w-full max-w-sm bg-[#090d15] border-2 border-[#c5a059]/60 rounded-[36px] shadow-2xl overflow-hidden flex flex-col h-[740px] relative">
        
        {/* Phone Speaker Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#141b2b] rounded-full z-20 flex items-center justify-center">
          <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
        </div>

        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-1 rounded-full bg-slate-800/80 text-slate-300 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mobile Status Bar */}
        <div className="pt-7 px-5 pb-2 bg-[#0d1320] flex items-center justify-between text-[11px] text-slate-400 border-b border-[#1e2638]">
          <span className="font-tech font-bold text-slate-300">09:41</span>
          
          <div className="flex items-center gap-2">
            {/* Toggle Online/Offline */}
            <button
              onClick={onToggleOnline}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                isOnline ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' : 'bg-amber-950/60 text-amber-300 border border-amber-800'
              }`}
              title="Click to toggle simulation between online and field offline mode"
            >
              {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
              {isOnline ? 'Online' : 'Offline'}
            </button>
            <span className="text-[10px] text-slate-300 font-tech">5G • 98%</span>
          </div>
        </div>

        {/* Mobile App Header */}
        <div className="px-5 py-3 bg-[#0d1320] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#c5a059] flex items-center justify-center text-black font-serif-luxury font-bold text-xs">
              A
            </div>
            <div>
              <h4 className="font-serif-luxury text-xs font-bold text-slate-100">AURA Field Companion</h4>
              <p className="text-[9px] text-slate-400">Offline Field Operations &amp; Access</p>
            </div>
          </div>
          
          <span className="text-[10px] font-tech text-[#c5a059] bg-[#c5a059]/10 px-2 py-0.5 rounded">
            Agent #04
          </span>
        </div>

        {/* Offline Banner if Offline */}
        {!isOnline && (
          <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-1.5 flex items-center justify-between text-[10px] text-amber-200">
            <span className="flex items-center gap-1.5 font-medium">
              <WifiOff className="w-3 h-3 text-amber-400" />
              Offline Buffer Active (Full Local Sync)
            </span>
            <span className="font-bold">{unsyncedCount} Queued</span>
          </div>
        )}

        {syncMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-800 px-4 py-1.5 text-[10px] text-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Navigation Tabs in Mobile App */}
        <div className="flex items-center border-b border-[#1e2638] bg-[#090d15] text-[11px]">
          <button
            onClick={() => setActiveTab('inspections')}
            className={`flex-1 py-2 text-center font-medium border-b-2 transition-all ${
              activeTab === 'inspections'
                ? 'border-[#c5a059] text-[#e5c98a] bg-[#121927]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Inspections
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 text-center font-medium border-b-2 transition-all ${
              activeTab === 'qr'
                ? 'border-[#c5a059] text-[#e5c98a] bg-[#121927]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Digital Pass
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 py-2 text-center font-medium border-b-2 transition-all flex items-center justify-center gap-1 ${
              activeTab === 'queue'
                ? 'border-[#c5a059] text-[#e5c98a] bg-[#121927]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Queue ({unsyncedCount})
          </button>
        </div>

        {/* Mobile Tab Content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          
          {/* Tab 1: Inspections */}
          {activeTab === 'inspections' && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Target Facility</label>
                <select
                  value={selectedFacilityName}
                  onChange={(e) => setSelectedFacilityName(e.target.value)}
                  className="w-full bg-[#121927] border border-[#1e2638] rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Obsidian Sovereign Tower">Obsidian Sovereign Tower (New York)</option>
                  <option value="Bel-Air Horizon Crown Compound">Bel-Air Horizon Crown (Los Angeles)</option>
                  <option value="Aura Financial Spire">Aura Financial Spire (Miami)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#121927] border border-[#1e2638] space-y-2.5">
                <span className="text-[10px] font-semibold text-[#c5a059] uppercase tracking-wider block">
                  Field Verification Checklist
                </span>

                <label className="flex items-center justify-between text-[11px] text-slate-200 cursor-pointer">
                  <span>Biometric Turnstile Readers Responsive</span>
                  <input
                    type="checkbox"
                    checked={checklist.biometricSensorTested}
                    onChange={(e) => setChecklist({ ...checklist, biometricSensorTested: e.target.checked })}
                    className="accent-[#c5a059]"
                  />
                </label>

                <label className="flex items-center justify-between text-[11px] text-slate-200 cursor-pointer">
                  <span>BACnet Fire Sensor Telemetry Pings</span>
                  <input
                    type="checkbox"
                    checked={checklist.fireVLANPingsVerified}
                    onChange={(e) => setChecklist({ ...checklist, fireVLANPingsVerified: e.target.checked })}
                    className="accent-[#c5a059]"
                  />
                </label>

                <label className="flex items-center justify-between text-[11px] text-slate-200 cursor-pointer">
                  <span>Perimeter Camera Lens Cleanliness Tested</span>
                  <input
                    type="checkbox"
                    checked={checklist.cctvWiperTested}
                    onChange={(e) => setChecklist({ ...checklist, cctvWiperTested: e.target.checked })}
                    className="accent-[#c5a059]"
                  />
                </label>

                <label className="flex items-center justify-between text-[11px] text-slate-200 cursor-pointer">
                  <span>VIP Guest Access Codes Reconciled</span>
                  <input
                    type="checkbox"
                    checked={checklist.visitorBadgesReconciled}
                    onChange={(e) => setChecklist({ ...checklist, visitorBadgesReconciled: e.target.checked })}
                    className="accent-[#c5a059]"
                  />
                </label>
              </div>

              <button
                onClick={handleQueueInspection}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#8c6d32] text-black font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#c5a059]/10 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isOnline ? 'Save & Sync Online' : 'Queue Inspection Offline'}
              </button>

              <p className="text-[10px] text-slate-500 text-center">
                Field updates will cache safely on device storage until network reconnects.
              </p>
            </div>
          )}

          {/* Tab 2: Digital Mobile QR Access Pass */}
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center py-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Executive Encrypted Access Pass
              </span>
              
              <div className="w-44 h-44 bg-white p-3 rounded-2xl mx-auto shadow-xl flex items-center justify-center border-4 border-[#c5a059]">
                <QrCode className="w-36 h-36 text-black" />
              </div>

              <div>
                <span className="text-xs font-serif-luxury font-bold text-slate-100 block">
                  Agent Vance - Security Escort 04
                </span>
                <span className="font-tech text-[10px] text-[#c5a059]">TOKEN: AURA-992-TOTP-EXPR</span>
                <p className="text-[10px] text-slate-500 mt-1">Rotates every 30 seconds (NFC / Optical scan)</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#121927] border border-[#1e2638] text-[10px] text-slate-400">
                Authorized for all Portals in <strong className="text-slate-200">{selectedFacilityName}</strong>
              </div>
            </div>
          )}

          {/* Tab 3: Offline Queue Manager */}
          {activeTab === 'queue' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Pending Field Queue:</span>
                <strong className="text-slate-200">{queue.length} Total ({unsyncedCount} Unsynced)</strong>
              </div>

              {unsyncedCount > 0 && (
                <button
                  onClick={handleSyncAllOffline}
                  disabled={!isOnline || isSyncing}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing to SQL Server...' : 'Sync All Pending to Cloud'}
                </button>
              )}

              <div className="space-y-2">
                {queue.map(item => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-[#121927] border border-[#1e2638] space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-tech font-bold text-[#c5a059]">{item.type}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold ${
                        item.synced ? 'text-emerald-400 bg-emerald-950/40' : 'text-amber-400 bg-amber-950/40'
                      }`}>
                        {item.synced ? 'SYNCED' : 'QUEUED'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-200 block truncate">{item.entityId}</span>
                    <span className="text-[9px] text-slate-500 font-tech">{item.timestamp}</span>
                  </div>
                ))}

                {queue.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-[11px]">
                    No actions in offline queue.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Home Indicator */}
        <div className="p-3 bg-[#0d1320] border-t border-[#1e2638] flex justify-center">
          <div className="w-28 h-1 bg-slate-600 rounded-full"></div>
        </div>

      </div>
    </div>
  );
};
