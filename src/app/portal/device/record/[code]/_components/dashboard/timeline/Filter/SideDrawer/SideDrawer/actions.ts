'use server'
import { api } from '~/trpc/server'

export const saveGridFilter = async (data: any, filter_type: string) => {
  try {
    const saveGridFilter = await api.cachedFilter.createFilter({type: filter_type, data})

    return saveGridFilter
  }
  catch (error) {
    console.log('%c Line:8 🍺 error', 'color:#ffcc00', error)
  }
}

export const updateGridFilter = async (data: any,  filter_type: string) => {
  const updateGridFilter = await api.cachedFilter.updateFilter({ type: filter_type, data})

  return updateGridFilter
}

export const removeFilter = async (id: string,  filter_type: string) => {
  const url = await api.cachedFilter.removeFilter({
    id,
    type: filter_type
  })
  return url
}

export const duplicateFilterTab = async (tab: Record<string, any>,  filter_type: string) => {
  return await api.cachedFilter.duplicateFilter(
    {data: tab, type: filter_type},
  )
}


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

export const transformFilterGroups = async(filterDetails : FilterDetails, columns : any[]) : Promise<TransformedFilters> => {

    if (!filterDetails?.filter_groups?.length) return { resolveDefaultFilter: [], resolveGroupFilter: [] };

    if (filterDetails.filter_groups.length === 1) {
        const resolveDefaultFilter = filterDetails.filter_groups.reduce((acc : any, curr) => {
            if (acc.length) {
                curr.filters = [
                    { operator: curr.groupOperator, type: 'operator', default: true },
                    ...curr.filters,
                ];
            }
            if (
                !acc.length &&
                curr.filters.length &&
                !curr.filters[0]?.field &&
                !curr.filters[0]?.operator &&
                !curr.filters[0]?.values?.length
            ) {
                return acc;
            }
            return [...acc, ...curr.filters].map((item) => {
                if (item.type === 'criteria') {
                    const column = columns.find((col) => col.accessorKey === item.field);
                    const modifyValue = {
                        ...item,
                        entity: column?.search_config?.entity || column?.entity,
                        default: item.default || true,
                        values: item.field === 'raw_phone_number'
                            ? item.values.map((obj: any) => obj?.replace(/[^\d]/g, ''))
                            : Array.isArray(item.values) && item.values.length > 0 && typeof item.values[0] === 'object'
                                ? item.values.map((obj: any) => obj.value)
                                : item.values
                    };
                    return modifyValue;
                }
                return item;
            }
        );
        }, []);
        return { resolveDefaultFilter, resolveGroupFilter: [] };
    }

    const resolveGroupFilter = filterDetails.filter_groups.reduce((acc : any, group, index) => {
        if (index > 0) {
            acc.push({ type: 'operator', operator: group.groupOperator });
        }
        acc.push({
            type: 'criteria',
            filters: group.filters.reduce((filtersAcc : any, filter) => {
                if (filter.type === 'criteria') {
                    const column = columns.find((col) => col.accessorKey === filter.field);
                    filtersAcc.push({
                        type: 'criteria',
                        operator: filter.operator,
                        entity: column?.search_config?.entity || column?.entity,
                        field: filter.field,
                        values:  filter.field === 'raw_phone_number'
                        ? (filter.values ?? []).map((obj: any) => obj?.replace(/[^\d]/g, ''))
                        : Array.isArray(filter.values) && filter.values.length > 0 && typeof filter.values[0] === 'object'
                            ? filter.values.map((obj: any) => obj.value)
                            : filter.values,
                        default: filter.default || true,
                    });
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
    }, []);
    return { resolveDefaultFilter: [], resolveGroupFilter };
}