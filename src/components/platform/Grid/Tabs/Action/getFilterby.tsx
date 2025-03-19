'use server'

import { api } from '~/trpc/server';

export const get_filter_by = async (filter_id: any) =>{
    await api.grid.getFilters({ filter_id }).then((data) => {
        if (!data)
          return {
            raw: [],
            converted: [],
          };
        return {
          raw: data,
          converted: data?.map((filter) => {
            return {
              field_label: filter.field,
              operator_label: filter.operator,
              values: filter.values,
            };
          }),
        };
      });
}

 export  const get_sort_by = async (filter_id: any) => {
    await api.grid.getSorts({ filter_id }).then((data) => {
        if (!data) return null;
        return data;
      });
 }