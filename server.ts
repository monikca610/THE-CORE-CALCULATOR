import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Endpoint to check AI advisor availability
app.get('/api/advisor/status', (_req: Request, res: Response) => {
  const isAvailable = Boolean(aiClient);
  res.json({
    aiAvailable: isAvailable,
    model: 'gemini-3.8-flash',
    provider: 'Google AI Studio',
  });
});

// Endpoint for AI attendance advisor query
app.post('/api/advisor/chat', async (req: Request, res: Response) => {
  const { prompt, systemInstruction, history } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  if (!aiClient) {
    return res.json({
      mode: 'local',
      text: null,
      message: 'GEMINI_API_KEY is not configured on the server. Falling back to local deterministic rule engine.',
    });
  }

  try {
    // Format conversation history for Gemini if provided
    const contents: any[] = [];

    if (Array.isArray(history)) {
      history.slice(-6).forEach((h: { sender: string; text: string }) => {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction || 'You are an intelligent academic attendance advisor.',
        temperature: 0.2, // Low temperature for high numerical rigor and consistency
      },
    });

    const text = response.text || '';
    return res.json({
      mode: 'ai',
      text: text,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.json({
      mode: 'local',
      text: null,
      error: error?.message || 'Gemini inference failed. Local engine active.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[THE CORE CALCULATOR] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
