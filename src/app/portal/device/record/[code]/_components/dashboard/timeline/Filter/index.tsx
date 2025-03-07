import React from 'react'

import { ManageFilterProvider } from './components/SideDrawer/Provider'
import FilterProvider from './FilterProvider'
import FilterView from './FilterView'

function Filter() {
  const columns = [
    {
      header: 'Source IP Address',
      label: 'Source IP Address',
      accessorKey: 'source_ip_address',
    },
    {
      header: 'Source Port',
      label: 'Source Port',
      accessorKey: 'source_port',
    },
    {
      header: 'Destination IP Address',
      label: 'Destination IP Address',
      accessorKey: 'destination_ip_address',
    },
    {
      header: 'Destination Port',
      label: 'Destination Port',
      accessorKey: 'destination_port',
    },
    {
      header: 'TCP Protocol',
      label: 'TCP',
      accessorKey: 'tcp',
    },
    {
      header: 'UDP Protocol',
      label: 'UDP',
      accessorKey: 'udp',
    },
    {
      header: 'IP Version',
      label: 'IP Version',
      accessorKey: 'ip_version',
    },
    {
      header: 'Interfaces',
      label: 'Interfaces',
      accessorKey: 'interfaces',
    },
  ]

  const tab = {
    name: 'New Filter',
  }

  return (
    <ManageFilterProvider columns={columns} tab={tab}>
      <FilterProvider>
        <FilterView />
      </FilterProvider>
    </ManageFilterProvider>
  )
}

export default Filter
