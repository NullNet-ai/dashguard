'use client';

import { createContext, useContext, useState } from 'react';

interface ManageFilterContextType {
  state: {
    filterName: string;
    activeTab: string;
    tab_props: any;
    filterDetails: any;
  };
  actions: {
    setFilterName: (name: string) => void;
    setActiveTab: (tab: string) => void;
    handleUpdateFilter: (data : any) => void;
    handleCreateNewFilter: () => void;
  };
}

const sample_filter = {
  "name": "Draft",
  "current": false,
  "href": "/portal/contact/grid?filter_id=01JMJZ6MXK4FS8AFGMR99GGSA4",
  "default": true,
  "default_filter": [
      // {
      //     "operator": "equal",
      //     "type": "criteria",
      //     "field": "status",
      //     "id": "01JMJZ6MXK2KCTH9HA1PWK5SRV",
      //     "label": "Status",
      //     "values": [
      //         "Draft"
      //     ],
      //     "default": true
      // }
  ],
  "id": "01JMJZ6MXK4FS8AFGMR99GGSA4"
}

const ManageFilterContext = createContext<ManageFilterContextType | undefined>(undefined);

export function ManageFilterProvider({ children, tab }: { children: React.ReactNode; tab: any }) {
  const [filterName, setFilterName] = useState(tab.name || 'New Filter');
  const [activeTab, setActiveTab] = useState('filter');
  const [filterDetails, setFilterDetails] = useState<any>(sample_filter);
  console.log("🚀 ~ ManageFilterProvider ~ filterDetails:", filterDetails)

  const handleUpdateFilter = (data : any) => {
    // Implementation for updating filter
    console.info('Updating filter:', { filterName, tab });
    setFilterDetails({
      ...filterDetails,
     ...data
    });
  };

  const handleCreateNewFilter = () => {
    // Implementation for creating new filter
    console.info('Creating new filter:', { filterName });
  };

  return (
    <ManageFilterContext.Provider
      value={{
        state: {
          filterName,
          activeTab,
          tab_props: tab,
          filterDetails
        },
        actions: {
          setFilterName,
          setActiveTab,
          handleUpdateFilter,
          handleCreateNewFilter,
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