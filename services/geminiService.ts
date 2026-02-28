
import { GoogleGenAI, Type } from "@google/genai";
import type { Language, ExtractedEntities, ImageAnalysisResult, MagicOrganizeResult, ArchiveItemSummary } from '../types';

// Per guidelines, initialize once and use the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Model selection strategy
// We use the PRO model for complex reasoning and creativity, and FLASH for speed and multimodal tasks.
const MODELS = {
    FAST: 'gemini-2.5-flash',
    SMART: 'gemini-3-pro-preview',
};

/**
 * Robustly extracts a JSON object or array from a string, handling markdown code blocks
 * and conversational filler text.
 */
const extractJson = (text: string): string => {
    if (!text) return "{}";

    // 1. Try extracting from markdown code blocks (json or just block)
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
        return codeBlockMatch[1];
    }
    
    // 2. Heuristic: Find the widest range of text that starts with {/[ and ends with }/]
    // This handles cases where the model says "Here is the JSON: { ... }"
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    const lastBrace = text.lastIndexOf('}');
    const lastBracket = text.lastIndexOf(']');
    
    let start = -1;
    let end = -1;

    // Determine if we are looking for an object or an array based on which comes first
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

    // 3. Fallback: Return text as-is. If it's invalid, JSON.parse will throw, which is handled by caller.
    return text;
};

// Helper function to handle potential API errors
const generateContentHelper = async (params: any, isJson: boolean = false) => {
    try {
        const response = await ai.models.generateContent(params);
        const text = response.text;

        if (!text) {
             throw new Error('The AI model returned an empty response. This may be due to safety settings or an internal error.');
        }

        if (isJson) {
            return extractJson(text);
        }
        return text.trim();
    } catch (e) {
        console.error("Gemini API call failed:", e);
        if (e instanceof Error) {
            // Provide a more user-friendly error message
            if (e.message.includes('API key not valid')) {
                throw new Error('The Gemini API key is not valid. Please check your configuration.');
            }
            if (e.message.includes('429')) {
                throw new Error('API request limit reached. Please try again later.');
            }
            if (e.message.includes('empty response')) {
                throw e;
            }
        }
        throw new Error('An unexpected error occurred while contacting the AI service.');
    }
};


export const getSummary = async (textContent: string, language: Language, tone: 'simple' | 'detailed' | 'academic'): Promise<string> => {
    const tones = {
        simple: "Provide a brief, easy-to-understand summary, suitable for a general audience.",
        detailed: "Provide a comprehensive and detailed summary, capturing key arguments and nuances.",
        academic: "Provide a formal, academic-style summary, focusing on the core thesis and evidence."
    };

    const systemInstruction = `You are a helpful assistant that summarizes text. The user will provide a block of text. ${tones[tone]} The summary should be in ${language}.`;

    return generateContentHelper({
        model: MODELS.FAST, // Flash is sufficient and faster for summarization
        contents: textContent,
        config: { systemInstruction },
    });
};

export const extractEntities = async (textContent: string, language: Language): Promise<ExtractedEntities> => {
    const systemInstruction = `You are an entity extraction expert. Analyze the text and identify key people, places, organizations, and dates. Respond only with a valid JSON object. The response must be in ${language}.`;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            people: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of names of people mentioned." },
            places: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of cities, countries, or specific locations." },
            organizations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of companies, institutions, or groups." },
            dates: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of specific dates or time periods." }
        },
        required: ["people", "places", "organizations", "dates"]
    };
    
    // Use SMART model (Gemini 3 Pro) for high-fidelity entity recognition and context awareness
    const jsonText = await generateContentHelper({
        model: MODELS.SMART,
        contents: textContent,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
        },
    }, true);

    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini for entity extraction:", jsonText);
        throw new Error("The AI returned an invalid format for entities.");
    }
};

export const answerFromText = async (question: string, context: string, language: Language): Promise<string> => {
    const systemInstruction = `You are a helpful assistant. Answer the user's question based *only* on the provided text context. If the answer is not in the text, say so. Respond in ${language}.`;
    const prompt = `CONTEXT:\n---\n${context}\n---\n\nQUESTION: ${question}`;

    return generateContentHelper({
        model: MODELS.FAST, // Flash is generally good for RAG/Contextual QA on small-medium contexts
        contents: prompt,
        config: { systemInstruction },
    });
};

export const generateStory = async (prompt: string, language: Language): Promise<string> => {
    const systemInstruction = `You are a creative storyteller. Write a short story based on the user's prompt. The story should be in ${language}.`;
    // Use SMART model for maximum creativity, narrative coherence, and style
    return generateContentHelper({
        model: MODELS.SMART,
        contents: prompt,
        config: { systemInstruction },
    });
};

// Generic insight generation function
const generateInsightFromTitles = async (titles: string[], language: Language, topic: string, instruction: string): Promise<string> => {
    const systemInstruction = `You are an expert in ${topic}. Based on the following list of titles, generate ${instruction}. The response should be a single, concise paragraph in ${language}.`;
    const prompt = `TITLES:\n- ${titles.join('\n- ')}`;

    return generateContentHelper({
        model: MODELS.SMART, // Smart model finds deeper, more subtle connections between items
        contents: prompt,
        config: { systemInstruction },
    });
};

export const generateDailyHistoricalEvent = (titles: string[], language: Language) => 
    generateInsightFromTitles(titles, language, 'history', 'a plausible historical event or trend that connects some of these items for "On This Day in History"');

export const generateRetroGamingNote = (titles: string[], language: Language) => 
    generateInsightFromTitles(titles, language, 'retro gaming', 'a compelling note about the significance or shared history of some of these classic games');

export const generateMuseumExhibitConcept = (titles: string[], language: Language) => 
    generateInsightFromTitles(titles, language, 'museum curation', 'a creative concept for a museum exhibit that connects some of these images or artworks');

export const generateFilmDoubleFeatureConcept = (titles: string[], language: Language) => 
    generateInsightFromTitles(titles, language, 'film history', 'an interesting "double feature" pairing from these films and explain the thematic connection');

export const generateRadioShowConcept = (titles: string[], language: Language) => 
    generateInsightFromTitles(titles, language, 'radio programming', 'a concept for a radio show block or segment that incorporates some of these audio titles');

export const analyzeImage = async (base64Data: string, mimeType: string, language: Language): Promise<ImageAnalysisResult> => {
    const systemInstruction = `Analyze the image and provide a one-sentence description and a list of relevant tags. Respond only with a valid JSON object. The response must be in ${language}.`;
    const textPart = { text: "Describe this image and provide relevant tags." };
    const imagePart = { inlineData: { data: base64Data, mimeType } };

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            description: { type: Type.STRING, description: "A single-sentence description of the image." },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 5-10 relevant tags." }
        },
        required: ["description", "tags"]
    };

    const jsonText = await generateContentHelper({
        model: MODELS.FAST, // 2.5-Flash is excellent and fast for standard image understanding
        contents: { parts: [textPart, imagePart] },
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
        },
    }, true);

    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini for image analysis:", jsonText);
        throw new Error("The AI returned an invalid format for the image analysis.");
    }
};

export const askAboutImage = async (base64Data: string, mimeType: string, question: string, language: Language): Promise<string> => {
    const systemInstruction = `You are a helpful assistant answering questions about an image. Respond in ${language}.`;
    const textPart = { text: question };
    const imagePart = { inlineData: { data: base64Data, mimeType } };

    return generateContentHelper({
        model: MODELS.FAST,
        contents: { parts: [textPart, imagePart] },
        config: { systemInstruction },
    });
};

export const organizeLibraryItems = async (items: { title: string; description?: string }[], language: Language): Promise<MagicOrganizeResult> => {
    const systemInstruction = `You are a library organization expert. Based on the list of item titles and descriptions, suggest relevant tags and collection names. Provide a maximum of 5 tags and 3 collections. Respond only with a valid JSON object. The response must be in ${language}.`;
    
    const itemList = items.map(i => `- ${i.title}${i.description ? ` (${i.description})` : ''}`).join('\n');
    const prompt = `Organize these items:\n${itemList}`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of suggested tags." },
            collections: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of suggested collection names." }
        },
        required: ["tags", "collections"]
    };

    // Use SMART model for complex classification logic and taxonomy generation
    const jsonText = await generateContentHelper({
        model: MODELS.SMART,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
        },
    }, true);

    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini for library organization:", jsonText);
        throw new Error("The AI returned an invalid format for organization suggestions.");
    }
};
