import { type ISearchableField, type ISearchItem } from '../types';

interface IBuildLiveSearchFilters {
  query: string;
  searchableFields: ISearchableField[];
  entity: string;
}

interface IComposeLiveSearchFilters extends IBuildLiveSearchFilters {
  /** Whatever the grid currently has persisted (`gridState.advanceFilter`). */
  base?: ISearchItem[];
}

/**
 * WP-828 — every item the live search injects carries an `id` starting with
 * this prefix.
 *
 * `id` is the tag rather than `is_search` on purpose: `is_search` is stripped
 * by the `updateReportFilter` zod input schema (grid.ts:739-756, no
 * `.passthrough()`), so a criteria tagged with it comes back from Redis
 * untagged and can never be told apart from a user-set pill. `id` is already in
 * that schema, already survives the round trip via `reportFilters`
 * (grid.ts:970, raw), and is already dropped before the ORM query by
 * `getReportCachedData`'s advanceFilter map — so tagging costs no server change
 * and sends nothing new to the store.
 *
 * Ids are unique per item so React list keys stay stable.
 */
export const LIVE_SEARCH_ID_PREFIX = 'live_search:';

const liveSearchId = (index: number) => `${LIVE_SEARCH_ID_PREFIX}${index}`;

/** True for any criteria *or* operator this module injected. */
export function isLiveSearchItem(item?: ISearchItem | null): boolean {
  const id = (item as { id?: unknown } | undefined | null)?.id;

  return typeof id === 'string' && id.startsWith(LIVE_SEARCH_ID_PREFIX);
}

/**
 * Drop a previous live search from a persisted filter, leaving the user's own
 * advance-filter pills untouched. Operators are tagged too, so the OR chain and
 * its joining `and` come out together and never leave a dangling operator.
 */
export function stripLiveSearchFilters(
  items: ISearchItem[] = [],
): ISearchItem[] {
  return (items ?? []).filter((item) => !isLiveSearchItem(item));
}

/**
 * Recover the query text a persisted live search was built from, so a remount
 * (navigate away and back) can rehydrate the input instead of showing an empty
 * box over a still-filtered grid.
 *
 * `raw_phone_number` criteria hold the digits-only form, so they are only used
 * when nothing else is available.
 */
export function readLiveSearchQuery(items: ISearchItem[] = []): string {
  const criteria = (items ?? []).filter(
    (item) => isLiveSearchItem(item) && item?.type === 'criteria',
  );
  const preferred =
    criteria.find((item) => item?.field !== 'raw_phone_number') ?? criteria[0];
  const value = preferred?.values?.[0];

  return typeof value === 'string' ? value : '';
}

/**
 * WP-828 — builds the flat OR-chain of `like` criteria a live search needs.
 *
 * Lifted from the inline reduce in Provider.tsx so it can be tested and reused.
 * The ORM has no `IN` operator, so multi-field match must be an explicit chain
 * of criteria interleaved with `{type:'operator', operator:'or'}` entries —
 * strictly alternating, criteria at both ends (a dangling operator is a
 * malformed query tail). Stays flat: never emits nested `filters`, because the
 * group_advance_filters path in View.tsx mangles them.
 */
export function buildLiveSearchFilters({
  query,
  searchableFields,
  entity,
}: IBuildLiveSearchFilters): ISearchItem[] {
  if (!query?.trim() || !searchableFields?.length) return [];

  return searchableFields.reduce<ISearchItem[]>(
    (acc, { accessorKey: _accessorKey, ...field }) => {
      // Phone numbers are stored digits-only; strip formatting the user typed.
      const value =
        field?.field === 'raw_phone_number'
          ? query.replace(/[^\d]/g, '')
          : query;

      if (!value) return acc;

      return [
        ...acc,
        ...(acc.length
          ? [
              {
                type: 'operator',
                operator: 'or',
                id: liveSearchId(acc.length),
              } as ISearchItem,
            ]
          : []),
        {
          type: 'criteria',
          operator: 'like',
          ...field,
          entity: field?.entity || entity,
          values: [value],
          is_search: true,
          id: liveSearchId(acc.length ? acc.length + 1 : 0),
        } as ISearchItem,
      ];
    },
    [],
  );
}

/**
 * The full filter payload to persist for a given live-search query.
 *
 * Always rebuilds from `base` with any *previous* live search stripped out, so
 * a second search replaces the first instead of ANDing onto it, and an empty
 * query restores exactly the user's own pills.
 */
export function composeLiveSearchFilters({
  query,
  searchableFields,
  entity,
  base = [],
}: IComposeLiveSearchFilters): ISearchItem[] {
  const persisted = stripLiveSearchFilters(base);
  const live = buildLiveSearchFilters({ query, searchableFields, entity });

  if (!live.length) return persisted;

  return [
    ...live,
    ...(persisted.length
      ? [
          {
            type: 'operator',
            operator: 'and',
            id: liveSearchId(live.length),
          } as ISearchItem,
        ]
      : []),
    ...persisted,
  ];
}

export default buildLiveSearchFilters;
