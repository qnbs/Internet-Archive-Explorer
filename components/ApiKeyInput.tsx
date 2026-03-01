import React, { useMemo, useState } from 'react';

const STORAGE_KEY = 'gemini_api_key';

export const ApiKeyInput: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        return localStorage.getItem(STORAGE_KEY) || '';
    });
    const [isSaved, setIsSaved] = useState<boolean>(() => !!apiKey);

    const statusText = useMemo(
        () => (isSaved ? 'Key gespeichert' : 'Kein Key → Gemini deaktiviert'),
        [isSaved]
    );

    const handleSave = () => {
        const value = apiKey.trim();
        localStorage.setItem(STORAGE_KEY, value);
        setIsSaved(!!value);
    };

    return (
        <div className="space-y-2">
            <label htmlFor="gemini-api-key-input" className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                Gemini API-Key
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    id="gemini-api-key-input"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="flex-grow bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-accent-500 focus:border-accent-500"
                />
                <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-semibold bg-accent-600 text-white rounded-md hover:bg-accent-700 transition-colors"
                >
                    Speichern
                </button>
            </div>
            <p className={`text-sm ${isSaved ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                {statusText}
            </p>
        </div>
    );
};

export default ApiKeyInput;