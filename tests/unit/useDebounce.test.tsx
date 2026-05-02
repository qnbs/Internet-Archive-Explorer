import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('a', 300));
    expect(result.current).toBe('a');
  });

  it('updates after delay when value changes', async () => {
    const { result, rerender } = renderHook(
      ({ v, d }: { v: string; d: number }) => useDebounce(v, d),
      { initialProps: { v: 'first', d: 60 } },
    );

    expect(result.current).toBe('first');

    rerender({ v: 'second', d: 60 });
    expect(result.current).toBe('first');

    await waitFor(() => expect(result.current).toBe('second'), { timeout: 400 });
  });
});
