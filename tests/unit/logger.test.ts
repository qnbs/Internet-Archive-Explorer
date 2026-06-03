import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const noop = () => {
  /* silenced in tests */
};

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(noop);
    vi.spyOn(console, 'warn').mockImplementation(noop);
    vi.spyOn(console, 'debug').mockImplementation(noop);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('always forwards errors to console.error', async () => {
    const { logger } = await import('@/utils/logger');
    logger.error('fail');
    expect(console.error).toHaveBeenCalledWith('fail');
  });

  it('suppresses warn in production without VITE_DEBUG_LOGS', async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_DEBUG_LOGS', '');
    const { logger } = await import('@/utils/logger');
    logger.warn('quiet');
    expect(console.warn).not.toHaveBeenCalled();
  });
});
