'use client';

import { createContext, useContext, useState } from 'react';
import { saveGridFilter, transformFilterGroups, updateGridFilter } from './actions';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import { useRouter } from 'next/navigation';
import { AppRouterKeys } from '~/components/platform/Grid/types';
import { ISearchParams } from '../../../Search/types';

interface ManageFilterContextType {
  state: {
    tab_props: any;
    filterDetails: any;
    columns: Record<string, any>[];
    createFilterLoading: boolean;
    searchConfig: any;
    errors: Record<string, any>;
  };
  actions: {
    handleUpdateFilter: (data: any) => void;
    handleCreateNewFilter: () => void;
    handleSaveFilter: () => void;
    saveUpdatedFilter: () => void;
  };
}

const ManageFilterContext = createContext<ManageFilterContextType | undefined>(
  undefined,
);

export function ManageFilterProvider({
  children,
  tab,
  columns,
  searchConfig,
  filter_type
}: {
  children: React.ReactNode;
  tab: any;
  columns: Record<string, any>[];
  searchConfig?: {
    router?: AppRouterKeys;
    resolver?: string;
    query_params?: ISearchParams;
  };
  errors?: Record<string, any>;
  filter_type: string;
}) {
  const { actions } = useSideDrawer();
  const router = useRouter();
  const { closeSideDrawer } = actions ?? {};
  const [filterDetails, setFilterDetails] = useState<any>({
   
    ...tab,
    columns,
  }); 
  console.log("%c Line:51 🌭 filterDetails", "color:#ed9ec7", filterDetails);
  const [createFilterLoading, setCreateFilterLoading] = useState(false);
  const [errors, setErrors] = useState({})
  const handleUpdateFilter = (data: any) => {
    setFilterDetails({
      ...filterDetails,
      ...data,
    });
  };

  function validateCriteria(data: any) {
    const required_fields = ["Time Range", "Resolution", "Graph Type"];
    let errors: any = {};

    data.forEach((item: any, index: number) => {
        if (item.hasOwnProperty("field") && !item.field) {
            errors[`filters.${index}.field`] = "This field is required.";
        }
        if (item.hasOwnProperty("operator") && !item.operator) {
            errors[`filters.${index}.operator`] = "This field is required.";
        }
        if( required_fields.includes(item.field)){
          if (item.hasOwnProperty("values") && !item?.[item.field]) {
            errors[`filters.${index}.${item.field}`] = "This field is required.";
          }
        }else if (item.hasOwnProperty("values") && Array.isArray(item.values) && item.values.length === 0) {
            errors[`filters.${index}.values`] = "This field is required.";
        }
    });

    return Object.keys(errors).length > 0 ? errors : null;
}

  const handleSaveFilter = async () => {
    setCreateFilterLoading(true);
    const saveFilter = await saveGridFilter(filterDetails, filter_type);

    setCreateFilterLoading(false);
    return saveFilter;
  };

  const saveUpdatedFilter = async () => {
    const validateCriteriaErrors = validateCriteria(filterDetails.default_filter)
      if(validateCriteriaErrors) {
        setErrors(validateCriteriaErrors)
        return
      }
    const sorting = filterDetails?.sorts?.length
      ? filterDetails.sorts.map((item: any) => {
          return {
            id: item.value || item.id,
            desc: item.desc,
          };
        })
      : [
          {
            id: 'created_date',
            desc: true,
          },
        ];

    const rawFilterGroup = JSON.parse(
      JSON.stringify(filterDetails?.filter_groups),
    ); // Deep copy to prevent modifications
    const { resolveDefaultFilter, resolveGroupFilter } = await transformFilterGroups(filterDetails, columns);
    const modifyFilterDetails = {
      ...filterDetails,
      default_filter: resolveDefaultFilter,
      sorts: sorting,
      default_sorts: sorting,
      filter_groups: rawFilterGroup,
      group_advance_filters: resolveGroupFilter,
    };

    setCreateFilterLoading(true);
    await updateGridFilter(modifyFilterDetails, filter_type);
    setCreateFilterLoading(false);
    closeSideDrawer();
    router.refresh();
  };

  const handleCreateNewFilter = async () => {
    const validateCriteriaErrors = validateCriteria(filterDetails.default_filter)
    if(validateCriteriaErrors) {
      setErrors(validateCriteriaErrors)
      return
    }
    const sorting = filterDetails?.sorts?.length
      ? filterDetails.sorts.map((item: any) => {
          return {
            id: item.value || item.id,
            desc: item.desc,
          };
        })
      : [
          {
            id: 'created_date',
            desc: true,
          },
        ];

    const rawFilterGroup = JSON.parse(
      JSON.stringify(filterDetails?.filter_groups),
    ); // Deep copy to prevent modifications

    const { resolveDefaultFilter, resolveGroupFilter } = await transformFilterGroups(filterDetails, columns);

    const modifyFilterDetails = {
      ...filterDetails,
      default_filter: resolveDefaultFilter,
      sorts: sorting,
      default_sorts: sorting,
      filter_groups: rawFilterGroup,
      group_advance_filters: resolveGroupFilter,
    };
    setCreateFilterLoading(true);
    await saveGridFilter(modifyFilterDetails, filter_type);
    setCreateFilterLoading(false);
    closeSideDrawer();
    router.refresh();
  };

  return (
    <ManageFilterContext.Provider
      value={{
        state: {
          tab_props: tab,
          filterDetails,
          columns,
          createFilterLoading,
          searchConfig,
          errors: errors || {}
        },
        actions: {
          handleUpdateFilter,
          handleCreateNewFilter,
          handleSaveFilter,
          saveUpdatedFilter,
        },
      }}
    >
      {children}
    </ManageFilterContext.Provider>
  );
}

export const useManageFilter = () => {
  const context = useContext(ManageFilterContext);
  if (!context) {
    throw new Error('useManageFilter must be used within ManageFilterProvider');
  }
  return context;
};
