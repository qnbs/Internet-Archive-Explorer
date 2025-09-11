import React from 'react';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../hooks/useLanguage';

interface ItemDetailDescriptionTabProps {
    description: string | string[] | undefined;
}

// Basic sanitizer to prevent XSS. For production, a library like DOMPurify is recommended.
const sanitizeHtml = (html: string): string => {
    return html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/on\w+\s*=\s*("([^"]*)"|'([^']*)'|[^>\s]+)/gi, '');
};

export const ItemDetailDescriptionTab: React.FC<ItemDetailDescriptionTabProps> = ({ description }) => {
    const { t } = useLanguage();

    if (!description) {
        return <p className="text-gray-500 dark:text-gray-400">{t('common:noDescription')}</p>;
    }

    const descriptionText = (Array.isArray(description) ? description.join('\n') : description)
        .replace(/<br\s*\/?>/gi, '\n');
        
    const paragraphs = descriptionText.split(/\n\s*\n*/g).map(p => p.trim()).filter(p => p.length > 0);

    return (
        <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
            {paragraphs.map((p, index) => (<p key={index} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p) }} />))}
        </div>
    );
};