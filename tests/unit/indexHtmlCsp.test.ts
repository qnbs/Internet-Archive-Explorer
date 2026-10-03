import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('index.html CSP and fonts', () => {
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

  it('does not load Google Fonts from the network', () => {
    expect(html).not.toContain('fonts.googleapis.com');
    expect(html).not.toContain('fonts.gstatic.com');
  });

  it('CSP does not allow Google Fonts origins', () => {
    const match = html.match(/Content-Security-Policy"\s+content="([^"]+)"/);
    expect(match).toBeTruthy();
    const csp = match?.[1] ?? '';
    expect(csp).not.toContain('fonts.googleapis.com');
    expect(csp).not.toContain('fonts.gstatic.com');
  });
});
