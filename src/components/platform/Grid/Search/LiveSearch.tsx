'use client';

import { SearchIcon, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useDebounce } from '~/components/ui/multi-select';
import { testIDFormatter } from '~/utils/formatter';

import { UpdateReportFilter } from '../Action/UpdateReportFilter';
import { GridContext } from '../Provider';

import { type ISearchItem } from './types';
import { buildLiveSearchFilters } from './utils/buildLiveSearchFilters';

/**
 * WP-828 — inline live search, rendered instead of SearchDialog when a grid
 * sets `searchMode: 'live'`. Typing filters the grid's own rows directly
 * (500ms debounce, no suggestion round trip, no modal). Results are applied
 * through the grid's existing apply path so URL state, tabs and cached filters
 * keep working.
 */
export default function LiveSearch() {
  const router = useRouter();
  const path = usePathname();
  const [, , path1, path2] = path.split('/');
  const { state: gridState } = useContext(GridContext);
  const {
    entity = '',
    searchableFields = [],
    enableSearch = true,
    onFetchRecords,
  } = gridState?.config ?? {};
  const { gridKey } = gridState ?? {};

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  // Skip the apply on mount — an empty query would needlessly re-push the URL.
  const appliedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enableSearch) return;
    if (appliedRef.current === null && !debouncedQuery) {
      appliedRef.current = '';
      return;
    }
    if (appliedRef.current === debouncedQuery) return;
    appliedRef.current = debouncedQuery;

    const apply = async () => {
      const base = (gridState?.advanceFilter ?? []).filter(
        (item) => !(item as ISearchItem & { is_search?: boolean })?.is_search,
      );
      const live = buildLiveSearchFilters({
        query: debouncedQuery,
        searchableFields,
        entity,
      });
      // Flat advance_filters only — never a nested group (see View.tsx:65-84).
      const filters: ISearchItem[] = live.length
        ? [
            ...live,
            ...(base.length
              ? ([{ type: 'operator', operator: 'and' }] as ISearchItem[])
              : []),
            ...base,
          ]
        : base;

      const updatedFilterUrl = await UpdateReportFilter({ filters, gridKey });

      if (onFetchRecords) {
        onFetchRecords({ advance_filters: filters });
        return;
      }
      if (updatedFilterUrl) {
        router.push(updatedFilterUrl);
        return;
      }
      router.refresh();
    };

    void apply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  if (!enableSearch) return null;

  return (
    <div className="relative flex items-center">
      <SearchIcon className="pointer-events-none absolute left-2 size-4 text-default/40" />
      <Input
        className="h-[40px] w-full min-w-[200px] pl-8 pr-8"
        data-test-id={`${testIDFormatter(`${path1}-${path2}-live-search-input`)}`}
        placeholder="Search..."
        type="text"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
      />
      {query ? (
        <Button
          className="absolute right-1 h-auto w-auto p-1 text-default/40 hover:bg-transparent"
          name="clearLiveSearchButton"
          size="xs"
          type="button"
          variant="ghost"
          onClick={() => {
            setQuery('');
          }}
        >
          <X className="size-3" />
        </Button>
      ) : null}
    </div>
  );
}
