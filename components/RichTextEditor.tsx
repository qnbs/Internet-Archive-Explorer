import React, { useRef, useCallback, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { BoldIcon, ItalicIcon, UnderlineIcon, ListUnorderedIcon, ListOrderedIcon } from './Icons';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}

const ToolbarButton: React.FC<{
    onClick: (e: React.MouseEvent) => void;
    title: string;
    children: React.ReactNode;
}> = ({ onClick, title, children }) => (
    <button
        type="button"
        onMouseDown={e => e.preventDefault()}
        onClick={onClick}
        title={title}
        className="p-2 rounded-md text-gray-400 hover:bg-gray-600 hover:text-white transition-colors"
    >
        {children}
    </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className }) => {
    const { t } = useLanguage();
    const editorRef = useRef<HTMLDivElement>(null);

    const handleCommand = (e: React.MouseEvent, command: string) => {
        e.preventDefault();
        document.execCommand(command, false);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            editorRef.current.focus();
        }
    };

    const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
        onChange(e.currentTarget.innerHTML);
    }, [onChange]);
    
    // This is a workaround to sync the div content if the value is updated externally (e.g. switching items)
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    return (
        <div className={`h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-700 ${className || ''}`}>
            <div className="flex-shrink-0 flex items-center space-x-1 p-1 border-b border-gray-700">
                <ToolbarButton onClick={(e) => handleCommand(e, 'bold')} title={t('common:richText.bold')}><BoldIcon /></ToolbarButton>
                <ToolbarButton onClick={(e) => handleCommand(e, 'italic')} title={t('common:richText.italic')}><ItalicIcon /></ToolbarButton>
                <ToolbarButton onClick={(e) => handleCommand(e, 'underline')} title={t('common:richText.underline')}><UnderlineIcon /></ToolbarButton>
                <div className="w-px h-6 bg-gray-700 mx-1"></div>
                <ToolbarButton onClick={(e) => handleCommand(e, 'insertUnorderedList')} title={t('common:richText.unorderedList')}><ListUnorderedIcon /></ToolbarButton>
                <ToolbarButton onClick={(e) => handleCommand(e, 'insertOrderedList')} title={t('common:richText.orderedList')}><ListOrderedIcon /></ToolbarButton>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                dangerouslySetInnerHTML={{ __html: value }}
                className="prose-editor w-full flex-grow bg-transparent text-gray-300 p-3 overflow-y-auto resize-none focus:outline-none placeholder-gray-500 prose prose-sm dark:prose-invert max-w-none"
                data-placeholder={placeholder}
            />
        </div>
    );
};