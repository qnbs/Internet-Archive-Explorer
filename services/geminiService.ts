import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { ExtractedEntities, Language } from '../types';

// SECURITY WARNING: This application uses a client-side API key.
// In a production environment, this is insecure as the key is exposed to end-users.
// For a real-world application, all API calls to the Gemini API should be proxied
// through a secure backend server that holds the API key as a secret.

// This is a placeholder for a real-world scenario where the API key is expected
// to be set in the execution environment (e.g., as a secret).
if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not function correctly.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const model = "gemini-2.5-flash";

const summaryPrompts: Record<Language, string> = {
    de: "Fasse den folgenden Text prägnant und verständlich für ein allgemeines Publikum zusammen. Konzentriere dich auf die Hauptthemen und wichtigsten Informationen. Die Zusammenfassung sollte auf Deutsch sein.",
    en: "Summarize the following text concisely and understandably for a general audience. Focus on the main topics and most important information. The summary should be in English."
};

const entityPrompts: Record<Language, string> = {
    de: "Extrahiere aus dem folgenden Text wichtige benannte Entitäten. Identifiziere Personen, Orte, Organisationen und Daten. Gib nur die Entitäten zurück, die explizit im Text genannt werden.",
    en: "Extract key named entities from the following text. Identify people, places, organizations, and dates. Return only the entities explicitly mentioned in the text."
}


/**
 * Generates a concise summary of a given text using the Gemini API.
 * @param text The text to summarize.
 * @param lang The language for the summary prompt.
 * @returns A promise that resolves to the summary string.
 */
export const getSummary = async (text: string, lang: Language = 'en'): Promise<string> => {
  const maxLength = 25000;
  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: truncatedText,
      config: {
        systemInstruction: summaryPrompts[lang],
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating summary with Gemini API:", error);
    if (lang === 'de') {
        throw new Error("Die KI-Zusammenfassung konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.");
    }
    throw new Error("The AI summary could not be created. Please try again later.");
  }
};

const entitiesSchema = {
  type: Type.OBJECT,
  properties: {
    people: {
      type: Type.ARRAY,
      description: "List of names of people mentioned.",
      items: { type: Type.STRING }
    },
    places: {
      type: Type.ARRAY,
      description: "List of names of locations, cities, or countries mentioned.",
      items: { type: Type.STRING }
    },
    organizations: {
      type: Type.ARRAY,
      description: "List of names of companies, governments, or other organizations mentioned.",
      items: { type: Type.STRING }
    },
    dates: {
      type: Type.ARRAY,
      description: "List of specific dates or time periods mentioned.",
      items: { type: Type.STRING }
    },
  },
  required: ["people", "places", "organizations", "dates"],
};

/**
 * Extracts key entities from a text using the Gemini API.
 * @param text The text to analyze.
 * @param lang The language for the entity extraction prompt.
 * @returns A promise that resolves to an object containing lists of entities.
 */
export const extractEntities = async (text: string, lang: Language = 'en'): Promise<ExtractedEntities> => {
  const maxLength = 25000;
  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: truncatedText,
      config: {
        systemInstruction: entityPrompts[lang],
        responseMimeType: "application/json",
        responseSchema: entitiesSchema,
      },
    });

    const jsonString = response.text;
    const parsedJson = JSON.parse(jsonString);
    
    return {
      people: parsedJson.people || [],
      places: parsedJson.places || [],
      organizations: parsedJson.organizations || [],
      dates: parsedJson.dates || [],
    };

  } catch (error) {
    console.error("Error extracting entities with Gemini API:", error);
    if (lang === 'de') {
        throw new Error("Die Entitäten konnten nicht extrahiert werden. Bitte versuchen Sie es später erneut.");
    }
    throw new Error("Entities could not be extracted. Please try again later.");
  }
};