import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { sanitizeHtml } from '../../utils/sanitizer';

interface ItemDetailDescriptionTabProps {
    description: string | string[] | undefined;
}

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