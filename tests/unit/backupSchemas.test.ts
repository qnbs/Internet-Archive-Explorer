import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as backupSchemas from '@/types/backupSchemas';

describe('backupSchemas', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('measures UTF-8 byte length, not UTF-16 code units', () => {
    const emojiHeavy = `{"version":2,"emoji":"${'😀'.repeat(100)}"}`;
    expect(emojiHeavy.length).toBeLessThan(backupSchemas.getBackupJsonByteLength(emojiHeavy));
  });

  it('rejects backups larger than MAX_BACKUP_FILE_BYTES', () => {
    const prefix = '{"version":2,"p":"';
    const suffix = '"}';
    const overhead = backupSchemas.getBackupJsonByteLength(`${prefix}${suffix}`);
    const fillerLen = backupSchemas.MAX_BACKUP_FILE_BYTES - overhead + 64;
    const json = `${prefix}${'a'.repeat(fillerLen)}${suffix}`;
    expect(backupSchemas.getBackupJsonByteLength(json)).toBeGreaterThan(
      backupSchemas.MAX_BACKUP_FILE_BYTES,
    );
    expect(() => backupSchemas.parseBackupJson(json)).toThrow(/too large/i);
  });

  it('accepts minimal v2 backup JSON under the byte limit', () => {
    const json = JSON.stringify({ version: 2 });
    expect(backupSchemas.getBackupJsonByteLength(json)).toBeLessThan(
      backupSchemas.MAX_BACKUP_FILE_BYTES,
    );
    expect(backupSchemas.parseBackupJson(json).version).toBe(2);
  });
});
