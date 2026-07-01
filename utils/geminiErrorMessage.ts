import { GeminiServiceError } from '@/services/geminiService';

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

const GEMINI_ERROR_KEYS: Partial<Record<GeminiServiceError['code'], string>> = {
  NO_API_KEY: 'settings:apiKey.noKeyConfigured',
  INVALID_KEY: 'settings:apiKey.invalidFormat',
  RATE_LIMIT: 'common:serviceErrors.geminiRateLimit',
  QUOTA: 'common:serviceErrors.geminiQuota',
  NETWORK: 'common:serviceErrors.geminiNetwork',
  AUTH: 'common:serviceErrors.geminiAuth',
  VALIDATION: 'common:serviceErrors.geminiValidation',
};

export const isGeminiNoKeyError = (error: unknown): boolean =>
  error instanceof GeminiServiceError && error.code === 'NO_API_KEY';

export const formatGeminiError = (error: unknown, t: TranslateFn): string => {
  if (error instanceof GeminiServiceError) {
    const key = error.i18nKey ?? GEMINI_ERROR_KEYS[error.code];
    if (key) return t(key);
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return t('common:error');
};
