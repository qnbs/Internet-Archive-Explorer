import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { ExtractedEntities, ImageAnalysisResult } from '../types';

// Initialize the Google Gemini API client
// The API key is sourced from environment variables, as per guidelines.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

class GeminiServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiServiceError';
  }
}

/**
 * A helper function to call the Gemini API and handle errors.
 * @param {string} prompt - The text prompt to send to the model.
 * @returns {Promise<string>} The generated text response.
 */
const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error('Gemini API request failed:', error);
        throw new GeminiServiceError('Failed to get a response from the AI. Please try again.');
    }
};

/**
 * Generates a summary for a given text, with a specified tone.
 */
export const getSummary = async (text: string, language: string, tone: 'simple' | 'detailed' | 'academic'): Promise<string> => {
    const systemInstruction = `You are a helpful assistant. Summarize the following text in a ${tone} tone. The summary should be in ${language}.`;
    const prompt = `Please summarize the following text:\n\n---\n\n${text}`;
    return generateText(prompt, systemInstruction);
};

/**
 * Extracts named entities (people, places, organizations, dates) from a text.
 */
export const extractEntities = async (text: string, language: string): Promise<ExtractedEntities> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            people: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Names of individuals.' },
            places: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Geographical locations like cities, countries.' },
            organizations: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Companies, institutions, groups.' },
            dates: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Specific dates or time periods mentioned.' },
        },
        required: ['people', 'places', 'organizations', 'dates']
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Extract the key named entities (people, places, organizations, dates) from the following text. The response should be in ${language}.\n\nTEXT: "${text}"`,
            config: {
              responseMimeType: "application/json",
              responseSchema: schema,
            },
        });
        
        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        // Ensure all properties are arrays, even if empty.
        return {
            people: parsed.people || [],
            places: parsed.places || [],
            organizations: parsed.organizations || [],
            dates: parsed.dates || [],
        };
    } catch (error) {
        console.error('Gemini API entity extraction failed:', error);
        throw new GeminiServiceError('Failed to extract entities from the text.');
    }
};

/**
 * Answers a question based on a provided text context.
 */
export const answerFromText = async (question: string, context: string, language: string): Promise<string> => {
    const systemInstruction = `You are an expert at answering questions based on a given text. Answer the user's question using only the information from the provided context. Answer in ${language}.`;
    const prompt = `CONTEXT:\n---\n${context}\n---\n\nQUESTION: ${question}`;
    return generateText(prompt, systemInstruction);
};

/**
 * Generates a short, creative story based on a user's prompt.
 */
export const generateStory = async (prompt: string, language: string): Promise<string> => {
    const systemInstruction = `You are a creative storyteller. Write a short, engaging story based on the user's prompt. Write the story in ${language}.`;
    return generateText(prompt, systemInstruction);
};

/**
 * Generates a fictional historical event summary based on a list of trending item titles.
 */
export const generateDailyHistoricalEvent = async (titles: string[], language: string): Promise<string> => {
    const systemInstruction = `You are a creative historian. Based on the following list of item titles, invent a plausible or interesting historical event that connects some of them. Be brief (2-3 sentences) and engaging. Write in ${language}.`;
    const prompt = `Item Titles: ${titles.join(', ')}. \n\nWhat interesting historical connection can you invent?`;
    return generateText(prompt, systemInstruction);
};

/**
 * Suggests tags and collections for a list of library items.
 */
export const organizeLibraryItems = async (items: { title: string; description?: string }[], language: string): Promise<{ tags: string[]; collections: string[] }> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'A list of 5-7 relevant, single-word or short-phrase tags for these items.'
            },
            collections: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'A list of 2-3 potential collection names these items could belong to.'
            },
        },
        required: ['tags', 'collections']
    };
    
    const itemList = items.map(item => `- ${item.title}`).join('\n');

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze this list of library items and suggest relevant tags and collection names. The response should be in ${language}.\n\nITEMS:\n${itemList}`,
            config: {
              responseMimeType: "application/json",
              responseSchema: schema,
            },
        });
        
        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        return {
            tags: parsed.tags || [],
            collections: parsed.collections || [],
        };
    } catch (error) {
        console.error('Gemini API organization failed:', error);
        throw new GeminiServiceError('Failed to get organizational suggestions.');
    }
};

/**
 * Analyzes an image and returns a description and relevant tags.
 */
export const analyzeImage = async (base64ImageData: string, mimeType: string, language: string): Promise<ImageAnalysisResult> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            description: { type: Type.STRING, description: 'A detailed, objective description of the image content, focusing on facts.' },
            tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'A list of 5-7 relevant, specific keywords or tags based on the image content (e.g., "astronaut", "lunar module", "space suit").'
            },
        },
        required: ['description', 'tags']
    };

    const imagePart = { inlineData: { data: base64ImageData, mimeType } };
    const textPart = { text: `Analyze this image. Provide a detailed description and suggest relevant search tags. Respond in ${language}.` };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const parsed = JSON.parse(response.text.trim());
        return {
            description: parsed.description || '',
            tags: parsed.tags || [],
        };
    } catch (error) {
        console.error('Gemini API image analysis failed:', error);
        throw new GeminiServiceError('Failed to get an analysis from the AI.');
    }
};

/**
 * Asks a follow-up question about an image.
 */
export const askAboutImage = async (base64ImageData: string, mimeType: string, question: string, language: string): Promise<string> => {
    const imagePart = { inlineData: { data: base64ImageData, mimeType } };
    const textPart = { text: question };
    const systemInstruction = `You are an expert at analyzing images. Answer the user's question about the image concisely. Respond in ${language}.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error('Gemini API image question failed:', error);
        throw new GeminiServiceError('Failed to get an answer about the image.');
    }
};