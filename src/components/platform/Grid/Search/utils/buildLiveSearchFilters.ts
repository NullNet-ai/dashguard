import { type ISearchableField, type ISearchItem } from '../types';

interface IBuildLiveSearchFilters {
  query: string;
  searchableFields: ISearchableField[];
  entity: string;
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
          ? [{ type: 'operator', operator: 'or' } as ISearchItem]
          : []),
        {
          type: 'criteria',
          operator: 'like',
          ...field,
          entity: field?.entity || entity,
          values: [value],
          is_search: true,
        } as ISearchItem,
      ];
    },
    [],
  );
}

export default buildLiveSearchFilters;
