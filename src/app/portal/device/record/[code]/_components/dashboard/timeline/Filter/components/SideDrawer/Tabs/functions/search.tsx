'use server';

import { api } from '~/trpc/server';

const pluck = [
  'id',
  'code',
  'categories',
  'organization_id',
  'first_name',
  'middle_name',
  'last_name',
  // "contact_status",
  'status',
  'created_date',
  'updated_date',
  'created_time',
  'updated_time',
  'created_by',
  'updated_by',
];
export const searchRecords = async ({
  field,
  operator,
  value,
  searchConfig,
  fieldConfig,
}: {
  entity?: string;
  field?: string;
  operator?: string;
  value: string;
  searchConfig: any;
  fieldConfig: any;
}) => {
  const {
    router = 'contact',
    resolver = 'main_grid',
    query_params,
    entity,
  } = searchConfig ?? {};
  const { items = [] } = await (api as any)?.[router as string]?.[
    resolver as string
  ]?.({
    current: 0,
    limit: 100,
    entity,
    pluck: query_params?.pluck || pluck,
    advance_filters: [
      {
        type: 'criteria',
        field: fieldConfig?.field || field,
        operator: fieldConfig?.operator || 'like',
        values: Array.isArray(value) ? value : [value],
        entity: fieldConfig?.entity || entity || 'contact',
        ...(fieldConfig?.parse_as ? { parse_as: fieldConfig?.parse_as } : {}),
      },
    ],
  });

  // Create a Set to track unique values
  const uniqueValues = new Set();

  const resolvedDropdownItems = items
    .flatMap((record: any) => {
      const value = record[field!];

      switch (typeof value) {
        case 'object':
          if (Array.isArray(value)) {
            return value.map((item: any) => ({
              label: item,
              value: item,
            }));
          }
          return [
            {
              label: value?.name || value?.value,
              value: value?.value,
            },
          ];
        case 'boolean':
          return [
            {
              label: value ? 'Yes' : 'No',
              value: value,
            },
          ];
        case 'number':
          return [
            {
              label: value.toString(),
              value: value,
            },
          ];
        case 'string':
          return [
            {
              label: value,
              value: value,
            },
          ];
        default:
          return [
            {
              label: value,
              value: value,
            },
          ];
      }
    })
    .filter((item: Record<string, any>) => {
      if (item.value != null && !uniqueValues.has(item.value)) {
        uniqueValues.add(item.value);
        return true;
      }
      return false;
    });

  return resolvedDropdownItems;
};
