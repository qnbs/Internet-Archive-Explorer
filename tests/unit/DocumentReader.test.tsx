import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DocumentReader } from '@/components/scriptorium/DocumentReader';
import { MediaType } from '@/types';

vi.mock('@/services/archiveService', () => ({
  getItemPlainText: vi.fn().mockResolvedValue('<script>alert(1)</script> plain'),
}));

vi.mock('@/hooks/useWorksets', () => ({
  useWorksets: () => ({
    updateDocumentNotes: vi.fn(),
  }),
}));

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/scriptorium/AnalysisToolbar', () => ({
  AnalysisToolbar: () => null,
}));

vi.mock('@/components/scriptorium/DocumentSearchBar', () => ({
  DocumentSearchBar: () => null,
}));

vi.mock('@/components/scriptorium/ResizablePanel', () => ({
  ResizablePanel: ({ panelA }: { panelA: React.ReactNode }) => <div>{panelA}</div>,
}));

vi.mock('@/components/RichTextEditor', () => ({
  RichTextEditor: () => null,
}));

describe('DocumentReader', () => {
  it('renders hostile archive plain text as inert text nodes', async () => {
    render(
      <DocumentReader
        document={{
          identifier: 'x',
          title: 'Doc',
          publicdate: '2020',
          mediatype: MediaType.Texts,
          notes: '',
          worksetId: 'w1',
        }}
        onBack={() => undefined}
      />,
    );

    expect(await screen.findByText('<script>alert(1)</script> plain')).toBeTruthy();
    expect(document.querySelector('script')).toBeNull();
  });
});
