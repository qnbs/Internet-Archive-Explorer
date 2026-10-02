import { describe, expect, it } from 'vitest';
import { buildHighlightSegments, findLiteralMatchStarts } from '@/utils/literalTextSearch';

describe('literalTextSearch', () => {
  it('does not treat archive text as HTML when highlighting', () => {
    const hostile = '<img src=x onerror=alert(1)><script>evil</script>';
    const segments = buildHighlightSegments(hostile, 'img');
    const combined = segments.map((s) => s.text).join('');
    expect(combined).toBe(hostile);
    expect(segments.some((s) => s.highlight && s.text === 'img')).toBe(true);
  });

  it('finds case-insensitive literal matches with linear complexity', () => {
    const text = 'Hello hello HELLO';
    expect(findLiteralMatchStarts(text, 'hello')).toEqual([0, 6, 12]);
  });

  it('ignores overly long queries', () => {
    const text = 'abc';
    const longQuery = 'a'.repeat(201);
    expect(findLiteralMatchStarts(text, longQuery)).toEqual([]);
  });
});
