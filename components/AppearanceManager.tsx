import { useEffect } from 'react';
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

export const AppearanceManager: React.FC = () => {
    const resolvedTheme = useAtomValue(resolvedThemeAtom);
    const disableAnimations = useAtomValue(disableAnimationsAtom);
    const highContrastMode = useAtomValue(highContrastModeAtom);
    const underlineLinks = useAtomValue(underlineLinksAtom);
    const fontSize = useAtomValue(fontSizeAtom);
    const scrollbarColor = useAtomValue(scrollbarColorAtom);
    const accentColor = useAtomValue(accentColorAtom);

    useEffect(() => {
        document.documentElement.className = resolvedTheme;
    }, [resolvedTheme]);

    useEffect(() => {
        const root = document.documentElement;
        const colors = ACCENT_COLORS[accentColor];
        for (const [shade, color] of Object.entries(colors)) {
            root.style.setProperty(`--color-accent-${shade}`, color);
        }

        if (disableAnimations) root.classList.add('no-animations'); else root.classList.remove('no-animations');
        if (highContrastMode) document.body.classList.add('high-contrast'); else document.body.classList.remove('high-contrast');
        if (underlineLinks) document.body.classList.add('underline-links'); else document.body.classList.remove('underline-links');
        
        document.body.style.fontSize = { sm: '14px', base: '16px', lg: '18px' }[fontSize];

        const styleId = 'custom-scrollbar-style';
        let style = document.getElementById(styleId) as HTMLStyleElement;
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        style.innerHTML = `::-webkit-scrollbar-thumb { background-color: ${String(scrollbarColor)} !important; }`;
    }, [accentColor, disableAnimations, highContrastMode, underlineLinks, fontSize, scrollbarColor]);

    return null;
}
