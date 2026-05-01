/**
 * Zod runtime schemas for Internet Archive API and Gemini JSON payloads.
 * Keeps types aligned with `types.ts` while validating at the network boundary.
 */
import { z } from 'zod';

/** i18n keys (namespace:key) for thrown service errors — use with `t()` in UI */
export const SERVICE_I18N = {
  archive: {
    validationFailed: 'common:serviceErrors.archiveValidation',
    invalidJson: 'common:serviceErrors.archiveInvalidJson',
  },
  gemini: {
    validationFailed: 'common:serviceErrors.geminiValidation',
    invalidJson: 'common:serviceErrors.geminiInvalidJson',
    responseShape: 'common:serviceErrors.geminiResponseShape',
  },
} as const;

const mediaTypeValues = [
  'audio',
  'movies',
  'texts',
  'image',
  'software',
  'collection',
  'data',
  'web',
] as const;

export const mediaTypeSchema = z.enum(mediaTypeValues);

const optionalStringOrStringArray = z.union([z.string(), z.array(z.string())]).optional();

export const archiveItemSummarySchema = z
  .object({
    identifier: z.string(),
    title: z.string(),
    thumbnail: z.string().optional(),
    creator: optionalStringOrStringArray,
    publicdate: z.string(),
    mediatype: mediaTypeSchema,
    uploader: z.string().optional(),
    'access-restricted-item': z.enum(['true', 'false']).optional(),
    downloads: z.coerce.number().optional(),
    week: z.coerce.number().optional(),
    avg_rating: z.string().optional(),
    reviewdate: z.string().optional(),
    reviewtitle: z.string().optional(),
    reviewbody: z.string().optional(),
  })
  .passthrough();

export const archiveSearchResponseSchema = z.object({
  response: z.object({
    numFound: z.coerce.number(),
    start: z.coerce.number(),
    docs: z.array(archiveItemSummarySchema),
  }),
});

export const archiveFileSchema = z
  .object({
    name: z.string(),
    source: z.string(),
    format: z.string(),
    size: z.union([z.string(), z.number()]).optional(),
    length: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough();

export const archiveMetadataSchema = z
  .object({
    metadata: z
      .object({
        identifier: z.string(),
        title: z.string(),
        creator: optionalStringOrStringArray,
        uploader: z.string().optional(),
        publicdate: z.string(),
        mediatype: mediaTypeSchema,
        description: optionalStringOrStringArray,
        licenseurl: z.string().optional(),
        collection: z.union([z.string(), z.array(z.string())]).optional(),
        'access-restricted-item': z.enum(['true', 'false']).optional(),
      })
      .passthrough(),
    files: z.preprocess(
      (val) => (val === null || val === undefined ? [] : val),
      z.array(archiveFileSchema),
    ),
    reviews: z.array(z.object({}).passthrough()).optional(),
    similars: z
      .record(
        z.string(),
        z.object({
          count: z.number(),
          items: z.array(archiveItemSummarySchema),
        }),
      )
      .optional(),
  })
  .passthrough();

/** CDX API returns a header row plus data rows */
export const waybackCdxJsonSchema = z.array(z.array(z.union([z.string(), z.number()])));

export const geminiInlineDataSchema = z
  .object({
    data: z.string(),
    mimeType: z.string(),
  })
  .passthrough();

export const geminiPartSchema = z
  .object({
    text: z.string().optional(),
    inlineData: geminiInlineDataSchema.optional(),
  })
  .passthrough();

export const geminiApiResponseSchema = z.object({
  candidates: z
    .array(
      z
        .object({
          content: z
            .object({
              parts: z.array(geminiPartSchema).optional(),
            })
            .passthrough()
            .optional(),
        })
        .passthrough(),
    )
    .optional(),
});

export const extractedEntitiesSchema = z.object({
  people: z.array(z.string()),
  places: z.array(z.string()),
  organizations: z.array(z.string()),
  dates: z.array(z.string()),
});

export const imageAnalysisResultSchema = z.object({
  description: z.string().min(1),
  tags: z.array(z.string()),
});

export const magicOrganizeResultSchema = z.object({
  tags: z.array(z.string()),
  collections: z.array(z.string()),
});

export type ValidatedArchiveItemSummary = z.infer<typeof archiveItemSummarySchema>;
export type ValidatedArchiveSearchResponse = z.infer<typeof archiveSearchResponseSchema>;
export type ValidatedArchiveMetadata = z.infer<typeof archiveMetadataSchema>;
export type ValidatedArchiveFile = z.infer<typeof archiveFileSchema>;
export type ValidatedGeminiApiResponse = z.infer<typeof geminiApiResponseSchema>;
export type ValidatedExtractedEntities = z.infer<typeof extractedEntitiesSchema>;
export type ValidatedImageAnalysisResult = z.infer<typeof imageAnalysisResultSchema>;
export type ValidatedMagicOrganizeResult = z.infer<typeof magicOrganizeResultSchema>;
