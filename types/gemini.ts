export interface GeminiInlineData {
  data: string;
  mimeType: string;
}

export interface GeminiPart {
  text?: string;
  inlineData?: GeminiInlineData;
}

export interface GeminiContent {
  role?: 'user' | 'model' | 'system';
  parts: GeminiPart[];
}

export interface GeminiSystemInstruction {
  parts: GeminiPart[];
}

export interface GeminiGenerationConfig {
  systemInstruction?: string | GeminiSystemInstruction;
  responseMimeType?: string;
  responseSchema?: unknown;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
}

export interface GeminiGenerateParams {
  model: string;
  contents: string | GeminiContent[] | { parts: GeminiPart[] };
  config?: GeminiGenerationConfig;
}

export interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
}
