import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
    const { t } = useLanguage();
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-10 h-10 border-4',
    };
    return (
        <div 
            className={`animate-spin rounded-full ${sizeClasses[size]} border-cyan-400 border-t-transparent`} 
            role="status" 
            aria-live="polite"
        >
            <span className="sr-only">{t('common:loading')}</span>
        </div>
    );
};