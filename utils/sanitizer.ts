// Basic sanitizer to prevent XSS. For production, a library like DOMPurify is recommended.
export const sanitizeHtml = (html: string): string => {
    if (typeof html !== 'string') return '';
    return html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/on\w+\s*=\s*("([^"]*)"|'([^']*)'|[^>\s]+)/gi, '');
};
