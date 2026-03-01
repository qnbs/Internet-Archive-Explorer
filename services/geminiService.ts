import { GoogleGenAI, Type } from "@google/genai";
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';
import { clearStoredOAuthToken, getValidAccessToken } from '@/services/geminiAuthStorage';
import type {
  Language,
  ExtractedEntities,
  ImageAnalysisResult,
  MagicOrganizeResult,
  ArchiveItemSummary,
} from '@/types';

const MODELS = {
  FAST: 'gemini-2.5-flash',
  SMART: 'gemini-3-pro-preview',
};

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const REQUEST_TIMEOUT_MS = 20000;
const MIN_REQUEST_INTERVAL_MS = 300;

let lastRequestTs = 0;
let aiClient: GoogleGenAI | null = null;
let aiClientKey = '';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const extractJson = (text: string): string => {
  if (!text) return '{}';

  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1];
  }

  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  const lastBrace = text.lastIndexOf('}');
  const lastBracket = text.lastIndexOf(']');

  let start = -1;
  let end = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    if (lastBrace > firstBrace) {
      start = firstBrace;
      end = lastBrace + 1;
    }
  } else if (firstBracket !== -1) {
    if (lastBracket > firstBracket) {
      start = firstBracket;
      end = lastBracket + 1;
    }
  }

  if (start !== -1 && end !== -1) {
    return text.substring(start, end);
  }

  return text;
};

const normalizeContents = (contents: any) => {
  if (typeof contents === 'string') {
    return [{ role: 'user', parts: [{ text: contents }] }];
  }

  if (Array.isArray(contents)) {
    return contents;
  }

  if (contents && typeof contents === 'object' && Array.isArray(contents.parts)) {
    return [{ role: 'user', parts: contents.parts }];
  }

  return [{ role: 'user', parts: [{ text: String(contents ?? '') }] }];
};

const parseGeminiText = (responseJson: any): string => {
  const parts = responseJson?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map((part: any) => part?.text ?? '').join('');
};

const getApiKey = (): string => {
  if (typeof window === 'undefined') return '';
  const sessionKey = sessionStorage.getItem('gemini_api_key') || '';
  const legacyLocalKey = localStorage.getItem('gemini_api_key') || '';
  if (!sessionKey && legacyLocalKey) {
    sessionStorage.setItem('gemini_api_key', legacyLocalKey);
    localStorage.removeItem('gemini_api_key');
  }
  const envKey = (import.meta as ImportMeta & { env?: { VITE_API_KEY?: string } }).env?.VITE_API_KEY || '';
  return sessionKey || legacyLocalKey || envKey;
};

const getAiClient = (): GoogleGenAI => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('Bitte API-Key eingeben oder mit Google anmelden');
  }

  if (aiClient && aiClientKey === apiKey) {
    return aiClient;
  }

  aiClient = new GoogleGenAI({ apiKey });
  aiClientKey = apiKey;
  return aiClient;
};

export async function generateContent(params: any, accessToken?: string): Promise<string> {
  const sinceLast = Date.now() - lastRequestTs;
  if (sinceLast < MIN_REQUEST_INTERVAL_MS) {
    await sleep(MIN_REQUEST_INTERVAL_MS - sinceLast);
  }

  const token = accessToken ?? getValidAccessToken();

  if (token) {
    const endpoint = `${GEMINI_API_BASE}/models/${encodeURIComponent(params.model)}:generateContent`;
    const body = {
      contents: normalizeContents(params.contents),
      ...(params.config?.systemInstruction
        ? {
            systemInstruction:
              typeof params.config.systemInstruction === 'string'
                ? { parts: [{ text: params.config.systemInstruction }] }
                : params.config.systemInstruction,
          }
        : {}),
      ...(params.config
        ? {
            generationConfig: {
              responseMimeType: params.config.responseMimeType,
              responseSchema: params.config.responseSchema,
              temperature: params.config.temperature,
              topP: params.config.topP,
              topK: params.config.topK,
              maxOutputTokens: params.config.maxOutputTokens,
            },
          }
        : {}),
    };

    for (let attempt = 0; attempt < 3; attempt += 1) {
      lastRequestTs = Date.now();

      const response = await fetchWithTimeout(
        endpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
        REQUEST_TIMEOUT_MS
      );

      if (response.status === 401 || response.status === 403) {
        clearStoredOAuthToken();
        throw new Error('Sitzung abgelaufen. Bitte erneut anmelden.');
      }

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get('Retry-After') ?? '1');
        await sleep(Math.min(5000, Math.max(1000, retryAfter * 1000)));
        continue;
      }

      if (!response.ok) {
        throw new Error('Gemini-Aufruf fehlgeschlagen.');
      }

      const json = await response.json();
      const text = parseGeminiText(json);
      if (!text) {
        throw new Error('Leere Antwort von Gemini.');
      }

      return text;
    }

    throw new Error('Gemini-Aufruf fehlgeschlagen (Rate-Limit).');
  }

  const response = await getAiClient().models.generateContent(params);
  const text = response.text;
  if (!text) {
    throw new Error('The AI model returned an empty response.');
  }

  return text.trim();
}

const generateContentHelper = async (params: any, isJson: boolean = false) => {
  try {
    const text = await generateContent(params);
    return isJson ? extractJson(text) : text;
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.includes('429')) {
        throw new Error('API request limit reached. Please try again later.');
      }
      throw e;
    }

    throw new Error('An unexpected error occurred while contacting the AI service.');
  }
};

export const getSummary = async (
  textContent: string,
  language: Language,
  tone: 'simple' | 'detailed' | 'academic'
): Promise<string> => {
  const tones = {
    simple: 'Provide a brief, easy-to-understand summary, suitable for a general audience.',
    detailed: 'Provide a comprehensive and detailed summary, capturing key arguments and nuances.',
    academic: 'Provide a formal, academic-style summary, focusing on the core thesis and evidence.',
  };

  const systemInstruction = `You are a helpful assistant that summarizes text. The user will provide a block of text. ${tones[tone]} The summary should be in ${language}.`;

  return generateContentHelper({
    model: MODELS.FAST,
    contents: textContent,
    config: { systemInstruction },
  });
};

export const extractEntities = async (textContent: string, language: Language): Promise<ExtractedEntities> => {
  const systemInstruction = `You are an entity extraction expert. Analyze the text and identify key people, places, organizations, and dates. Respond only with a valid JSON object. The response must be in ${language}.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      people: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of names of people mentioned.' },
      places: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of cities, countries, or specific locations.' },
      organizations: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of companies, institutions, or groups.' },
      dates: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of specific dates or time periods.' },
    },
    required: ['people', 'places', 'organizations', 'dates'],
  };

  const jsonText = await generateContentHelper(
    {
      model: MODELS.SMART,
      contents: textContent,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
      },
    },
    true
  );

  try {
    return JSON.parse(jsonText);
  } catch {
    throw new Error('The AI returned an invalid format for entities.');
  }
};

export const answerFromText = async (question: string, context: string, language: Language): Promise<string> => {
  const systemInstruction = `You are a helpful assistant. Answer the user's question based *only* on the provided text context. If the answer is not in the text, say so. Respond in ${language}.`;
  const prompt = `CONTEXT:\n---\n${context}\n---\n\nQUESTION: ${question}`;

  return generateContentHelper({
    model: MODELS.FAST,
    contents: prompt,
    config: { systemInstruction },
  });
};

export const generateStory = async (prompt: string, language: Language): Promise<string> => {
  const systemInstruction = `You are a creative storyteller. Write a short story based on the user's prompt. The story should be in ${language}.`;

  return generateContentHelper({
    model: MODELS.SMART,
    contents: prompt,
    config: { systemInstruction },
  });
};

const generateInsightFromTitles = async (
  titles: string[],
  language: Language,
  topic: string,
  instruction: string
): Promise<string> => {
  const systemInstruction = `You are an expert in ${topic}. Based on the following list of titles, generate ${instruction}. The response should be a single, concise paragraph in ${language}.`;
  const prompt = `TITLES:\n- ${titles.join('\n- ')}`;

  return generateContentHelper({
    model: MODELS.SMART,
    contents: prompt,
    config: { systemInstruction },
  });
};

export const generateDailyHistoricalEvent = (titles: string[], language: Language) =>
  generateInsightFromTitles(
    titles,
    language,
    'history',
    'a plausible historical event or trend that connects some of these items for "On This Day in History"'
  );

export const generateRetroGamingNote = (titles: string[], language: Language) =>
  generateInsightFromTitles(
    titles,
    language,
    'retro gaming',
    'a compelling note about the significance or shared history of some of these classic games'
  );

export const generateMuseumExhibitConcept = (titles: string[], language: Language) =>
  generateInsightFromTitles(
    titles,
    language,
    'museum curation',
    'a creative concept for a museum exhibit that connects some of these images or artworks'
  );

export const generateFilmDoubleFeatureConcept = (titles: string[], language: Language) =>
  generateInsightFromTitles(
    titles,
    language,
    'film history',
    'an interesting "double feature" pairing from these films and explain the thematic connection'
  );

export const generateRadioShowConcept = (titles: string[], language: Language) =>
  generateInsightFromTitles(
    titles,
    language,
    'radio programming',
    'a concept for a radio show block or segment that incorporates some of these audio titles'
  );

export const analyzeImage = async (
  base64Data: string,
  mimeType: string,
  language: Language
): Promise<ImageAnalysisResult> => {
  const systemInstruction = `Analyze the image and provide a one-sentence description and a list of relevant tags. Respond only with a valid JSON object. The response must be in ${language}.`;
  const textPart = { text: 'Describe this image and provide relevant tags.' };
  const imagePart = { inlineData: { data: base64Data, mimeType } };

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      description: { type: Type.STRING, description: 'A single-sentence description of the image.' },
      tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 5-10 relevant tags.' },
    },
    required: ['description', 'tags'],
  };

  const jsonText = await generateContentHelper(
    {
      model: MODELS.FAST,
      contents: { parts: [textPart, imagePart] },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
      },
    },
    true
  );

  try {
    return JSON.parse(jsonText);
  } catch {
    throw new Error('The AI returned an invalid format for the image analysis.');
  }
};

export const askAboutImage = async (
  base64Data: string,
  mimeType: string,
  question: string,
  language: Language
): Promise<string> => {
  const systemInstruction = `You are a helpful assistant answering questions about an image. Respond in ${language}.`;
  const textPart = { text: question };
  const imagePart = { inlineData: { data: base64Data, mimeType } };

  return generateContentHelper({
    model: MODELS.FAST,
    contents: { parts: [textPart, imagePart] },
    config: { systemInstruction },
  });
};

export const organizeLibraryItems = async (
  items: { title: string; description?: string }[],
  language: Language
): Promise<MagicOrganizeResult> => {
  const systemInstruction = `You are a library organization expert. Based on the list of item titles and descriptions, suggest relevant tags and collection names. Provide a maximum of 5 tags and 3 collections. Respond only with a valid JSON object. The response must be in ${language}.`;

  const itemList = items.map(item => `- ${item.title}${item.description ? ` (${item.description})` : ''}`).join('\n');
  const prompt = `Organize these items:\n${itemList}`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of suggested tags.' },
      collections: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of suggested collection names.' },
    },
    required: ['tags', 'collections'],
  };

  const jsonText = await generateContentHelper(
    {
      model: MODELS.SMART,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
      },
    },
    true
  );

  try {
    return JSON.parse(jsonText);
  } catch {
    throw new Error('The AI returned an invalid format for organization suggestions.');
  }
};
