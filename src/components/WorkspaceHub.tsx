import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Table, 
  Calendar, 
  Mail, 
  MessageSquare, 
  FolderGit2, 
  CheckCircle2, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Send, 
  RefreshCw, 
  Lock, 
  AlertTriangle,
  HardDrive,
  Users,
  Building2,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken 
} from '../services/firebase';
import { 
  listDriveFiles, 
  createDriveFile, 
  deleteDriveFile, 
  DriveFileItem,
  createLeadsSpreadsheet,
  createLuxuryInvestmentDoc,
  listCalendarEvents,
  createCalendarTourEvent,
  CalendarEventItem,
  listRecentGmailMessages,
  sendGmailEmail,
  GmailMessageSummary,
  listChatSpaces,
  sendChatMessage,
  ChatSpaceItem,
  createInvestorForm
} from '../services/workspaceService';
import { Lead, Property } from '../types';

interface WorkspaceHubProps {
  leads: Lead[];
  properties: Property[];
  currentUser: User | null;
  onUserAuthChange: (user: User | null) => void;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({
  leads,
  properties,
  currentUser,
  onUserAuthChange,
}) => {
  const [activeTab, setActiveTab] = useState<'drive' | 'sheets' | 'docs' | 'calendar' | 'gmail' | 'chat' | 'forms'>('drive');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [driveSearch, setDriveSearch] = useState('');

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [tourLeadName, setTourLeadName] = useState(leads[0]?.name || '');
  const [tourPropertyTitle, setTourPropertyTitle] = useState(properties[0]?.title || '');
  const [tourDateTime, setTourDateTime] = useState('');

  // Gmail state
  const [gmailMessages, setGmailMessages] = useState<GmailMessageSummary[]>([]);
  const [emailTo, setEmailTo] = useState(leads[0]?.name ? `${leads[0].name.toLowerCase().replace(/\s+/g, '.')}@investor.com` : 'investor@aura.com');
  const [emailSubject, setEmailSubject] = useState('Confidential: Luxury Real Estate Asset Prospectus & Security Protocol');
  const [emailBody, setEmailBody] = useState(`Dear Investor,\n\nWe have prepared a private briefing package regarding our premier property portfolio featuring Tier-4 biometric infrastructure.\n\nPlease let us know if you wish to arrange a private escort walk-through.`);

  // Chat state
  const [chatSpaces, setChatSpaces] = useState<ChatSpaceItem[]>([]);
  const [selectedChatSpace, setSelectedChatSpace] = useState<string>('');
  const [chatMessageText, setChatMessageText] = useState('🚨 Security Alert: Grand Lobby Turnstile access audit completed with zero anomalies.');

  // Generated URLs
  const [createdUrl, setCreatedUrl] = useState<{ title: string; url: string } | null>(null);

  // Destructive Confirmation Modal State (MANDATORY)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    onConfirm: async () => {},
  });

  // Check if token exists
  useEffect(() => {
    if (currentUser) {
      loadTabData();
    }
  }, [currentUser, activeTab]);

  const loadTabData = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      if (activeTab === 'drive') {
        const files = await listDriveFiles(driveSearch);
        setDriveFiles(files);
      } else if (activeTab === 'calendar') {
        const events = await listCalendarEvents();
        setCalendarEvents(events);
      } else if (activeTab === 'gmail') {
        const messages = await listRecentGmailMessages();
        setGmailMessages(messages);
      } else if (activeTab === 'chat') {
        const spaces = await listChatSpaces();
        setChatSpaces(spaces);
        if (spaces.length > 0 && !selectedChatSpace) {
          setSelectedChatSpace(spaces[0].name);
        }
      }
    } catch (err: any) {
      console.warn(`Error loading ${activeTab} data:`, err);
      setStatusMessage({ text: err.message || `Could not load ${activeTab} data`, type: 'info' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onUserAuthChange(res.user);
        setStatusMessage({ text: `Signed in as ${res.user.email} with full Google Workspace permissions.`, type: 'success' });
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setStatusMessage({ text: err.message || 'Google authentication was not completed.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    onUserAuthChange(null);
    setDriveFiles([]);
    setCalendarEvents([]);
    setGmailMessages([]);
    setStatusMessage({ text: 'Signed out from Google Workspace.', type: 'info' });
  };

  // Google Sheets: Export Leads
  const handleExportToSheets = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const headers = ['Lead Name', 'Headline', 'Company', 'Platform', 'Intent Score', 'Sentiment', 'Target Interest', 'Budget'];
      const rows = leads.map(l => [
        l.name,
        l.headline,
        l.company,
        l.platform.toUpperCase(),
        l.intentScore,
        l.sentiment,
        l.propertyInterest,
        l.budgetRange,
      ]);

      const res = await createLeadsSpreadsheet(
        `AURA Luxury Leads & Asset Matching Pipeline (${new Date().toLocaleDateString()})`,
        headers,
        rows
      );

      setCreatedUrl({ title: 'Google Sheet Created', url: res.url });
      setStatusMessage({ text: 'Successfully created Google Spreadsheet in your Google Drive!', type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to export to Google Sheets', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Docs: Generate Luxury Memorandum
  const handleCreateDoc = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const targetProperty = properties[0];
      const content = `AURA ESTATE & INFRASTRUCTURE INTELLIGENCE\nCONFIDENTIAL INVESTMENT MEMORANDUM\n\nProperty: ${targetProperty.title}\nValuation: ${targetProperty.valuation}\nLocation: ${targetProperty.location}\nArea: ${targetProperty.squareFeet}\nInfrastructure: ${targetProperty.infrastructureRating}\nOccupancy: ${targetProperty.activeOccupancy}%\n\nEXECUTIVE SUMMARY:\nThis document serves as a private memorandum for qualified institutional and high-net-worth buyers.\nThe asset integrates state-of-the-art building infrastructure, dedicated fiber optics, biometric isolation access, and certified perimeter telemetry.\n\nGenerated by AURA Luxury Real Estate Command Suite.\nDate: ${new Date().toLocaleString()}`;

      const res = await createLuxuryInvestmentDoc(
        `AURA Executive Memorandum - ${targetProperty.title}`,
        content
      );

      setCreatedUrl({ title: 'Google Document Created', url: res.url });
      setStatusMessage({ text: 'Successfully generated Google Doc in your Google Drive!', type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to generate Google Doc', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Calendar: Schedule Walk-Through
  const handleScheduleTour = () => {
    const start = tourDateTime ? new Date(tourDateTime).toISOString() : new Date(Date.now() + 86400000).toISOString();
    const end = new Date(new Date(start).getTime() + 3600000).toISOString();

    setConfirmDialog({
      isOpen: true,
      title: 'Schedule VIP Walk-Through on Google Calendar?',
      description: `This will add a private tour appointment with ${tourLeadName || 'VIP Lead'} for "${tourPropertyTitle}" to your primary Google Calendar at ${new Date(start).toLocaleString()}.`,
      confirmText: 'Confirm & Schedule',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await createCalendarTourEvent(
            `VIP Asset Walk-Through: ${tourPropertyTitle}`,
            `Private escort tour with ${tourLeadName}. Building security sweep pre-authorized by Facility Director.`,
            start,
            end,
            tourPropertyTitle
          );
          setStatusMessage({ text: 'Private walk-through scheduled in Google Calendar!', type: 'success' });
          loadTabData();
        } catch (err: any) {
          setStatusMessage({ text: err.message || 'Failed to schedule calendar event', type: 'error' });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  // Gmail: Send Email (Destructive confirmation)
  const handleSendEmail = () => {
    setConfirmDialog({
      isOpen: true,
      title: `Send Email via Gmail to ${emailTo}?`,
      description: `You are about to dispatch an official email from your connected Gmail address with subject "${emailSubject}".`,
      confirmText: 'Confirm & Send Email',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await sendGmailEmail(emailTo, emailSubject, emailBody);
          setStatusMessage({ text: `Email dispatched successfully to ${emailTo}!`, type: 'success' });
        } catch (err: any) {
          setStatusMessage({ text: err.message || 'Failed to send email via Gmail', type: 'error' });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  // Google Drive: Upload File
  const handleUploadDossierToDrive = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const summaryText = JSON.stringify({
        generatedBy: 'AURA Estate & Security Intelligence',
        date: new Date().toISOString(),
        leadsCount: leads.length,
        propertiesCount: properties.length,
        topLeads: leads.slice(0, 3).map(l => ({ name: l.name, company: l.company, score: l.intentScore })),
      }, null, 2);

      await createDriveFile(
        `AURA_Portfolio_Dossier_${Date.now()}.json`,
        summaryText,
        'application/json'
      );
      setStatusMessage({ text: 'Uploaded lead portfolio snapshot directly to your Google Drive!', type: 'success' });
      loadTabData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Drive upload error', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Drive: Delete File (MANDATORY destructive confirmation)
  const handleDeleteDriveFile = (file: DriveFileItem) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete "${file.name}" from Google Drive?`,
      description: 'Are you sure you want to permanently delete this file from your Google Drive? This action cannot be undone.',
      confirmText: 'Delete File',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await deleteDriveFile(file.id);
          setStatusMessage({ text: `Deleted "${file.name}" from Google Drive.`, type: 'success' });
          loadTabData();
        } catch (err: any) {
          setStatusMessage({ text: err.message || 'Failed to delete file', type: 'error' });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  // Google Chat: Send Message
  const handleSendChatMessage = () => {
    if (!selectedChatSpace) {
      setStatusMessage({ text: 'Please select a Google Chat space first.', type: 'error' });
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Post message to Google Chat?',
      description: `This will broadcast the message to the Google Chat space: ${selectedChatSpace}.`,
      confirmText: 'Post Message',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await sendChatMessage(selectedChatSpace, chatMessageText);
          setStatusMessage({ text: 'Message posted to Google Chat space!', type: 'success' });
        } catch (err: any) {
          setStatusMessage({ text: err.message || 'Failed to post message to Google Chat', type: 'error' });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  // Google Forms: Create Form
  const handleCreateForm = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await createInvestorForm(
        'AURA Confidential VIP Investor Intake Questionnaire',
        'Confidential asset acquisition criteria, security requirements, and capital verification.'
      );
      setCreatedUrl({
        title: 'Google Form Created',
        url: res.responderUri || `https://docs.google.com/forms/d/${res.formId}/edit`,
      });
      setStatusMessage({ text: 'Successfully created Google Form in your Google Drive!', type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to create Google Form', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Connection status & Google Authentication */}
      <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c98a]">
              <HardDrive className="w-4 h-4" />
            </span>
            <h2 className="font-serif-luxury text-lg font-bold text-slate-100">
              Google Workspace Command Hub
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Connect your enterprise Google Drive, Gmail, Sheets, Calendar, Docs, Chat, and Forms to power real-time real estate workflows.
          </p>
        </div>

        {/* Official Google Sign-in / Signed-in Profile */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-[#080b12] border border-[#1e2638] rounded-xl p-2.5">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} className="w-9 h-9 rounded-full border border-[#c5a059]" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#c5a059] text-black font-bold flex items-center justify-center text-xs">
                  {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                </div>
              )}
              <div>
                <span className="text-xs font-semibold text-slate-100 block">{currentUser.displayName || 'Connected User'}</span>
                <span className="text-[10px] text-emerald-400 font-tech">{currentUser.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 px-2.5 py-1 text-[11px] bg-[#162033] hover:bg-[#202c46] border border-[#2a3a5a] text-slate-300 rounded-lg cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            /* Official Google Sign-In Button as required */
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="flex items-center gap-3 px-4 py-2 bg-white text-gray-800 hover:bg-gray-100 rounded-lg shadow-md font-semibold text-xs transition-all cursor-pointer border border-gray-300 disabled:opacity-50"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          statusMessage.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
            : statusMessage.type === 'error'
              ? 'bg-rose-950/40 border-rose-800 text-rose-300'
              : 'bg-blue-950/40 border-blue-800 text-blue-300'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {createdUrl && (
        <div className="p-3.5 rounded-xl bg-[#121927] border border-[#c5a059]/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#e5c98a]" />
            <span className="text-xs text-slate-100 font-semibold">{createdUrl.title}:</span>
            <span className="text-xs text-[#e5c98a] truncate max-w-md">{createdUrl.url}</span>
          </div>
          <a
            href={createdUrl.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-[#c5a059] text-black font-semibold text-xs rounded-lg flex items-center gap-1.5 hover:bg-[#d4af37]"
          >
            Open in Google <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Workspace App Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#1e2638] pb-2 no-scrollbar">
        {[
          { id: 'drive', label: 'Google Drive', icon: HardDrive },
          { id: 'sheets', label: 'Google Sheets', icon: Table },
          { id: 'docs', label: 'Google Docs', icon: FileText },
          { id: 'calendar', label: 'Google Calendar', icon: Calendar },
          { id: 'gmail', label: 'Gmail', icon: Mail },
          { id: 'chat', label: 'Google Chat', icon: MessageSquare },
          { id: 'forms', label: 'Google Forms', icon: ClipboardList },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#c5a059] text-black'
                  : 'bg-[#0d121c] border border-[#1e2638] text-slate-300 hover:text-white hover:bg-[#162033]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Panels */}
      {!currentUser ? (
        <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-12 text-center space-y-3">
          <Lock className="w-8 h-8 text-[#c5a059] mx-auto" />
          <h3 className="font-serif-luxury text-base font-bold text-slate-100">
            Authentication Required for Google Workspace
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Please sign in with Google using the button above to access Google Drive, Sheets, Docs, Calendar, Gmail, Chat, and Forms.
          </p>
          <div className="pt-2">
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-white text-gray-800 font-semibold text-xs rounded-lg shadow-md hover:bg-gray-100 inline-flex items-center gap-2"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* TAB 1: GOOGLE DRIVE */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1e2638]">
                  <div>
                    <h3 className="font-serif-luxury text-base font-bold text-slate-100">Google Drive Document Repository</h3>
                    <p className="text-xs text-slate-400">Browse and manage architectural blueprints, contracts, and exported executive dossiers.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUploadDossierToDrive}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-[#c5a059] hover:bg-[#d4af37] text-black font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Upload Portfolio Dossier
                    </button>
                    <button
                      onClick={loadTabData}
                      className="p-1.5 bg-[#162033] hover:bg-[#202c46] border border-[#2a3a5a] text-slate-300 rounded-lg"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Drive Files List */}
                <div className="space-y-2">
                  {driveFiles.map(file => (
                    <div key={file.id} className="p-3 rounded-lg bg-[#080b12] border border-[#1e2638] flex items-center justify-between hover:border-slate-600 transition-all">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#c5a059]" />
                        <div>
                          <span className="text-xs font-semibold text-slate-200 block">{file.name}</span>
                          <span className="text-[10px] text-slate-500 font-tech">{file.mimeType}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#e5c98a] hover:underline flex items-center gap-1"
                          >
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteDriveFile(file)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="Delete from Google Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {driveFiles.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No files found. Click "Upload Portfolio Dossier" to store your first real estate snapshot in Drive.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SHEETS */}
          {activeTab === 'sheets' && (
            <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2638]">
                <div>
                  <h3 className="font-serif-luxury text-base font-bold text-slate-100">Google Sheets Lead Pipeline</h3>
                  <p className="text-xs text-slate-400">Sync all {leads.length} scraped and qualified leads into an editable spreadsheet in Google Sheets.</p>
                </div>
                <button
                  onClick={handleExportToSheets}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 bg-[#c5a059] hover:bg-[#d4af37] text-black font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Table className="w-3.5 h-3.5" /> Export {leads.length} Leads to Sheets
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#080b12] border border-[#1e2638] space-y-2 text-xs">
                <span className="font-semibold text-slate-200 block">Spreadsheet Schema Preview:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 font-tech">
                  <span className="p-2 bg-[#121927] rounded">1. Lead Name</span>
                  <span className="p-2 bg-[#121927] rounded">2. Headline / Role</span>
                  <span className="p-2 bg-[#121927] rounded">3. Social Platform</span>
                  <span className="p-2 bg-[#121927] rounded">4. Intent Score</span>
                  <span className="p-2 bg-[#121927] rounded">5. Sentiment Index</span>
                  <span className="p-2 bg-[#121927] rounded">6. Target Property</span>
                  <span className="p-2 bg-[#121927] rounded">7. Budget Range</span>
                  <span className="p-2 bg-[#121927] rounded">8. Timestamp</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE DOCS */}
          {activeTab === 'docs' && (
            <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2638]">
                <div>
                  <h3 className="font-serif-luxury text-base font-bold text-slate-100">Google Docs Investment Memorandums</h3>
                  <p className="text-xs text-slate-400">Generate executive property acquisition prospectuses in Google Docs formatted for private offices.</p>
                </div>
                <button
                  onClick={handleCreateDoc}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 bg-[#c5a059] hover:bg-[#d4af37] text-black font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" /> Generate Property Memorandum Doc
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#080b12] border border-[#1e2638] space-y-2 text-xs text-slate-300">
                <span className="font-semibold text-slate-200 block">Document Inclusions:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>Architectural specs and asset valuation metrics ({properties[0]?.title})</li>
                  <li>Tier-4 Biometric &amp; Security infrastructure audit summary</li>
                  <li>Confidentiality and off-market acquisition disclaimers</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Form to Schedule */}
              <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-3">
                <h3 className="font-serif-luxury text-base font-bold text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#c5a059]" />
                  Schedule VIP Asset Walk-Through
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Lead / Investor Name</label>
                    <select
                      value={tourLeadName}
                      onChange={(e) => setTourLeadName(e.target.value)}
                      className="w-full p-2 bg-[#080b12] border border-[#1e2638] rounded-lg text-slate-200"
                    >
                      {leads.map(l => (
                        <option key={l.id} value={l.name}>{l.name} ({l.company})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Target Property Asset</label>
                    <select
                      value={tourPropertyTitle}
                      onChange={(e) => setTourPropertyTitle(e.target.value)}
                      className="w-full p-2 bg-[#080b12] border border-[#1e2638] rounded-lg text-slate-200"
                    >
                      {properties.map(p => (
                        <option key={p.id} value={p.title}>{p.title} ({p.city})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Appointment Date &amp; Time</label>
                    <input
                      type="datetime-local"
                      value={tourDateTime}
                      onChange={(e) => setTourDateTime(e.target.value)}
                      className="w-full p-2 bg-[#080b12] border border-[#1e2638] rounded-lg text-slate-200"
                    />
                  </div>

                  <button
                    onClick={handleScheduleTour}
                    className="w-full py-2 bg-[#c5a059] hover:bg-[#d4af37] text-black font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Schedule in Google Calendar
                  </button>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-luxury text-base font-bold text-slate-100">Upcoming Calendar Events</h3>
                  <button onClick={loadTabData} className="text-slate-400 hover:text-white">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {calendarEvents.map(evt => (
                    <div key={evt.id} className="p-3 rounded-lg bg-[#080b12] border border-[#1e2638] text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{evt.summary}</span>
                        {evt.htmlLink && (
                          <a href={evt.htmlLink} target="_blank" rel="noopener noreferrer" className="text-[#e5c98a] text-[10px] flex items-center gap-0.5">
                            View <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {evt.start?.dateTime ? new Date(evt.start.dateTime).toLocaleString() : evt.start?.date}
                      </span>
                    </div>
                  ))}

                  {calendarEvents.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No upcoming appointments found in primary Google Calendar.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: GMAIL */}
          {activeTab === 'gmail' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Compose Email */}
              <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-3">
                <h3 className="font-serif-luxury text-base font-bold text-slate-100 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#c5a059]" />
                  Send Luxury Follow-Up via Gmail
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">To Email Address</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full p-2 bg-[#080b12] border border-[#1e2638] rounded-lg text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full p-2 bg-[#080b12] border border-[#1e2638] rounded-lg text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Message Body</label>
                    <textarea
                      rows={5}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full p-2 bg-[#080b12] border border-[#1e2638] rounded-lg text-slate-200 resize-none font-sans"
                    />
                  </div>

                  <button
                    onClick={handleSendEmail}
                    className="w-full py-2 bg-[#c5a059] hover:bg-[#d4af37] text-black font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Follow-Up via Gmail
                  </button>
                </div>
              </div>

              {/* Recent Inbox Messages */}
              <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-luxury text-base font-bold text-slate-100">Recent Investor Inquiries (Gmail)</h3>
                  <button onClick={loadTabData} className="text-slate-400 hover:text-white">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {gmailMessages.map(msg => (
                    <div key={msg.id} className="p-3 rounded-lg bg-[#080b12] border border-[#1e2638] text-xs">
                      <span className="font-semibold text-slate-200 block truncate">Message #{msg.id.slice(0, 8)}</span>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{msg.snippet}</p>
                    </div>
                  ))}

                  {gmailMessages.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No matching real estate inquiries found in recent Gmail threads.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: GOOGLE CHAT */}
          {activeTab === 'chat' && (
            <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2638]">
                <div>
                  <h3 className="font-serif-luxury text-base font-bold text-slate-100">Google Chat Incident &amp; Deal Broadcast</h3>
                  <p className="text-xs text-slate-400">Post automated building security alerts or newly qualified lead dossiers directly to Google Chat spaces.</p>
                </div>
              </div>

              <div className="space-y-3 max-w-xl text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Target Google Chat Space</label>
                  {chatSpaces.length > 0 ? (
                    <select
                      value={selectedChatSpace}
                      onChange={(e) => setSelectedChatSpace(e.target.value)}
                      className="w-full p-2 bg-[#080b12] border border-[#1e2638] rounded-lg text-slate-200"
                    >
                      {chatSpaces.map(sp => (
                        <option key={sp.name} value={sp.name}>{sp.displayName || sp.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. spaces/AAAA1234..."
                      value={selectedChatSpace}
                      onChange={(e) => setSelectedChatSpace(e.target.value)}
                      className="w-full p-2 bg-[#080b12] border border-[#1e2638] rounded-lg text-slate-200"
                    />
                  )}
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Broadcast Message</label>
                  <textarea
                    rows={3}
                    value={chatMessageText}
                    onChange={(e) => setChatMessageText(e.target.value)}
                    className="w-full p-2 bg-[#080b12] border border-[#1e2638] rounded-lg text-slate-200 resize-none"
                  />
                </div>

                <button
                  onClick={handleSendChatMessage}
                  className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4af37] text-black font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Post to Google Chat Space
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: GOOGLE FORMS */}
          {activeTab === 'forms' && (
            <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2638]">
                <div>
                  <h3 className="font-serif-luxury text-base font-bold text-slate-100">Google Forms Investor Intake &amp; Security Questionnaire</h3>
                  <p className="text-xs text-slate-400">Generate structured investor intake forms and survey responses.</p>
                </div>
                <button
                  onClick={handleCreateForm}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 bg-[#c5a059] hover:bg-[#d4af37] text-black font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <ClipboardList className="w-3.5 h-3.5" /> Generate Investor Intake Form
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#080b12] border border-[#1e2638] space-y-2 text-xs text-slate-300">
                <span className="font-semibold text-slate-200 block">Intake Questions Pre-configured:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>Target capital allocation range ($20M - $200M+)</li>
                  <li>Preferred property classification (Penthouse, Commercial Spire, Mixed-Use)</li>
                  <li>Building security tier requirements (Biometric Gate, Air-gapped fiber, Helipad access)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mandatory Destructive Action Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d121c] border border-amber-600/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-serif-luxury text-base font-bold text-slate-100">{confirmDialog.title}</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmDialog.description}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1e2638]">
              <button
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-3 py-1.5 rounded-lg bg-[#162033] hover:bg-[#202c46] border border-[#2a3a5a] text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                  await confirmDialog.onConfirm();
                }}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold"
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
