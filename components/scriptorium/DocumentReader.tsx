import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeftIcon } from '@/components/Icons';
import { useDebounce } from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import { useWorksets } from '@/hooks/useWorksets';
import { getItemPlainText } from '@/services/archiveService';
import type { WorksetDocument } from '@/types';
import { buildHighlightSegments } from '@/utils/literalTextSearch';
import { RichTextEditor } from '../RichTextEditor';
import { Spinner } from '../Spinner';
import { AnalysisToolbar } from './AnalysisToolbar';
import { DocumentSearchBar } from './DocumentSearchBar';
import { ResizablePanel } from './ResizablePanel';

interface DocumentReaderProps {
  document: WorksetDocument;
  onBack: () => void; // For mobile view
}

const HighlightedPlainText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const segments = useMemo(() => buildHighlightSegments(text, query), [text, query]);

  return (
    <>
      {segments.map((segment) =>
        segment.highlight ? (
          <mark
            key={`${segment.start}-${segment.text}`}
            data-match-index={segment.start}
            className="bg-yellow-400 text-black"
          >
            {segment.text}
          </mark>
        ) : (
          <React.Fragment key={`${segment.start}-${segment.text}`}>{segment.text}</React.Fragment>
        ),
      )}
    </>
  );
};

export const DocumentReader: React.FC<DocumentReaderProps> = ({ document, onBack }) => {
  const { t } = useLanguage();
  const { updateDocumentNotes } = useWorksets();

  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState(document.notes || '');
  const debouncedNotes = useDebounce(notes, 1000);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getItemPlainText(document.identifier)
      .then(setTextContent)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load document text.'),
      )
      .finally(() => setIsLoading(false));
  }, [document.identifier]);

  useEffect(() => {
    setNotes(document.notes || '');
  }, [document.notes]);

  useEffect(() => {
    if (debouncedNotes !== document.notes) {
      updateDocumentNotes({
        worksetId: document.worksetId,
        documentId: document.identifier,
        notes: debouncedNotes,
      });
    }
  }, [
    debouncedNotes,
    document.identifier,
    document.notes,
    document.worksetId,
    updateDocumentNotes,
  ]);

  const renderContent = () => {
    if (isLoading)
      return (
        <div className="flex justify-center items-center h-full">
          <Spinner />
        </div>
      );
    if (error) return <div className="p-4 text-red-400 text-center">{error}</div>;
    if (textContent) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-grow p-4 overflow-y-auto prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            <HighlightedPlainText text={textContent} query={searchQuery} />
          </div>
          <DocumentSearchBar text={textContent} onSearch={setSearchQuery} />
        </div>
      );
    }
    return null;
  };

  const readerPanel = (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            aria-label={t('scriptorium:reader.backToDocumentList')}
            className="md:hidden p-1 text-gray-400 hover:text-white touch-target-min"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
          <h3 className="text-md font-bold text-white truncate">{document.title}</h3>
        </div>
        {textContent && <AnalysisToolbar document={document} textContent={textContent} />}
      </header>
      {renderContent()}
    </div>
  );

  const notesPanel = (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      <header className="flex-shrink-0 p-3 border-b border-gray-700">
        <h3 className="text-md font-bold text-white">{t('scriptorium.reader.notes')}</h3>
      </header>
      <RichTextEditor
        value={notes}
        onChange={setNotes}
        placeholder={t('scriptorium:reader.notesPlaceholder')}
      />
    </div>
  );

  return <ResizablePanel panelA={readerPanel} panelB={notesPanel} />;
};
