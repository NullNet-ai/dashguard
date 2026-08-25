// WP-828 loopback — the merge-gate blocker.
//
// The first cut of LiveSearch tagged its criteria with `is_search: true` and
// filtered the persisted filter with `!is_search`. That tag never survives:
// the `updateReportFilter` zod input schema (src/server/api/routers/grid.ts
// :739-756) has no `is_search` key and no `.passthrough()`, so the field is
// stripped on write. The filter comes back out of Redis via `reportFilters`
// (grid.ts:970) -> gridDataResolver.ts:45-49 -> gridProps.advanceFilter ->
// GridContext -> LiveSearch's `base`, untagged. So `!is_search` matched
// everything and stripped nothing, and:
//
//   1. clicking the clear (X) re-persisted the same criteria — the clear
//      button did not clear;
//   2. a second search ANDed onto the first — `(alice OR..) AND (bob OR..)`,
//      almost certainly zero rows with no way back.
//
// Even if `is_search` HAD survived, the injected `or` operators and the joining
// `and` were never tagged, so stripping the criteria alone would have left a
// dangling operator run behind.
//
// These tests drive the round trip through the ONE thing that survives the zod
// schema and reaches the client again: `id`.
//
// RED against a0663b73 (`composeLiveSearchFilters` / `readLiveSearchQuery` do
// not exist, and `buildLiveSearchFilters` emits no ids).
import { describe, expect, it } from 'vitest';

import {
  buildLiveSearchFilters,
  composeLiveSearchFilters,
  isLiveSearchItem,
  readLiveSearchQuery,
  stripLiveSearchFilters,
} from '../../../src/components/platform/Grid/Search/utils/buildLiveSearchFilters';

const searchableFields = [
  { accessorKey: 'name', field: 'name', label: 'Name', entity: 'contact' },
  { accessorKey: 'email', field: 'email', label: 'Email', entity: 'contact' },
  {
    accessorKey: 'phone',
    field: 'raw_phone_number',
    label: 'Phone',
    entity: 'contact',
  },
] as any[];

const entity = 'contact';

/** A user-set advance-filter pill, as `resolveSearchItem` persists it. */
const userPill = {
  type: 'criteria',
  operator: 'equal',
  field: 'status',
  entity: 'contact',
  values: ['Active'],
  id: '01HZZZZZZZZZZZZZZZZZZZZZZZ',
  default: false,
} as any;

const andOperator = { type: 'operator', operator: 'and', default: false } as any;

/**
 * Everything `updateReportFilter`'s zod schema keeps. Anything not listed at
 * grid.ts:739-756 is dropped, which is exactly what killed `is_search`.
 */
const ZOD_KEYS = new Set([
  'type',
  'field',
  'entity',
  'operator',
  'values',
  'id',
  'label',
  'default',
  'display_value',
  'filters',
  'parse_as',
  'is_custom_value',
  'raw_value',
  'custom_value',
  'key',
]);

/**
 * Simulates the persistence round trip: strip every key the zod input schema
 * does not declare, exactly as `z.object` does without `.passthrough()`.
 */
const roundTrip = (items: any[]): any[] =>
  items.map((item) =>
    Object.fromEntries(
      Object.entries(item).filter(([key]) => ZOD_KEYS.has(key)),
    ),
  );

const criteria = (items: any[]) =>
  items.filter((item) => item?.type === 'criteria');

describe('WP-828 live search survives the updateReportFilter round trip', () => {
  it('keeps its tag after the zod schema strips unknown keys', () => {
    const live = buildLiveSearchFilters({
      query: 'bob',
      searchableFields,
      entity,
    });

    // `is_search` is what the schema throws away.
    expect(live.every((item) => (item as any).is_search !== false)).toBe(true);
    expect(
      roundTrip(live).some((item) => 'is_search' in item),
    ).toBe(false);

    // ...so the tag has to be `id`, which the schema declares and keeps.
    expect(roundTrip(live).every(isLiveSearchItem)).toBe(true);
  });

  it('tags the injected `or` operators too, so nothing dangles', () => {
    const live = roundTrip(
      buildLiveSearchFilters({ query: 'bob', searchableFields, entity }),
    );

    const operators = live.filter((item) => item.type === 'operator');
    expect(operators.length).toBeGreaterThan(0);
    expect(operators.every(isLiveSearchItem)).toBe(true);

    // Unique ids — these become React list keys in SearchList.
    const ids = live.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('CLEAR RESTORES: an empty query gives back exactly the user pills', () => {
    const base = [userPill, andOperator, { ...userPill, values: ['VIP'] }];

    const searched = roundTrip(
      composeLiveSearchFilters({
        query: 'bob',
        searchableFields,
        entity,
        base,
      }),
    );
    expect(criteria(searched).length).toBeGreaterThan(criteria(base).length);

    // The clear (X) sets the query to '' and re-composes off the PERSISTED
    // filter — which now contains the live chain.
    const cleared = composeLiveSearchFilters({
      query: '',
      searchableFields,
      entity,
      base: searched,
    });

    expect(cleared).toEqual(base);
    expect(cleared.some(isLiveSearchItem)).toBe(false);
  });

  it('CLEAR RESTORES: with no user pills, clearing leaves no filter at all', () => {
    const searched = roundTrip(
      composeLiveSearchFilters({
        query: 'bob',
        searchableFields,
        entity,
        base: [],
      }),
    );

    expect(
      composeLiveSearchFilters({
        query: '',
        searchableFields,
        entity,
        base: searched,
      }),
    ).toEqual([]);
  });

  it('SECOND SEARCH REPLACES: alice does not AND onto bob', () => {
    const first = roundTrip(
      composeLiveSearchFilters({
        query: 'bob',
        searchableFields,
        entity,
        base: [],
      }),
    );
    const second = roundTrip(
      composeLiveSearchFilters({
        query: 'alice',
        searchableFields,
        entity,
        base: first,
      }),
    );

    const values = criteria(second).map((item) => item.values?.[0]);
    expect(values).not.toContain('bob');
    expect(values).toContain('alice');
    // Same size as the first search: replaced, not accumulated.
    expect(second.length).toBe(first.length);
  });

  it('SECOND SEARCH REPLACES: repeated searches never accumulate', () => {
    let persisted: any[] = [userPill];

    for (const query of ['bob', 'alice', 'carol', 'dave']) {
      persisted = roundTrip(
        composeLiveSearchFilters({
          query,
          searchableFields,
          entity,
          base: persisted,
        }),
      );
    }

    const values = criteria(persisted).map((item) => item.values?.[0]);
    expect(values).not.toContain('bob');
    expect(values).not.toContain('alice');
    expect(values).not.toContain('carol');

    // PILLS COEXIST — the user's own pill rode through all four searches.
    expect(
      persisted.filter((item) => item.field === 'status' && !isLiveSearchItem(item)),
    ).toHaveLength(1);

    // And a final clear still gets back to just that pill.
    expect(
      composeLiveSearchFilters({
        query: '',
        searchableFields,
        entity,
        base: persisted,
      }),
    ).toEqual([userPill]);
  });

  it('PILLS COEXIST: the live chain is ANDed onto the pills, never nested', () => {
    const composed = roundTrip(
      composeLiveSearchFilters({
        query: 'bob',
        searchableFields,
        entity,
        base: [userPill],
      }),
    );

    // Flat only — a nested `filters` group is mangled by View.tsx:65-84.
    expect(composed.some((item) => Array.isArray(item.filters))).toBe(false);
    // Strictly alternating, criteria at both ends: no dangling operator.
    expect(composed[0]?.type).toBe('criteria');
    expect(composed[composed.length - 1]?.type).toBe('criteria');
    composed.forEach((item, index) => {
      expect(item.type).toBe(index % 2 === 0 ? 'criteria' : 'operator');
    });
    // The join between the live chain and the pills is an `and`.
    expect(
      composed.find((item) => item.operator === 'and')?.type,
    ).toBe('operator');
  });

  it('NAV-AWAY: the persisted filter can rehydrate the input box', () => {
    const persisted = roundTrip(
      composeLiveSearchFilters({
        query: 'bob',
        searchableFields,
        entity,
        base: [userPill],
      }),
    );

    // A remount reads this back, so the box and the rows agree.
    expect(readLiveSearchQuery(persisted)).toBe('bob');
  });

  it('NAV-AWAY: a filter with no live search rehydrates to an empty box', () => {
    expect(readLiveSearchQuery([userPill, andOperator])).toBe('');
    expect(readLiveSearchQuery([])).toBe('');
    expect(readLiveSearchQuery(undefined as any)).toBe('');
  });

  it('NAV-AWAY: prefers a text field over the digits-only phone criteria', () => {
    const persisted = roundTrip(
      composeLiveSearchFilters({
        query: '(415) 555-0142',
        searchableFields,
        entity,
        base: [],
      }),
    );

    // raw_phone_number holds '4155550142'; the box must show what was typed.
    expect(readLiveSearchQuery(persisted)).toBe('(415) 555-0142');
  });

  it('stripLiveSearchFilters leaves an untagged filter untouched', () => {
    const base = [userPill, andOperator];
    expect(stripLiveSearchFilters(base)).toEqual(base);
    expect(stripLiveSearchFilters([])).toEqual([]);
    expect(stripLiveSearchFilters(undefined as any)).toEqual([]);
  });
});
