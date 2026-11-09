import { getAccessToken } from './firebase';

// Helper for making authorized requests to Google APIs
async function authFetch(url: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('User not authenticated with Google Workspace. Please sign in.');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorText = await response.text();
    let parsed: any;
    try {
      parsed = JSON.parse(errorText);
    } catch {
      parsed = { message: errorText };
    }
    throw new Error(parsed?.error?.message || parsed?.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// -------------------------------------------------------------
// Google Drive API
// -------------------------------------------------------------
export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  size?: string;
}

export async function listDriveFiles(query = ''): Promise<DriveFileItem[]> {
  const qParam = query 
    ? `&q=${encodeURIComponent(query + ' and trashed = false')}` 
    : '&q=trashed%20%3D%20false';
  const data = await authFetch(
    `https://www.googleapis.com/drive/v3/files?pageSize=15&fields=files(id,name,mimeType,webViewLink,createdTime,size)${qParam}`
  );
  return data.files || [];
}

export async function createDriveFile(name: string, content: string, mimeType = 'text/plain') {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const metadata = {
    name,
    mimeType,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: mimeType }));

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload to Google Drive: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteDriveFile(fileId: string) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to delete file from Google Drive: ${response.statusText}`);
  }
  return true;
}

// -------------------------------------------------------------
// Google Sheets API
// -------------------------------------------------------------
export async function createLeadsSpreadsheet(title: string, headers: string[], rows: any[][]) {
  // 1. Create spreadsheet
  const createRes = await authFetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    body: JSON.stringify({
      properties: { title: title || 'AURA Real Estate Leads Pipeline' },
    }),
  });

  const spreadsheetId = createRes.spreadsheetId;
  const values = [headers, ...rows];

  // 2. Append rows
  await authFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      body: JSON.stringify({ values }),
    }
  );

  return {
    spreadsheetId,
    url: createRes.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

// -------------------------------------------------------------
// Google Docs API
// -------------------------------------------------------------
export async function createLuxuryInvestmentDoc(title: string, bodyText: string) {
  // 1. Create document
  const docRes = await authFetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });

  const documentId = docRes.documentId;

  // 2. Insert text
  if (bodyText) {
    await authFetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: `${bodyText}\n`,
            },
          },
        ],
      }),
    });
  }

  return {
    documentId,
    url: `https://docs.google.com/document/d/${documentId}/edit`,
  };
}

// -------------------------------------------------------------
// Google Calendar API
// -------------------------------------------------------------
export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export async function listCalendarEvents(): Promise<CalendarEventItem[]> {
  const now = new Date().toISOString();
  const data = await authFetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(now)}&maxResults=10&singleEvents=true&orderBy=startTime`
  );
  return data.items || [];
}

export async function createCalendarTourEvent(
  summary: string,
  description: string,
  startDateTime: string,
  endDateTime: string,
  location?: string
) {
  return authFetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    body: JSON.stringify({
      summary,
      description,
      location: location || 'AURA Luxury Property Suite',
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime },
    }),
  });
}

// -------------------------------------------------------------
// Gmail API
// -------------------------------------------------------------
export interface GmailMessageSummary {
  id: string;
  snippet: string;
  threadId: string;
}

export async function listRecentGmailMessages(): Promise<GmailMessageSummary[]> {
  const listData = await authFetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=real%20estate%20OR%20investment%20OR%20security'
  );
  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  // Fetch snippets
  const results: GmailMessageSummary[] = [];
  for (const msg of listData.messages.slice(0, 5)) {
    try {
      const detail = await authFetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=minimal`
      );
      results.push({
        id: msg.id,
        snippet: detail.snippet,
        threadId: detail.threadId,
      });
    } catch {
      results.push({ id: msg.id, snippet: '(Message summary)', threadId: msg.threadId });
    }
  }
  return results;
}

export async function sendGmailEmail(to: string, subject: string, bodyText: string) {
  // Construct RFC 2822 email format and base64url encode
  const emailLines = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    bodyText,
  ];

  const rawMessage = emailLines.join('\r\n');
  const encoded = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return authFetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    body: JSON.stringify({ raw: encoded }),
  });
}

// -------------------------------------------------------------
// Google Chat API
// -------------------------------------------------------------
export interface ChatSpaceItem {
  name: string;
  displayName?: string;
  type?: string;
}

export async function listChatSpaces(): Promise<ChatSpaceItem[]> {
  try {
    const data = await authFetch('https://chat.googleapis.com/v1/spaces?pageSize=10');
    return data.spaces || [];
  } catch (err) {
    console.warn('Could not list Chat spaces:', err);
    return [];
  }
}

export async function sendChatMessage(spaceName: string, text: string) {
  return authFetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

// -------------------------------------------------------------
// Google Forms API
// -------------------------------------------------------------
export async function createInvestorForm(title: string, description: string) {
  return authFetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    body: JSON.stringify({
      info: {
        title,
        description,
        documentTitle: title,
      },
    }),
  });
}
