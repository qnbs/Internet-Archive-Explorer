import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('service worker precache policy (M7)', () => {
  it('precaches app shell only, not third-party font CSS', () => {
    const swPath = join(process.cwd(), 'public/sw.js');
    const source = readFileSync(swPath, 'utf8');
    expect(source).not.toContain('THIRD_PARTY_URLS');
    expect(source).not.toContain('fonts.googleapis.com');
    expect(source).toContain('urlsToPrecache');
    expect(source).toContain('APP_SHELL_URLS');
  });
});
