import { describe, expect, it } from 'vitest';
import { resolveToastMessage } from '@/utils/resolveToastMessage';

describe('resolveToastMessage', () => {
  const t = (key: string, params?: Record<string, string | number>) => {
    if (key === 'scriptorium:toast.worksetCreated' && params?.name) {
      return `Workset '${params.name}' created!`;
    }
    return key;
  };

  it('resolves i18nKey with params', () => {
    expect(
      resolveToastMessage(
        {
          type: 'success',
          i18nKey: 'scriptorium:toast.worksetCreated',
          i18nParams: { name: 'Research' },
        },
        t,
      ),
    ).toBe("Workset 'Research' created!");
  });

  it('falls back to raw message', () => {
    expect(resolveToastMessage({ type: 'info', message: 'Hello' }, t)).toBe('Hello');
  });
});
