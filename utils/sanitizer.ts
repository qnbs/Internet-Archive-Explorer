import type { Config } from 'dompurify';
import DOMPurify from 'dompurify';

const SANITIZE_OPTIONS: Config = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style', 'link', 'meta'],
  FORBID_ATTR: ['style'],
};

export const sanitizeHtml = (html: string): string => {
  if (typeof html !== 'string') return '';
  return String(DOMPurify.sanitize(html, SANITIZE_OPTIONS));
};
