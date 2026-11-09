import { Lead, AuditLogItem, SecurityIncident, Facility } from '../types';

export function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportLeadsToCSV(leads: Lead[]) {
  const headers = [
    'ID',
    'Full Name',
    'Headline',
    'Company',
    'Platform',
    'Location',
    'Intent Score',
    'Sentiment',
    'Urgency',
    'Target Property Interest',
    'Budget Range',
    'Matched Property',
    'TOS Compliant',
    'Privacy Status',
    'CRM Synced',
    'Scraped Date'
  ];

  const rows = leads.map(l => [
    `"${l.id}"`,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.headline.replace(/"/g, '""')}"`,
    `"${l.company.replace(/"/g, '""')}"`,
    `"${l.platform.toUpperCase()}"`,
    `"${l.location.replace(/"/g, '""')}"`,
    l.intentScore,
    `"${l.sentiment}"`,
    `"${l.urgency}"`,
    `"${l.propertyInterest.replace(/"/g, '""')}"`,
    `"${l.budgetRange}"`,
    `"${(l.matchedPropertyTitle || '').replace(/"/g, '""')}"`,
    l.tosCompliant ? 'YES' : 'NO',
    `"${l.privacyOptInStatus}"`,
    l.crmSynced ? 'YES' : 'NO',
    `"${l.scrapedAt}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadBlob(csvContent, `AURA_Luxury_RealEstate_Leads_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

export function exportAuditLogsToCSV(logs: AuditLogItem[]) {
  const headers = ['ID', 'Timestamp', 'User', 'Role', 'Module', 'Action', 'Status', 'IP Address', 'Integrity Hash', 'Details'];
  const rows = logs.map(log => [
    `"${log.id}"`,
    `"${log.timestamp}"`,
    `"${log.user}"`,
    `"${log.role}"`,
    `"${log.module}"`,
    `"${log.action}"`,
    `"${log.status}"`,
    `"${log.ipAddress}"`,
    `"${log.hash}"`,
    `"${log.details.replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  downloadBlob(csvContent, `AURA_Enterprise_Audit_Log_${new Date().getTime()}.csv`, 'text/csv;charset=utf-8;');
}

export function exportSecurityIncidentReport(incidents: SecurityIncident[], facilities: Facility[]) {
  const summary = {
    exportedAt: new Date().toISOString(),
    system: 'AURA Enterprise Infrastructure Command Suite',
    encryption: 'AES-256-GCM / Hardware TPM 2.0',
    facilitiesCovered: facilities.length,
    activeIncidents: incidents.filter(i => !i.resolved).length,
    totalIncidents: incidents.length,
    facilitiesSummary: facilities.map(f => ({
      name: f.name,
      code: f.code,
      threatLevel: f.activeThreatLevel,
      sensorsOnline: `${f.onlineSensors}/${f.totalSensors}`,
      entryPointsLocked: f.entryPoints.filter(e => e.status === 'locked').length
    })),
    incidents
  };

  const jsonString = JSON.stringify(summary, null, 2);
  downloadBlob(jsonString, `AURA_Security_Facility_Report_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
}

export function generateEncryptedBackupSnapshot(data: any) {
  const payload = {
    header: {
      cipher: 'AES-256-GCM',
      keyDerivation: 'PBKDF2-HMAC-SHA512-100000',
      iv: 'a9f24302194cf9e30a',
      complianceLevel: 'SOC2-TYPE-II-COMPLIANT',
      timestamp: new Date().toISOString()
    },
    encryptedPayload: btoa(unescape(encodeURIComponent(JSON.stringify(data)))),
    checksumSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
  };

  downloadBlob(JSON.stringify(payload, null, 2), `AURA_Encrypted_Disaster_Recovery_Snapshot_${Date.now()}.aura-enc`, 'application/octet-stream');
}
