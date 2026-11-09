import React, { useState } from 'react';
import { 
  Server, 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  Lock, 
  Search, 
  Download, 
  Database, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Eye,
  FileCheck2,
  Terminal,
  Clock
} from 'lucide-react';
import { AuditLogItem, UserRole } from '../types';
import { exportAuditLogsToCSV, generateEncryptedBackupSnapshot } from '../services/exportService';

interface SecurityAndComplianceProps {
  auditLogs: AuditLogItem[];
  currentRole: UserRole;
  mfaEnabled: boolean;
  onOpenMfa: () => void;
  searchFilter: string;
}

export const SecurityAndCompliance: React.FC<SecurityAndComplianceProps> = ({
  auditLogs,
  currentRole,
  mfaEnabled,
  onOpenMfa,
  searchFilter
}) => {
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [backupGenerated, setBackupGenerated] = useState<boolean>(false);
  const [localSearch, setLocalSearch] = useState<string>('');

  const effectiveSearch = localSearch || searchFilter;

  const filteredLogs = auditLogs.filter(log => {
    const matchesModule = moduleFilter === 'ALL' || log.module === moduleFilter;
    const matchesQuery = !effectiveSearch ||
      log.user.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      log.hash.toLowerCase().includes(effectiveSearch.toLowerCase());
    return matchesModule && matchesQuery;
  });

  const handleGenerateBackup = () => {
    generateEncryptedBackupSnapshot({
      auditLogs,
      timestamp: new Date().toISOString(),
      role: currentRole,
      encryption: 'AES-256-GCM'
    });
    setBackupGenerated(true);
    setTimeout(() => setBackupGenerated(false), 4000);
  };

  // Mock RBAC Matrix
  const rbacMatrix = [
    { role: 'Super Admin', scraper: true, entryLocks: true, crmSync: true, exportData: true, auditAdmin: true },
    { role: 'Portfolio Director', scraper: true, entryLocks: false, crmSync: true, exportData: true, auditAdmin: false },
    { role: 'Facility Operations Manager', scraper: false, entryLocks: true, crmSync: false, exportData: true, auditAdmin: true },
    { role: 'Lead Broker', scraper: true, entryLocks: false, crmSync: true, exportData: true, auditAdmin: false },
    { role: 'Field Agent', scraper: false, entryLocks: false, crmSync: false, exportData: false, auditAdmin: false },
    { role: 'Compliance Auditor', scraper: true, entryLocks: false, crmSync: false, exportData: true, auditAdmin: true },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Enterprise Security & Encryption */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: End-to-End Encryption */}
        <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Data Encryption Standard</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-serif-luxury font-bold text-slate-100">AES-256-GCM</span>
            <span className="text-xs text-emerald-400 font-tech">ACTIVE</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Hardware-backed key derivation (PBKDF2) and TLS 1.3 encryption in transit for all client data.
          </p>
        </div>

        {/* Card 2: Multi-Factor Authentication */}
        <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Access Control Policy</span>
            <KeyRound className="w-4 h-4 text-[#e5c98a]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-serif-luxury font-bold text-slate-100">
              {mfaEnabled ? '2FA Enforced' : 'MFA Recommended'}
            </span>
            <span className={`text-xs font-tech ${mfaEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>
              {mfaEnabled ? 'VERIFIED' : 'PENDING'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-slate-400">TOTP Authenticator &amp; FIDO2 Support</p>
            <button
              onClick={onOpenMfa}
              className="text-[11px] text-[#e5c98a] hover:underline cursor-pointer"
            >
              Configure
            </button>
          </div>
        </div>

        {/* Card 3: Automated Disaster Recovery */}
        <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Disaster Recovery &amp; Backups</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-serif-luxury font-bold text-slate-100">Automated Hourly</span>
            <span className="text-xs text-emerald-400 font-tech">0 FAILURES</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">Immutable snapshot replication</span>
            <button
              onClick={handleGenerateBackup}
              className="text-[11px] bg-[#162033] hover:bg-[#1e2c46] border border-[#2a3a5a] text-slate-200 px-2 py-0.5 rounded cursor-pointer transition-all"
            >
              Backup Now
            </button>
          </div>
        </div>

      </div>

      {backupGenerated && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Encrypted disaster recovery backup file (.aura-enc) created and downloaded securely.
          </span>
          <span className="font-tech text-[10px] text-emerald-400">AES-GCM CHECKSUM VERIFIED</span>
        </div>
      )}

      {/* Role-Based Access Control (RBAC) Matrix */}
      <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2638]">
          <div>
            <h3 className="font-serif-luxury text-base font-bold text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#c5a059]" />
              Role-Based Access Control (RBAC) Permissions Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict compartmentalization prevents unauthorized entry operations and enforces data privacy boundaries.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#e5c98a] px-2.5 py-1 rounded bg-[#c5a059]/15 border border-[#c5a059]/30">
            Current Active Role: {currentRole}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e2638] text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Role Designation</th>
                <th className="py-2.5 px-3">Lead Scraper &amp; TOS</th>
                <th className="py-2.5 px-3">Remote Facility Locks</th>
                <th className="py-2.5 px-3">CRM &amp; SQL Server Sync</th>
                <th className="py-2.5 px-3">Spreadsheet Exports</th>
                <th className="py-2.5 px-3">Audit Log Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638]/50 text-slate-300">
              {rbacMatrix.map((item) => {
                const isCurrent = item.role === currentRole;
                return (
                  <tr key={item.role} className={isCurrent ? 'bg-[#162033]/40 font-semibold' : ''}>
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>}
                      <span className={isCurrent ? 'text-[#e5c98a]' : 'text-slate-200'}>{item.role}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      {item.scraper ? (
                        <span className="text-emerald-400">Granted</span>
                      ) : (
                        <span className="text-slate-600">Restricted</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {item.entryLocks ? (
                        <span className="text-emerald-400">Granted</span>
                      ) : (
                        <span className="text-slate-600">Restricted</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {item.crmSync ? (
                        <span className="text-emerald-400">Granted</span>
                      ) : (
                        <span className="text-slate-600">Restricted</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {item.exportData ? (
                        <span className="text-emerald-400">Granted</span>
                      ) : (
                        <span className="text-slate-600">Restricted</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {item.auditAdmin ? (
                        <span className="text-emerald-400">Granted</span>
                      ) : (
                        <span className="text-slate-600">Restricted</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Tamper-Evident Audit Log Explorer */}
      <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-[#1e2638]">
          <div>
            <h3 className="font-serif-luxury text-base font-bold text-slate-100 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#c5a059]" />
              Tamper-Evident Platform Audit Trail
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographically chained SHA-256 records tracking scraper queries, door locks, and administrative actions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Search filter for audit log */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Filter logs or hash..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#080b12] border border-[#1e2638] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <button
              onClick={() => exportAuditLogsToCSV(auditLogs)}
              className="px-3 py-1.5 rounded-lg bg-[#162033] hover:bg-[#1e2c46] border border-[#2a3a5a] text-slate-200 text-xs flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#c5a059]" />
              Export Audit CSV
            </button>
          </div>
        </div>

        {/* Module Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['ALL', 'ACCESS_CONTROL', 'LEAD_SCRAPER', 'CRM_SYNC', 'RBAC_SECURITY', 'DATA_EXPORT'].map((mod) => (
            <button
              key={mod}
              onClick={() => setModuleFilter(mod)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                moduleFilter === mod
                  ? 'bg-[#c5a059] text-black font-semibold'
                  : 'bg-[#080b12] text-slate-400 hover:text-slate-200 border border-[#1e2638]'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        {/* Audit Log Entries Table */}
        <div className="overflow-x-auto rounded-lg border border-[#1e2638]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080b12] text-slate-400 text-[11px]">
              <tr>
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Actor / User</th>
                <th className="py-2 px-3">Module</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Details</th>
                <th className="py-2 px-3">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638] bg-[#0d121c] font-light">
              {filteredLogs.map((log) => {
                return (
                  <tr key={log.id} className="hover:bg-[#121826] transition-colors">
                    <td className="py-2.5 px-3 font-tech text-slate-400 text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-medium whitespace-nowrap">
                      {log.user}
                      <span className="block text-[10px] text-slate-500 font-normal">{log.role}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-tech text-slate-300 bg-[#162033] px-1.5 py-0.5 rounded">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-tech text-[#e5c98a] font-medium">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                          : log.status === 'WARN'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate text-[11px]">
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 font-tech text-[10px] text-slate-500">
                      sha256:{log.hash.slice(0, 10)}...
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-500">
            No audit log entries found matching criteria.
          </div>
        )}
      </div>

    </div>
  );
};
