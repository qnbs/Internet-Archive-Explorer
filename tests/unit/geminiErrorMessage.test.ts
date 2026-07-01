import { describe, expect, it } from 'vitest';
import { GeminiServiceError } from '@/services/geminiService';
import { formatGeminiError, isGeminiNoKeyError } from '@/utils/geminiErrorMessage';

const t = (key: string) => key;

describe('geminiErrorMessage', () => {
  it('maps NO_API_KEY to settings i18n key', () => {
    const err = new GeminiServiceError('x', 'NO_API_KEY', 'settings:apiKey.noKeyConfigured');
    expect(formatGeminiError(err, t)).toBe('settings:apiKey.noKeyConfigured');
    expect(isGeminiNoKeyError(err)).toBe(true);
  });

  it('falls back to error message for generic Error', () => {
    expect(formatGeminiError(new Error('network down'), t)).toBe('network down');
  });

  it('falls back to common:error for unknown values', () => {
    expect(formatGeminiError('oops', t)).toBe('common:error');
  });
});
