'use client'

import { EllipsisVertical } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { DropdownMenu, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { type ITabGrid } from '~/server/api/types'

import TabGridMenu from '../../Tabs/TabGridMenu'

interface IProps {
  filter_id: string
  tab?: ITabGrid
}

const GridTabMenu = ({ filter_id, tab }: IProps) => {
  const [filterData, setFilterData] = useState<any>(null)
  const [sortData, setSortData] = useState<any>(null)
  const pathname = usePathname()
  const main_entity = pathname.split('/')[2]

  useEffect(() => {
    const fetchData = async () => {
      // Fetch filters
      const filtersRes = await fetch(`/api/grid/filters?filter_id=${filter_id}`)
      const filtersData = await filtersRes.json()
      if (filtersData) {
        setFilterData({
          raw: filtersData,
          converted: filtersData.map((filter: any) => ({
            field_label: filter.field,
            operator_label: filter.operator,
            values: filter.values,
          })),
        })
      }

      // Fetch sorts
      const sortsRes = await fetch(`/api/grid/sorts?filter_id=${filter_id}`)
      const sortsData = await sortsRes.json()
      setSortData(sortsData)
    };

    void fetchData()
  }, [filter_id])

  if (tab?.name === `All ${main_entity?.toLowerCase()}`) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <EllipsisVertical
            className="text-default/60 h-4 w-4 font-semibold"
            aria-hidden="true"
          />
        </div>
      </DropdownMenuTrigger>
      <TabGridMenu
        sort_by={sortData}
        tab={tab}
        filter_by={filterData}
        filter_id={filter_id}
      />
    </DropdownMenu>
  )
};

export default GridTabMenu
