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

type SummaryTone = 'simple' | 'detailed' | 'academic';

const summaryPrompts: Record<Language, Record<SummaryTone, string>> = {
    de: {
        simple: "Fasse den folgenden Text sehr einfach und klar in wenigen Sätzen zusammen. Verwende leicht verständliche Sprache, die für jeden zugänglich ist. Gib nur die Zusammenfassung zurück.",
        detailed: "Fasse den folgenden Text prägnant und verständlich für ein allgemeines Publikum zusammen. Konzentriere dich auf die Hauptthemen, wichtigsten Argumente und Schlussfolgerungen. Die Zusammenfassung sollte auf Deutsch sein. Gib nur die Zusammenfassung zurück.",
        academic: "Erstelle eine formelle, akademische Zusammenfassung des folgenden Textes. Identifiziere die Kernthese, die methodische Herangehensweise (falls vorhanden) und die wesentlichen Ergebnisse oder Schlussfolgerungen. Verwende eine präzise und sachliche Sprache. Gib nur die Zusammenfassung zurück."
    },
    en: {
        simple: "Summarize the following text very simply and clearly in a few sentences. Use easy-to-understand language accessible to everyone. Return only the summary.",
        detailed: "Summarize the following text concisely and understandably for a general audience. Focus on the main topics, key arguments, and conclusions. The summary should be in English. Return only the summary.",
        academic: "Provide a formal, academic summary of the following text. Identify the core thesis, methodological approach (if any), and the main findings or conclusions. Use precise and objective language. Return only the summary."
    }
};


const entityPrompts: Record<Language, string> = {
    de: "Extrahiere aus dem folgenden Text wichtige benannte Entitäten. Identifiziere Personen, Orte, Organisationen und Daten. Gib nur die Entitäten zurück, die explizit im Text genannt werden.",
    en: "Extract key named entities from the following text. Identify people, places, organizations, and dates. Return only the entities explicitly mentioned in the text."
};

const storytellerPrompts: Record<Language, string> = {
    de: "Du bist ein kreativer Geschichtenerzähler. Schreibe eine kurze, spannende Geschichte für ein allgemeines Publikum über das vom Benutzer angegebene Thema. Die Geschichte sollte vom Geist des Internet Archive inspiriert sein und möglicherweise alte Bücher, vergessene Filme oder historische Entdeckungen erwähnen. Die Geschichte sollte fesselnd und gut geschrieben sein. Gib nur die Geschichte zurück.",
    en: "You are a creative storyteller. Write a short, exciting story for a general audience about the user-provided topic. The story should be inspired by the spirit of the Internet Archive, perhaps mentioning old books, forgotten films, or historical discoveries. The story should be engaging and well-written. Return only the story."
};

const answerPrompts: Record<Language, string> = {
    de: "Du bist ein fachkundiger Rechercheassistent. Deine Aufgabe ist es, die Frage des Benutzers ausschließlich auf der Grundlage des bereitgestellten Textes zu beantworten. Verwende kein externes Wissen oder Annahmen. Wenn die Antwort nicht im Text zu finden ist, musst du angeben, dass die Information im bereitgestellten Dokument nicht verfügbar ist.",
    en: "You are an expert research assistant. Your task is to answer the user's question based *only* on the provided text. Do not use any external knowledge or make assumptions. If the answer cannot be found in the text, you must state that the information is not available in the provided document."
};


/**
 * Generates a concise summary of a given text using the Gemini API.
 * @param text The text to summarize.
 * @param lang The language for the summary prompt.
 * @param tone The desired tone for the summary.
 * @returns A promise that resolves to the summary string.
 */
export const getSummary = async (text: string, lang: Language = 'en', tone: SummaryTone = 'detailed'): Promise<string> => {
  const maxLength = 25000;
  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: truncatedText,
      config: {
        systemInstruction: summaryPrompts[lang][tone],
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

/**
 * Generates a short story based on a user-provided topic.
 * @param topic The topic for the story.
 * @param lang The language for the story.
 * @returns A promise that resolves to the story string.
 */
export const generateStory = async (topic: string, lang: Language = 'en'): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: topic,
            config: {
                systemInstruction: storytellerPrompts[lang],
                temperature: 0.8,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating story with Gemini API:", error);
        if (lang === 'de') {
            throw new Error("Die Geschichte konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.");
        }
        throw new Error("The story could not be created. Please try again later.");
    }
};

/**
 * Answers a question based on the provided text context.
 * @param question The user's question.
 * @param contextText The text from which to find the answer.
 * @param lang The language for the prompt.
 * @returns A promise that resolves to the answer string.
 */
export const answerFromText = async (question: string, contextText: string, lang: Language = 'en'): Promise<string> => {
    const maxLength = 25000;
    const truncatedText = contextText.length > maxLength ? contextText.substring(0, maxLength) + "..." : contextText;

    const fullPrompt = `CONTEXT:
---
${truncatedText}
---
QUESTION: ${question}`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: fullPrompt,
            config: {
                systemInstruction: answerPrompts[lang],
                temperature: 0.2,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error answering question with Gemini API:", error);
        if (lang === 'de') {
            throw new Error("Die Antwort konnte nicht generiert werden. Bitte versuchen Sie es später erneut.");
        }
        throw new Error("The answer could not be generated. Please try again later.");
    }
};