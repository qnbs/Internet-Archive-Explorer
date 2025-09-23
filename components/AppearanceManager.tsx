// FIX: Add missing React import.
import React, { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { 
    resolvedThemeAtom, 
    disableAnimationsAtom,
    highContrastModeAtom,
    underlineLinksAtom,
    fontSizeAtom,
    scrollbarColorAtom,
    accentColorAtom
} from '../store';
import type { AccentColor } from '../types';

const ACCENT_COLORS: Record<AccentColor, Record<string, string>> = {
  cyan: {
    '50': '#ecfeff', '100': '#cffafe', '200': '#a5f3fd', '300': '#67e8f9', '400': '#22d3ee',
    '500': '#06b6d4', '600': '#0891b2', '700': '#0e7490', '800': '#155e75', '900': '#164e63', '950': '#083344',
  },
  emerald: {
    '50': '#ecfdf5', '100': '#d1fae5', '200': '#a7f3d0', '300': '#6ee7b7', '400': '#34d399',
    '500': '#10b981', '600': '#059669', '700': '#047857', '800': '#065f46', '900': '#064e3b', '950': '#022c22',
  },
  rose: {
    '50': '#fff1f2', '100': '#ffe4e6', '200': '#fecdd3', '300': '#fda4af', '400': '#fb7185',
    '500': '#f43f5e', '600': '#e11d48', '700': '#be123c', '800': '#9f1239', '900': '#881337', '950': '#4c0519',
  },
  violet: {
    '50': '#f5f3ff', '100': '#ede9fe', '200': '#ddd6fe', '300': '#c4b5fd', '400': '#a78bfa',
    '500': '#8b5cf6', '600': '#7c3aed', '700': '#6d28d9', '800': '#5b21b6', '900': '#4c1d95', '950': '#2e1065',
  },
};

/**
 * A sophisticated, headless component that applies all visual and appearance-related
 * settings to the application globally. It handles theme switching with smooth transitions,
 * dynamic accent colors, accessibility settings, and PWA theme-color integration.
 */
export const AppearanceManager: React.FC = () => {
    const resolvedTheme = useAtomValue(resolvedThemeAtom);
    const disableAnimations = useAtomValue(disableAnimationsAtom);
    const highContrastMode = useAtomValue(highContrastModeAtom);
    const underlineLinks = useAtomValue(underlineLinksAtom);
    const fontSize = useAtomValue(fontSizeAtom);
    const scrollbarColor = useAtomValue(scrollbarColorAtom);
    const accentColor = useAtomValue(accentColorAtom);

    const previousThemeRef = useRef(resolvedTheme);
    const domElementsRef = useRef<{
        styleTags: { [key: string]: HTMLStyleElement | null };
        metaTags: { [key: string]: HTMLMetaElement | null };
    }>({ styleTags: {}, metaTags: {} });

    // Effect to find/create necessary DOM elements once on mount and cache them.
    useEffect(() => {
        const createStyleTag = (id: string) => {
            let tag = document.getElementById(id) as HTMLStyleElement;
            if (!tag) {
                tag = document.createElement('style');
                tag.id = id;
                document.head.appendChild(tag);
            }
            return tag;
        };

        domElementsRef.current.styleTags['theme-transition'] = createStyleTag('theme-transition-style');
        domElementsRef.current.styleTags['scrollbar'] = createStyleTag('custom-scrollbar-style');
        domElementsRef.current.metaTags['theme-color'] = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;

        // Inject transition styles
        const transitionTag = domElementsRef.current.styleTags['theme-transition'];
        if (transitionTag) {
            transitionTag.textContent = `
              :root.theme-transitioning,
              :root.theme-transitioning body,
              :root.theme-transitioning .bg-white,
              :root.theme-transitioning .bg-gray-100,
              :root.theme-transitioning .dark\\:bg-gray-800,
              :root.theme-transitioning .dark\\:bg-gray-900 {
                  transition: background-color 0.3s ease, color 0.2s ease, border-color 0.3s ease !important;
              }
            `;
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;

        // 1. Theme & Accent Color Application
        const colors = ACCENT_COLORS[accentColor];
        for (const [shade, color] of Object.entries(colors)) {
            root.style.setProperty(`--color-accent-${shade}`, color);
        }

        if (previousThemeRef.current !== resolvedTheme) {
            root.classList.add('theme-transitioning');
        }
        root.classList.remove('light', 'dark');
        root.classList.add(resolvedTheme);
        previousThemeRef.current = resolvedTheme;

        const transitionTimeout = setTimeout(() => {
            root.classList.remove('theme-transitioning');
        }, 350);

        // 2. Accessibility & UI Classes
        root.classList.toggle('no-animations', disableAnimations);
        document.body.classList.toggle('high-contrast', highContrastMode);
        document.body.classList.toggle('underline-links', underlineLinks);
        
        const fontSizeMap = { sm: '14px', base: '16px', lg: '18px' };
        document.body.style.fontSize = fontSizeMap[fontSize];

        // 3. Dynamic Style Injection for Pseudo-elements
        const scrollbarTag = domElementsRef.current.styleTags['scrollbar'];
        if (scrollbarTag) {
            // FIX: Cast `scrollbarColor` to string to resolve type error.
            const newContent = `::-webkit-scrollbar-thumb { background-color: ${scrollbarColor as string} !important; }`;
            if (scrollbarTag.textContent !== newContent) {
                scrollbarTag.textContent = newContent;
            }
        }
        
        // 4. PWA/Mobile Meta Theme Color
        const themeColorMeta = domElementsRef.current.metaTags['theme-color'];
        if (themeColorMeta) {
            const themeColor = resolvedTheme === 'dark' ? colors['800'] : colors['500'];
            if (themeColorMeta.content !== themeColor) {
                themeColorMeta.content = themeColor;
            }
        }

        return () => clearTimeout(transitionTimeout);
    }, [resolvedTheme, disableAnimations, highContrastMode, underlineLinks, fontSize, scrollbarColor, accentColor]);

    return null;
};