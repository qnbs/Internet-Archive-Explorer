export interface TextHighlightSegment {
  text: string;
  highlight: boolean;
  /** Start offset in the original string (for scroll-to-match). */
  start: number;
}

const MAX_LITERAL_QUERY_LENGTH = 200;

const slicesMatchCaseInsensitive = (textSlice: string, query: string): boolean =>
  textSlice.localeCompare(query, undefined, { sensitivity: 'accent' }) === 0;

/** Case-insensitive literal search indices aligned to the original UTF-16 string. */
export function findLiteralMatchStarts(text: string, query: string): number[] {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length > MAX_LITERAL_QUERY_LENGTH) {
    return [];
  }

  const qLen = trimmed.length;
  const indices: number[] = [];

  for (let i = 0; i <= text.length - qLen; i += 1) {
    const slice = text.slice(i, i + qLen);
    if (slicesMatchCaseInsensitive(slice, trimmed)) {
      indices.push(i);
      i += qLen - 1;
    }
  }

  return indices;
}

export function buildHighlightSegments(text: string, query: string): TextHighlightSegment[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [{ text, highlight: false, start: 0 }];
  }

  const starts = findLiteralMatchStarts(text, trimmed);
  if (starts.length === 0) {
    return [{ text, highlight: false, start: 0 }];
  }

  const matchLen = trimmed.length;
  const segments: TextHighlightSegment[] = [];
  let cursor = 0;

  for (const start of starts) {
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), highlight: false, start: cursor });
    }
    const end = start + matchLen;
    segments.push({ text: text.slice(start, end), highlight: true, start });
    cursor = end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlight: false, start: cursor });
  }

  return segments;
}
