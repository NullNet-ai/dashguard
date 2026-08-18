import { ulid } from 'ulid';

import { type ISearchItem } from '~/components/platform/Grid/Search/types';

// WP-837: the "Show Grid" list on Role Wizard Step 1 (Basic Details) must show
// Draft records only. The FormFilter List builds its `advance_filters` solely
// from `searchConfig.query_params.default_advance_filters`, so the Draft
// restriction has to live here — `statusesIncluded` is a selectability gate
// only and does not filter rows out.
//
// Exactly ONE criteria entry: List.tsx appends a trailing `{ type: 'operator',
// operator: 'and' }` when `default_advance_filters.length > 1`, which produces a
// malformed query tail.
export const defaultAdvanceFilter = [
  {
    entity: 'user_roles',
    operator: 'equal',
    type: 'criteria',
    field: 'status',
    id: ulid(),
    label: 'Status',
    values: ['Draft'],
    default: true,
  },
] as ISearchItem[];

export const draftOnlySearchConfig = (pluck?: string[]) => ({
  query_params: {
    entity: 'user_role',
    pluck,
    default_advance_filters: defaultAdvanceFilter as {
      entity: string;
      operator: string;
      type: string;
      field: string;
      values: string[];
    }[],
    default_sorting: [
      {
        id: 'created_date',
        desc: true,
        sort_key: 'created_date',
      },
    ],
  },
});
