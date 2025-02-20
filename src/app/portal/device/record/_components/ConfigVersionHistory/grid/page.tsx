import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'

import Grid from '~/components/platform/Grid/Client'
import { Separator } from '~/components/ui/separator'
import { api } from '~/trpc/react'

import RawData from '../ConfigChangesRawData'

import gridColumns from './_config/columns'
import { SidebarProvider } from '~/components/ui/sidebar'

export default function ConfigHistoryGrid(props: Record<string, any>) {
  const { params } = props
  const { data } = api.deviceConfiguration.fetchDeviceConfigurations.useQuery({
    code: params?.code,
  })
  const { items = [], totalCount } = data || {}

  const [showGrid, setShowGrid] = useState(true)

  return (
    <>
      <Separator />
      {showGrid
        ? (
          <SidebarProvider defaultOpen={false} className='block'>

            <Grid
            config = { {
                statusesIncluded: ['draft', 'active', 'Draft', 'Active'],
                entity: 'device_configurations',
                title: 'Configuration',
                columns: gridColumns,
                defaultValues: {
                  categories: ['Firewall'],
                },
                disableDefaultAction: true,
                actionType: 'single-select',
                hideColumnsOnMobile: ['select'],
                enableRowClick: true,
                rowClickCustomAction: () => {
                  setShowGrid(false)
                },

              }}
            data = {items}
            totalCount = { totalCount}
          />
          </SidebarProvider>
          )
        : (
          <>
              <button
              className="flex items-center space-x-2 text-black-500 hover:text-black-700"
              onClick={() => setShowGrid(true)}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className='font-bold'>All Changes</span>
            </button>
              <Separator />
              <RawData />
            </>
          )}
    </>
  )
}
