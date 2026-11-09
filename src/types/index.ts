export type SocialPlatform = 'linkedin' | 'instagram' | 'facebook' | 'web';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'negotiating' | 'closed';

export type UserRole = 'Super Admin' | 'Portfolio Director' | 'Facility Operations Manager' | 'Lead Broker' | 'Field Agent' | 'Compliance Auditor';

export interface Lead {
  id: string;
  name: string;
  headline: string;
  company: string;
  location: string;
  avatar: string;
  platform: SocialPlatform;
  profileUrl: string;
  rawSignal: string;
  scrapedAt: string;
  status: LeadStatus;
  sentiment: 'Highly Positive' | 'Positive' | 'Neutral' | 'Cautious';
  intentScore: number; // 0 - 100
  urgency: 'Immediate (0-30 days)' | 'Medium (30-90 days)' | 'Long-term (90+ days)';
  propertyInterest: string;
  budgetRange: string;
  matchedPropertyId?: string;
  matchedPropertyTitle?: string;
  aiNotes?: string;
  keyDrivers?: string[];
  suggestedPitch?: string;
  tosCompliant: boolean;
  privacyOptInStatus: 'Verified Public' | 'Business Profile' | 'Consent Scraped';
  crmSynced: boolean;
  lastFollowUp?: string;
}

export interface Property {
  id: string;
  title: string;
  category: 'Penthouse' | 'Commercial Office' | 'Mixed-Use Development' | 'Luxury Villa' | 'Tech Campus';
  location: string;
  city: string;
  valuation: string;
  squareFeet: string;
  status: 'Available' | 'Under LOI' | 'Development Stage' | 'Fully Leased';
  imageUrl: string;
  infrastructureRating: 'Tier 4 Data / Biometric' | 'Tier 3 Smart Tower' | 'High Security Gated';
  activeOccupancy: number; // percentage
  entryPointsCount: number;
}

export interface EntryPoint {
  id: string;
  facilityId: string;
  name: string;
  type: 'Biometric Gate' | 'Smart Turnstile' | 'Executive Penthouse Elevator' | 'Server Vault' | 'Helipad Access' | 'Perimeter Barrier';
  status: 'locked' | 'unlocked' | 'alarm' | 'maintenance';
  lastAccessedBy: string;
  lastAccessTime: string;
  authMethod: 'Facial Biometric' | 'RFID Card' | 'Mobile Digital Key' | 'Dual PIN MFA';
}

export interface Facility {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  type: 'Luxury Residential Tower' | 'Class-A Commercial' | 'Mixed-Use Urban' | 'Private Enclave';
  activeThreatLevel: 'Low (Normal)' | 'Elevated' | 'High (Breach Warning)';
  onlineSensors: number;
  totalSensors: number;
  networkLatency: number; // ms
  entryPoints: EntryPoint[];
  cameraFeedsCount: number;
  lastSecuritySweep: string;
  managerName: string;
}

export interface SecurityIncident {
  id: string;
  timestamp: string;
  facilityName: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'Unauthorized Entry Attempt' | 'Network Port Scan' | 'API Rate Spurt' | 'Fire Sensor Telemetry' | 'Credential Replay';
  description: string;
  resolved: boolean;
  resolvedBy?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  module: 'LEAD_SCRAPER' | 'ACCESS_CONTROL' | 'CRM_SYNC' | 'RBAC_SECURITY' | 'DATA_EXPORT' | 'AI_SENTIMENT';
  status: 'SUCCESS' | 'WARN' | 'BLOCKED';
  ipAddress: string;
  details: string;
  hash: string; // SHA-256 integrity hash
}

export interface SystemAlert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'security' | 'lead' | 'sync' | 'compliance';
  read: boolean;
  priority: 'urgent' | 'standard';
}

export interface OfflineAction {
  id: string;
  timestamp: string;
  type: 'FIELD_INSPECTION' | 'ENTRY_OVERRIDE' | 'LEAD_NOTE_ADDED';
  entityId: string;
  payload: any;
  synced: boolean;
}

export interface CRMSyncConfig {
  salesforceConnected: boolean;
  hubspotConnected: boolean;
  proprietaryCrmConnected: boolean;
  sqlServerConnected: boolean;
  sqlServerHost: string;
  sqlServerDatabase: string;
  lastSyncTimestamp: string;
  autoSyncIntervalMinutes: number;
}
