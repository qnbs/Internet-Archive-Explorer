import { cleanup } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';

class ResizeObserverStub {
  observe(): void {
    /* jsdom stub for cmdk */
  }
  unobserve(): void {
    /* jsdom stub for cmdk */
  }
  disconnect(): void {
    /* jsdom stub for cmdk */
  }
}
globalThis.ResizeObserver = ResizeObserverStub as typeof ResizeObserver;

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {
    /* jsdom stub for cmdk */
  };
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

beforeEach(() => {
  cleanup();
});
