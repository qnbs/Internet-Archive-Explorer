import { describe, expect, it } from 'vitest';
import {
  archiveMetadataSchema,
  archiveSearchResponseSchema,
  extractedEntitiesSchema,
  geminiApiResponseSchema,
  imageAnalysisResultSchema,
  magicOrganizeResultSchema,
  waybackCdxJsonSchema,
} from '@/types/archiveSchemas';

describe('archiveSchemas', () => {
  it('archiveSearchResponseSchema accepts a minimal valid search payload', () => {
    const result = archiveSearchResponseSchema.safeParse({
      response: {
        numFound: 1,
        start: 0,
        docs: [
          {
            identifier: 'x',
            title: 'Title',
            publicdate: '2020-01-01',
            mediatype: 'texts',
          },
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it('archiveSearchResponseSchema rejects missing docs', () => {
    const result = archiveSearchResponseSchema.safeParse({
      response: { numFound: 0, start: 0 },
    });
    expect(result.success).toBe(false);
  });

  it('archiveMetadataSchema coerces null files to empty array', () => {
    const result = archiveMetadataSchema.safeParse({
      metadata: {
        identifier: 'x',
        title: 'T',
        publicdate: '2020-01-01',
        mediatype: 'texts',
      },
      files: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.files).toEqual([]);
    }
  });

  it('waybackCdxJsonSchema accepts header + row arrays', () => {
    const result = waybackCdxJsonSchema.safeParse([
      ['urlkey', 'timestamp'],
      ['com,example)/', '20200101000000'],
    ]);
    expect(result.success).toBe(true);
  });

  it('geminiApiResponseSchema accepts candidates with text parts', () => {
    const result = geminiApiResponseSchema.safeParse({
      candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }],
    });
    expect(result.success).toBe(true);
  });

  it('extractedEntitiesSchema requires all entity arrays', () => {
    expect(
      extractedEntitiesSchema.safeParse({
        people: [],
        places: [],
        organizations: [],
        dates: [],
      }).success,
    ).toBe(true);
    expect(extractedEntitiesSchema.safeParse({ people: [] }).success).toBe(false);
  });

  it('imageAnalysisResultSchema requires non-empty description', () => {
    expect(imageAnalysisResultSchema.safeParse({ description: '', tags: [] }).success).toBe(false);
    expect(
      imageAnalysisResultSchema.safeParse({ description: 'A photo', tags: ['art'] }).success,
    ).toBe(true);
  });

  it('magicOrganizeResultSchema validates tags and collections', () => {
    const result = magicOrganizeResultSchema.safeParse({ tags: ['a'], collections: ['b'] });
    expect(result.success).toBe(true);
  });
});
