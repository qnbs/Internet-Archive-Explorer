import React, { createContext, useContext, ReactNode } from 'react';
import { useItemDetail, ItemDetailContextType } from '../hooks/useItemDetail';
import type { ArchiveItemSummary } from '../types';

const ItemDetailContext = createContext<ItemDetailContextType | null>(null);

export const ItemDetailProvider: React.FC<{ item: ArchiveItemSummary; children: ReactNode }> = ({ item, children }) => {
    const value = useItemDetail(item);
    return <ItemDetailContext.Provider value={value}>{children}</ItemDetailContext.Provider>;
};

export const useItemDetailContext = (): ItemDetailContextType => {
    const context = useContext(ItemDetailContext);
    if (!context) {
        throw new Error('useItemDetailContext must be used within an ItemDetailProvider');
    }
    return context;
};
