'use server';
import { api } from '~/trpc/server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export const saveGridFilter = async (data: any, gridKey?: string) => {
  const createdCustomFilter = await api.gridFilter.createGridFilter({
    ...data,
    gridKey,
  });
  revalidatePath(createdCustomFilter?.href);
  return createdCustomFilter;
};

export const updateGridFilter = async (data: any, gridKey?: string) => {
  const updatedGridFilter = await api.gridFilter.updateGridFilter({
    ...data,
    gridKey,
  });
  const headerList = headers();
  const fullUrl = headerList.get('x-full-pathname') || '';
  revalidatePath(updatedGridFilter?.href || fullUrl);
  return updatedGridFilter;
};

export const updateAllFilterdata = async (tabs: any[]) => {
  await api.gridFilter.updateGridAllFilter({ tabs });
  const headerList = headers();
  const fullUrl = headerList.get('x-full-pathname') || '';
  revalidatePath(fullUrl);
};

export const removeGridFilter = async (id: string, gridKey?: string) => {
  const url = await api.gridFilter.removeGridFilter({
    id,
    gridKey,
  });
  const headerList = headers();
  const fullUrl = headerList.get('x-full-pathname') || '';
  revalidatePath(fullUrl);
  return url;
};

export const duplicateFilterTab = async (
  tab: Record<string, any>,
  gridKey?: string,
  entity?: string,
) => {
  const url = await api.gridFilter.duplicateGridFilter({
    tab,
    gridKey,
    entity,
  });
  const headerList = headers();
  const fullUrl = headerList.get('x-full-pathname') || '';
  revalidatePath(fullUrl);
  return url;
};

interface Filter {
  operator: string;
  type: 'criteria' | 'operator';
  field?: string;
  values?: any[];
  default?: boolean;
}

interface FilterGroup {
  id: string;
  groupOperator: string;
  filters: Filter[];
}

interface FilterDetails {
  filter_groups: FilterGroup[];
}

interface TransformedFilters {
  resolveDefaultFilter: any[];
  resolveGroupFilter: any[];
}

// Helper function to get entity from column or fallback
const getEntityFromColumn = (column: any, grid_entity: string) => {
  return column?.search_config?.entity || grid_entity || column?.entity;
};

// Helper function to transform values based on field type
const transformValues = (field: string, values: any[]) => {
  // Handle phone numbers
  if (field.includes('phone_number')) {
    return values.map((obj: any) => obj?.replace(/[^\d]/g, ''));
  }
  
  // Handle object values with 'value' property
  if (Array.isArray(values) && values.length > 0 && typeof values[0] === 'object') {
    return values.map((obj: any) => obj.value);
  }
  
  // Handle regular array values
  if (Array.isArray(values)) {
    return values;
  }
  
  // Handle single value
  return [values];
};

// Helper function to transform a criteria filter
const transformCriteriaFilter = (filter: Filter, column: any, grid_entity: string) => {
  return {
    ...filter,
    entity: getEntityFromColumn(column, grid_entity),
    field: column?.search_config?.field || filter.field,
    operator: column?.search_config?.operator || filter.operator,
    parse_as: column?.search_config?.parse_as,
    default: filter.default || true,
    values: transformValues(filter.field!, filter.values || [])
  };
};

export const transformFilterGroups = async ({
  filterDetails,
  columns,
  grid_entity,
  customDefaultFilter = [],
}: {
  filterDetails: FilterDetails;
  columns: any[];
  grid_entity: string;
  customDefaultFilter?: any[];
}): Promise<TransformedFilters> => {
  // Handle empty filter groups
  if (!filterDetails?.filter_groups?.length) {
    return { resolveDefaultFilter: [], resolveGroupFilter: [] };
  }

  // Handle single filter group
  if (filterDetails.filter_groups.length === 1) {
    let resolveDefaultFilter = filterDetails.filter_groups.reduce(
      (acc: any, curr) => {
        // Add group operator if accumulator already has items
        if (acc.length) {
          curr.filters = [
            { operator: curr.groupOperator, type: 'operator', default: true },
            ...curr.filters,
          ];
        }
        
        // Skip empty filters
        const firstFilter = curr.filters[0];
        if (
          !acc.length &&
          !firstFilter?.field &&
          !firstFilter?.values?.length &&
          curr.filters.length
        ) {
          return acc;
        }
        
        // Transform each filter
        return [...acc, ...curr.filters].map((item) => {
          if (item.type === 'criteria') {
            const column = columns.find(col => col.accessorKey === item.field);
            return transformCriteriaFilter(item, column, grid_entity);
          }
          return item;
        });
      },
      []
    );
    
    // Add custom default filters if provided
    if (customDefaultFilter?.length) {
      resolveDefaultFilter = [
        ...resolveDefaultFilter,
        { type: 'operator', operator: 'and', default: true },
        ...customDefaultFilter,
      ];
    }

    return {
      resolveDefaultFilter,
      resolveGroupFilter: [],
    };
  }

  // Handle multiple filter groups
  let resolveGroupFilter = filterDetails.filter_groups.reduce(
    (acc: any, group, index) => {
      // Add group operator for groups after the first one
      if (index > 0) {
        acc.push({ type: 'operator', operator: group.groupOperator });
      }
      
      // Process filters in the current group
      acc.push({
        type: 'criteria',
        filters: group.filters.reduce((filtersAcc: any, filter) => {
          if (filter.type === 'criteria') {
            const column = columns.find(col => col.accessorKey === filter.field);
            filtersAcc.push(transformCriteriaFilter(filter, column, grid_entity));
          } else if (filter.type === 'operator') {
            filtersAcc.push({
              type: 'operator',
              operator: filter.operator,
              default: filter.default || true,
            });
          }
          return filtersAcc;
        }, []),
      });
      return acc;
    },
    []
  );

  // Add custom default filters to each criteria group if provided
  if (customDefaultFilter?.length) {
    resolveGroupFilter = resolveGroupFilter.map((item: any) => {
      if (item?.type === 'criteria') {
        return {
          ...item,
          filters: [
            ...item.filters,
            { type: 'operator', operator: 'and', default: true },
            ...customDefaultFilter,
          ],
        };
      }
      return item;
    });
  }

  return { resolveDefaultFilter: [], resolveGroupFilter };
};
