'use server';

import { isEmpty, lowerCase } from 'lodash';
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
  customTabDefaults,
  column_alias,
  isTimeline = false,
}: {
  entity?: string;
  field?: string;
  operator?: string;
  value: string;
  searchConfig: any;
  fieldConfig: any;
  customTabDefaults: Record<string, any>;
  column_alias: Record<string, string>;
  isTimeline?: boolean;
}) => {

  const {
    router = 'search',
    resolver = 'searchSuggestions',
    query_params,
    entity,
  } = searchConfig ?? {};

  const fieldValue = fieldConfig?.field || field;
  const fieldOperator = fieldConfig?.operator || 'like';
  
  let fieldValueArray = Array.isArray(value) ? value : [value];
  if (fieldValue.includes('phone_number')) {
    fieldValueArray = fieldValueArray.map((obj: any) => obj?.replace(/[^\d]/g, ''));
  } 

  if (isTimeline && !isEmpty(column_alias)) {
    const search_value = fieldValueArray?.[0] ?? ''
    const new_value = Object.entries(column_alias)
      .map(([key, value]) => ({ key, value }))
      .filter((item: any) => lowerCase(item.value).includes(lowerCase(search_value)))
      .map((item: any) => item.key);

      fieldValueArray = new_value?.length ? new_value : fieldValueArray;
  }
  

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
        field: fieldValue,
        operator: fieldOperator,
        values: fieldValueArray,
        entity: fieldConfig?.entity || entity || 'contact',
        is_search: true,
        ...(fieldConfig?.parse_as ? { parse_as: fieldConfig?.parse_as } : {}),
      },
      ...(customTabDefaults?.defaultAdvanceFilter?.length
        ? [
            {
              type: 'operator',
              operator: 'and',
              default: true,
            },
            ...customTabDefaults?.defaultAdvanceFilter,
          ]
        : []),
    ],
  });

  // Create a Set to track unique values
  // const uniqueValues = new Set();

  const resolvedDropdownItems = items.map((record: any) => {

    const { values, display_value } = record ?? {};
    const value = values[0];
    return {
      label: column_alias?.[display_value] || display_value,
      value: value,
    };
  });

  // const resolvedDropdownItems = items
  //   .flatMap((record: any) => {
  //     const value = record[field!];

  //     switch (typeof value) {
  //       case 'object':
  //         if (Array.isArray(value)) {
  //           return value.map((item: any) => ({
  //             label: item,
  //             value: item,
  //           }));
  //         }
  //         return [
  //           {
  //             label: value?.name || value?.value,
  //             value: value?.value,
  //           },
  //         ];
  //       case 'boolean':
  //         return [
  //           {
  //             label: value ? 'Yes' : 'No',
  //             value: value,
  //           },
  //         ];
  //       case 'number':
  //         return [
  //           {
  //             label: value.toString(),
  //             value: value,
  //           },
  //         ];
  //       case 'string':
  //         return [
  //           {
  //             label: value,
  //             value: value,
  //           },
  //         ];
  //       default:
  //         return [
  //           {
  //             label: value,
  //             value: value,
  //           },
  //         ];
  //     }
  //   })
  //   .filter((item: Record<string, any>) => {
  //     if (item.value != null && !uniqueValues.has(item.value)) {
  //       uniqueValues.add(item.value);
  //       return true;
  //     }
  //     return false;
  //   });

  return resolvedDropdownItems;
};
