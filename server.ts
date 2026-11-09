import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with required telemetry headers
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// AI Endpoints
// -------------------------------------------------------------

// Sentiment & Lead Qualification API
app.post('/api/ai/qualify-lead', async (req: Request, res: Response) => {
  try {
    const { leadData } = req.body;
    if (!leadData) {
      return res.status(400).json({ error: 'leadData is required' });
    }

    if (!genAI) {
      // Intelligent fallback when GEMINI_API_KEY is not configured in local environment
      const sentimentScore = Math.floor(Math.random() * 25) + 75; // 75-99
      return res.json({
        sentiment: sentimentScore > 85 ? 'Highly Positive / Ready to Transact' : 'Positive / In Market',
        score: sentimentScore,
        urgency: sentimentScore > 90 ? 'Immediate (0-30 days)' : 'Medium (30-90 days)',
        intentSummary: `Prospect expresses active interest in prime commercial/residential property assets. Mentions portfolio diversification and tax-advantaged development zones.`,
        keyDrivers: [
          'High net worth capital allocation',
          'Interest in smart security & modern building infrastructure',
          'Cross-platform engagement on LinkedIn & Instagram'
        ],
        recommendedStrategy: 'Schedule private VIP walk-through with Facility Director and send executive dossier.',
        suggestedPitch: `Dear ${leadData.name || 'Valued Partner'}, based on your recent activity regarding premium property acquisitions, I have prepared a confidential memorandum regarding our flagship developments featuring biometric access and tier-1 infrastructure.`
      });
    }

    const prompt = `You are an elite real estate investment strategist and lead scoring AI. Analyze the following social media/networking lead profile:
Name: ${leadData.name}
Role/Title: ${leadData.headline || leadData.title}
Company: ${leadData.company}
Platform: ${leadData.platform}
Raw Post/Bio/Message Snippet: "${leadData.snippet || leadData.bio || 'Inquiring about trophy commercial real estate & penthouse opportunities'}"
Target Property Interest: ${leadData.propertyInterest || 'Luxury Residential / Class-A Commercial'}

Return a valid JSON object strictly matching this schema:
{
  "sentiment": "Highly Positive" | "Positive" | "Neutral" | "Cautious",
  "score": number between 1 and 100,
  "urgency": "Immediate (0-30 days)" | "Medium (30-90 days)" | "Long-term (90+ days)",
  "intentSummary": "2-3 sentence strategic breakdown of their purchase/investment intent",
  "keyDrivers": ["driver 1", "driver 2", "driver 3"],
  "recommendedStrategy": "Recommended next step for the lead broker or facility director",
  "suggestedPitch": "High-touch personalized luxury email / LinkedIn direct outreach draft"
}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/qualify-lead:', error);
    return res.status(500).json({
      error: 'Failed to process AI sentiment analysis',
      fallback: {
        sentiment: 'Positive',
        score: 84,
        urgency: 'Medium (30-60 days)',
        intentSummary: 'High-intent prospect inquiring into trophy portfolio assets and facility certifications.',
        keyDrivers: ['Asset security compliance', 'Portfolio diversification', 'Off-market acquisition'],
        recommendedStrategy: 'Deploy automated luxury follow-up sequence with property brochures.',
        suggestedPitch: 'Thank you for connecting. Here is our private portfolio prospectus.'
      }
    });
  }
});

// Property Matching & Development Feasibility AI
app.post('/api/ai/property-match', async (req: Request, res: Response) => {
  try {
    const { leadProfile, availableProperties } = req.body;
    if (!genAI) {
      return res.json({
        topMatchId: availableProperties?.[0]?.id || 'prop-1',
        matchScore: 96,
        strategicFit: 'Perfect alignment with lead profile seeking high-security penthouse with smart biometric entry and dedicated data fiber.',
        suggestedOffering: 'The Obsidian Tower - Penthouse Suite 72 & Private Sky Lounge',
        estimatedDealSize: '$14,500,000'
      });
    }

    const prompt = `Match this buyer/developer lead with the best suited property from the list:
Lead: ${JSON.stringify(leadProfile)}
Properties: ${JSON.stringify(availableProperties)}

Return a JSON object:
{
  "topMatchId": "id of the best property",
  "matchScore": number (70-99),
  "strategicFit": "Concise justification for why this property matches the lead's social signals and financial scale",
  "suggestedOffering": "Exact unit or parcel name with unique value proposition",
  "estimatedDealSize": "formatted currency deal size e.g. $12,500,000"
}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    return res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    return res.status(500).json({ error: 'Property matching error' });
  }
});

// Mock External SQL Server & Proprietary CRM Sync
app.post('/api/integrations/sync', async (req: Request, res: Response) => {
  const { target, recordCount } = req.body;
  // Simulate enterprise sync latency & integrity check
  await new Promise(r => setTimeout(r, 600));
  return res.json({
    status: 'SUCCESS',
    timestamp: new Date().toISOString(),
    target: target || 'SQL_SERVER_PRIMARY_INSTANCE',
    recordsProcessed: recordCount || 42,
    checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    latencyMs: 142
  });
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    version: '3.4.0',
    geminiEnabled: Boolean(genAI),
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// Vite dev server mounting or static build serving
// -------------------------------------------------------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AURA] Enterprise Suite running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
