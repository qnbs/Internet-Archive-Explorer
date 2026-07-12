import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

describe('useOnlineStatus', () => {
  it('returns navigator.onLine initially', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(navigator.onLine);
  });

  it('updates when browser fires online/offline events', () => {
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });
});
