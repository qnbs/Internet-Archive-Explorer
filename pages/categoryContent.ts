import type { CategoryContent } from '../types';

/**
 * This object maps specific view identifiers to the content needed to render a generic CategoryView.
 * It is used as a fallback in App.tsx for views that don't have a dedicated component.
 * Currently, all major categories have their own custom hub views (e.g., Videothek, Audiothek),
 * so this object is empty. It is kept for potential future expansion.
 */
export const categoryContent: Record<string, CategoryContent> = {};
