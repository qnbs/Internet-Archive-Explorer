
import { GoogleGenAI, Type } from "@google/genai";
import type { Language, ExtractedEntities, ImageAnalysisResult, MagicOrganizeResult, ArchiveItemSummary } from '../types';

// Per guidelines, initialize once and use the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

// Helper function to handle potential API errors
const generateContentHelper = async (params: any, isJson: boolean = false) => {
    try {
        const response = await ai.models.generateContent(params);
        // The .text property is the correct way to access the response content.
        const text = response.text;
        if (isJson) {
            // Ensure the extracted text is a valid JSON string before returning.
            return text.trim().replace(/```json/g, '').replace(/```/g, '');
        }
        return text;
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
        model,
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
    
    const jsonText = await generateContentHelper({
        model,
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
        model,
        contents: prompt,
        config: { systemInstruction },
    });
};

export const generateStory = async (prompt: string, language: Language): Promise<string> => {
    const systemInstruction = `You are a creative storyteller. Write a short story based on the user's prompt. The story should be in ${language}.`;
    return generateContentHelper({
        model,
        contents: prompt,
        config: { systemInstruction },
    });
};

// Generic insight generation function
const generateInsightFromTitles = async (titles: string[], language: Language, topic: string, instruction: string): Promise<string> => {
    const systemInstruction = `You are an expert in ${topic}. Based on the following list of titles, generate ${instruction}. The response should be a single, concise paragraph in ${language}.`;
    const prompt = `TITLES:\n- ${titles.join('\n- ')}`;

    return generateContentHelper({
        model,
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
        model,
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
        model,
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

    const jsonText = await generateContentHelper({
        model,
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
