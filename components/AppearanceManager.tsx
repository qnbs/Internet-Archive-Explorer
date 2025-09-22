import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { 
    resolvedThemeAtom, 
    disableAnimationsAtom,
    highContrastModeAtom,
    underlineLinksAtom,
    fontSizeAtom,
    scrollbarColorAtom,
    accentColorAtom
} from '../store/settings';
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
 * Manages an injected <style> tag in the document's <head>.
 * Creates the tag if it doesn't exist, and updates its content.
 * @param id - The ID for the style tag.
 * @param content - The CSS content for the style tag.
 */
const updateStyleTag = (id: string, content: string) => {
    let styleTag = document.getElementById(id) as HTMLStyleElement;
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = id;
        document.head.appendChild(styleTag);
    }
    if (styleTag.textContent !== content) {
        styleTag.textContent = content;
    }
};

/**
 * Finds and updates a <meta> tag in the document's <head>.
 * @param name - The 'name' attribute of the meta tag.
 * @param content - The new 'content' attribute value.
 */
const updateMetaTag = (name: string, content: string) => {
    const metaTag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (metaTag && metaTag.content !== content) {
        metaTag.content = content;
    }
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

    // Use a ref to track the previous theme to apply transitions correctly.
    const previousThemeRef = useRef(resolvedTheme);

    // Effect to inject the transition styles once on mount.
    useEffect(() => {
        updateStyleTag(
            'theme-transition-style',
            `
            :root.theme-transitioning body,
            :root.theme-transitioning .bg-white,
            :root.theme-transitioning .bg-gray-100,
            :root.theme-transitioning .dark\\:bg-gray-800,
            :root.theme-transitioning .dark\\:bg-gray-900 {
                transition: background-color 0.3s ease, color 0.2s ease, border-color 0.3s ease !important;
            }
            `
        );
    }, []);

    useEffect(() => {
        const root = document.documentElement;

        // --- 1. Theme & Accent Color Application ---
        const colors = ACCENT_COLORS[accentColor];
        for (const [shade, color] of Object.entries(colors)) {
            root.style.setProperty(`--color-accent-${shade}`, color);
        }

        // Apply theme with a transition class to avoid flashing and unwanted animations.
        if (previousThemeRef.current !== resolvedTheme) {
            root.classList.add('theme-transitioning');
        }
        root.classList.remove('light', 'dark');
        root.classList.add(resolvedTheme);
        previousThemeRef.current = resolvedTheme;

        const transitionTimeout = setTimeout(() => {
            root.classList.remove('theme-transitioning');
        }, 350); // A bit longer than the CSS transition.

        // --- 2. Accessibility & UI Classes ---
        // These are applied to the root element for global scope.
        root.classList.toggle('no-animations', disableAnimations);
        
        // Body-level classes for more specific styling contexts
        document.body.classList.toggle('high-contrast', highContrastMode);
        document.body.classList.toggle('underline-links', underlineLinks);
        
        // Apply font size to the root for proportional REM scaling.
        root.style.fontSize = { sm: '14px', base: '16px', lg: '18px' }[fontSize];

        // --- 3. Dynamic Style Injection for Pseudo-elements ---
        updateStyleTag(
            'custom-scrollbar-style',
            // FIX: Cast scrollbarColor to string to resolve the 'unknown' type error.
            `::-webkit-scrollbar-thumb { background-color: ${scrollbarColor as string} !important; }`
        );
        
        // --- 4. PWA/Mobile Meta Theme Color ---
        // Updates the browser UI color to match the app's theme.
        const themeColor = resolvedTheme === 'dark' ? colors['800'] : colors['500'];
        updateMetaTag('theme-color', themeColor);

        return () => {
            clearTimeout(transitionTimeout);
        };
    }, [
        resolvedTheme, 
        disableAnimations, 
        highContrastMode, 
        underlineLinks, 
        fontSize, 
        scrollbarColor, 
        accentColor
    ]);

    return null; // This component renders nothing, it only manages DOM side effects.
};