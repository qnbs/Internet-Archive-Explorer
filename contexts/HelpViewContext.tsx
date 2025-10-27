import React, { createContext, useContext, ReactNode } from 'react';
import { useHelpView, HelpViewContextType, HelpTopic, HelpQuestion } from '../hooks/useHelpView';

// Re-export types for convenience
export type { HelpTopic, HelpQuestion };

const HelpViewContext = createContext<HelpViewContextType | null>(null);

export const HelpViewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const value = useHelpView();
    return <HelpViewContext.Provider value={value}>{children}</HelpViewContext.Provider>;
};

export const useHelpViewContext = (): HelpViewContextType => {
    const context = useContext(HelpViewContext);
    if (!context) {
        throw new Error('useHelpViewContext must be used within a HelpViewProvider');
    }
    return context;
};