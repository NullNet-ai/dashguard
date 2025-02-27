'use client';

import { createContext, useContext, useState } from 'react';
import { saveGridFilter } from './actions';
import { useSideDrawer } from '~/components/platform/SideDrawer';

interface ManageFilterContextType {
  state: {
    tab_props: any;
    filterDetails: any;
    columns: Record<string,any>[]
    createFilterLoading: boolean;
  };
  actions: {
    handleUpdateFilter: (data : any) => void;
    handleCreateNewFilter: () => void;
    handleSaveFilter: () => void;
  };
}


const ManageFilterContext = createContext<ManageFilterContextType | undefined>(undefined);

export function ManageFilterProvider({ children, tab, columns }: { children: React.ReactNode; tab: any, columns: Record<string,any> }) {
  console.log("🚀 ~ ManageFilterProvider ~ columns:", columns)
  const { actions } = useSideDrawer();
  const { closeSideDrawer } = actions ?? {};
  const [filterDetails, setFilterDetails] = useState<any>(tab);
  console.log("🚀 ~ ManageFilterProvider ~ filterDetails:", filterDetails)
  const [createFilterLoading, setCreateFilterLoading] = useState(false);

  const handleUpdateFilter = (data : any) => {
    setFilterDetails({
      ...filterDetails,
     ...data
    });
  };

  const handleSaveFilter = async() => {
    setCreateFilterLoading(true);
    const saveFilter = await saveGridFilter(filterDetails);

    setCreateFilterLoading(false)
    return saveFilter
  };

  const handleCreateNewFilter = async() => {

    // !Temporary solution
    // todo: remove this temporary solution
    const modifyFilterDetails = {
      ...filterDetails,
      default_filter : filterDetails.default_filter.map((item: any) => {
        return {
          ...item,
          values: [item.values]
        }
      }),
      sorts : filterDetails.sorts.map((item: any) => {
        return {
         id: item.value,
         desc : item.desc,
        }
      })
    }
    
    // Implementation for creating new filter
    setCreateFilterLoading(true);
    await saveGridFilter(modifyFilterDetails);
    setCreateFilterLoading(false)
    // closeSideDrawer()
  };

  return (
    <ManageFilterContext.Provider
      value={{
        state: {
          tab_props: tab,
          filterDetails,
          columns,
          createFilterLoading
        },
        actions: {
          handleUpdateFilter,
          handleCreateNewFilter,
          handleSaveFilter
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