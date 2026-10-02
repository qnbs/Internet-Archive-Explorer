import { z } from 'zod';

export const BACKUP_VERSION_V1 = 1;
export const BACKUP_VERSION_V2 = 2;
export const BACKUP_CURRENT_VERSION = BACKUP_VERSION_V2;

/** Maximum imported backup file size (5 MiB). */
export const MAX_BACKUP_FILE_BYTES = 5 * 1024 * 1024;

export const MAX_BACKUP_LIBRARY_ITEMS = 10_000;
export const MAX_BACKUP_WORKSETS = 500;
export const MAX_BACKUP_STRING_LENGTH = 50_000;
export const MAX_BACKUP_TAGS = 200;
export const MAX_BACKUP_COLLECTIONS = 500;

const forbiddenKey = (key: string): boolean =>
  key === '__proto__' || key === 'constructor' || key === 'prototype';

export const safeIdentifierSchema = z
  .string()
  .min(1)
  .max(256)
  .refine((id) => !forbiddenKey(id), { message: 'Invalid identifier key' })
  .refine(
    (id) =>
      !id.split('').some((ch) => {
        const code = ch.charCodeAt(0);
        return code >= 0 && code <= 31;
      }),
    { message: 'Invalid identifier characters' },
  );

const boundedString = (max = MAX_BACKUP_STRING_LENGTH) => z.string().max(max);

const archiveItemSummarySchema = z.object({
  identifier: safeIdentifierSchema,
  title: boundedString(2000),
  thumbnail: boundedString(2048).optional(),
  creator: z.union([boundedString(2000), z.array(boundedString(500))]).optional(),
  publicdate: boundedString(64),
  mediatype: z.string().max(64),
  uploader: boundedString(256).optional(),
  'access-restricted-item': z.enum(['true', 'false']).optional(),
  downloads: z.number().finite().optional(),
  week: z.number().finite().optional(),
  avg_rating: z.number().finite().optional(),
});

export const libraryItemSchema = archiveItemSummarySchema.extend({
  notes: boundedString(),
  tags: z.array(boundedString(128)).max(MAX_BACKUP_TAGS),
  addedAt: z.number().finite(),
  collections: z.array(boundedString(128)).max(MAX_BACKUP_COLLECTIONS),
});

export const worksetDocumentSchema = archiveItemSummarySchema.extend({
  notes: boundedString(),
  worksetId: boundedString(128),
});

export const worksetSchema = z.object({
  id: boundedString(128).refine((id) => !forbiddenKey(id)),
  name: boundedString(512),
  documents: z.array(worksetDocumentSchema).max(500),
});

const settingsSchema = z.record(z.string(), z.unknown());

export const backupSchemaV1 = z.object({
  version: z.literal(BACKUP_VERSION_V1),
  timestamp: boundedString(64).optional(),
  settings: settingsSchema.optional(),
  libraryItems: z.array(libraryItemSchema).max(MAX_BACKUP_LIBRARY_ITEMS).optional(),
  uploaderFavorites: z.array(safeIdentifierSchema).max(MAX_BACKUP_LIBRARY_ITEMS).optional(),
  scriptoriumWorksets: z.array(worksetSchema).max(MAX_BACKUP_WORKSETS).optional(),
  searchHistory: z.array(boundedString(512)).max(500).optional(),
});

export const backupSchemaV2 = backupSchemaV1.extend({
  version: z.literal(BACKUP_VERSION_V2),
  userCollections: z
    .array(
      z.object({
        id: boundedString(128).refine((id) => !forbiddenKey(id)),
        name: boundedString(512),
        itemIdentifiers: z.array(safeIdentifierSchema).max(MAX_BACKUP_LIBRARY_ITEMS),
      }),
    )
    .max(MAX_BACKUP_COLLECTIONS)
    .optional(),
  aiArchive: z.array(z.record(z.string(), z.unknown())).max(2000).optional(),
  language: z.enum(['en', 'de']).optional(),
});

export type ParsedBackupV2 = z.infer<typeof backupSchemaV2>;
export type ParsedBackupV1 = z.infer<typeof backupSchemaV1>;

export function getBackupJsonByteLength(jsonString: string): number {
  return new TextEncoder().encode(jsonString).byteLength;
}

export function parseBackupJson(jsonString: string): ParsedBackupV2 {
  if (getBackupJsonByteLength(jsonString) > MAX_BACKUP_FILE_BYTES) {
    throw new Error('Backup file is too large.');
  }

  let raw: unknown;
  try {
    raw = JSON.parse(jsonString) as unknown;
  } catch {
    throw new Error('Import failed: The file is not a valid JSON file.');
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Invalid backup file. The file is not a valid Archive Explorer backup.');
  }

  const version = (raw as { version?: unknown }).version;
  if (version === BACKUP_VERSION_V2) {
    const parsed = backupSchemaV2.safeParse(raw);
    if (!parsed.success) {
      throw new Error('Invalid backup file. Data failed validation.');
    }
    return parsed.data;
  }

  if (version === BACKUP_VERSION_V1) {
    const parsed = backupSchemaV1.safeParse(raw);
    if (!parsed.success) {
      throw new Error('Invalid backup file. Data failed validation.');
    }
    return { ...parsed.data, version: BACKUP_VERSION_V2 };
  }

  throw new Error('Unsupported backup version.');
}
