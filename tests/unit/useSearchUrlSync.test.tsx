import { act, render, screen } from '@testing-library/react';
import { getDefaultStore, useAtom } from 'jotai';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSearchUrlSync } from '@/hooks/useSearchUrlSync';
import { defaultFacets, facetsAtom, searchQueryAtom } from '@/store/search';
import { MediaType } from '@/types';

function TestComponent() {
  useSearchUrlSync();
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [facets, setFacets] = useAtom(facetsAtom);
  const [searchParams] = useSearchParams();

  return (
    <div>
      <div data-testid="query">{searchQuery}</div>
      <div data-testid="facets">
        {JSON.stringify({ ...facets, mediaType: Array.from(facets.mediaType) })}
      </div>
      <div data-testid="params">{searchParams.toString()}</div>
      <button type="button" data-testid="set-query" onClick={() => setSearchQuery('archives')}>
        Set query
      </button>
      <button
        type="button"
        data-testid="set-facets"
        onClick={() =>
          setFacets({
            mediaType: new Set<MediaType>([MediaType.Texts, MediaType.Audio]),
            availability: 'free',
            language: 'English',
            yearStart: 1900,
            yearEnd: 2000,
            collection: 'foo',
          })
        }
      >
        Set facets
      </button>
      <button
        type="button"
        data-testid="clear-all"
        onClick={() => {
          setSearchQuery('');
          setFacets({ mediaType: new Set<MediaType>(), availability: 'all' });
        }}
      >
        Clear all
      </button>
    </div>
  );
}

function renderWithRouter(initialEntries?: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <TestComponent />
    </MemoryRouter>,
  );
}

describe('useSearchUrlSync', () => {
  beforeEach(() => {
    getDefaultStore().set(searchQueryAtom, '');
    getDefaultStore().set(facetsAtom, defaultFacets);
  });

  it('restores the search query from ?q=', () => {
    renderWithRouter(['/?q=library']);
    expect(screen.getByTestId('query').textContent).toBe('library');
  });

  it('restores all facet params from the URL', () => {
    renderWithRouter([
      '/?mediaType=texts,audio&availability=free&language=English&yearStart=1900&yearEnd=2000&collection=foo',
    ]);

    const facets = JSON.parse(screen.getByTestId('facets').textContent ?? '') as {
      mediaType: string[];
      availability: string;
      language?: string;
      yearStart?: number;
      yearEnd?: number;
      collection?: string;
    };
    expect(new Set(facets.mediaType)).toEqual(new Set(['texts', 'audio']));
    expect(facets.availability).toBe('free');
    expect(facets.language).toBe('English');
    expect(facets.yearStart).toBe(1900);
    expect(facets.yearEnd).toBe(2000);
    expect(facets.collection).toBe('foo');
  });

  it('writes the search query to the URL', () => {
    renderWithRouter(['/']);
    expect(screen.getByTestId('params').textContent).toBe('');

    act(() => {
      screen.getByTestId('set-query').click();
    });

    expect(screen.getByTestId('query').textContent).toBe('archives');
    expect(screen.getByTestId('params').textContent).toBe('q=archives');
  });

  it('writes facets to the URL', () => {
    renderWithRouter(['/']);

    act(() => {
      screen.getByTestId('set-facets').click();
    });

    const params = new URLSearchParams(screen.getByTestId('params').textContent ?? '');
    expect(params.get('mediaType')).toBe('texts,audio');
    expect(params.get('availability')).toBe('free');
    expect(params.get('language')).toBe('English');
    expect(params.get('yearStart')).toBe('1900');
    expect(params.get('yearEnd')).toBe('2000');
    expect(params.get('collection')).toBe('foo');
  });

  it('removes params when query and facets return to defaults', () => {
    renderWithRouter(['/?q=foo&mediaType=texts&availability=free']);
    expect(screen.getByTestId('params').textContent).not.toBe('');

    act(() => {
      screen.getByTestId('clear-all').click();
    });

    expect(screen.getByTestId('query').textContent).toBe('');
    expect(screen.getByTestId('params').textContent).toBe('');
  });

  it('ignores invalid mediaType and availability values', () => {
    renderWithRouter(['/?mediaType=invalid,alsobad&availability=nope']);
    const facets = JSON.parse(screen.getByTestId('facets').textContent ?? '') as {
      mediaType: string[];
      availability: string;
    };
    expect(facets.mediaType).toEqual([]);
    expect(facets.availability).toBe('all');
  });
});
