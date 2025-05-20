'use client'

import { useContext } from 'react'

import { Card } from '~/components/ui/card'
import { Table, TableHeader } from '~/components/ui/table'

import { GridContext } from '../Provider'
import MyTableBody from '../TableBody'
import MyTableHead from '../TableHead'

import GridCardView from './GridCardview'
import { usePathname } from 'next/navigation'
import { testIDFormatter } from '~/utils/formatter'

const GridDesktopContainer = ({ parentType }: any) => {
  const { state } = useContext(GridContext)
  const path =  usePathname()
  const [, , entity] = path.split('/')

  if (state?.viewMode === 'card') {
    return (
      <Card className="col-span-full border-0 shadow-none py-4">
        {/* <CardHeader>
        <Header />
      </CardHeader> */}
        <section>
          <div className='px-2'>
            <GridCardView parentType={parentType} />
          </div>
        </section>

      </Card>
    )
  }

  return (
    <Table
      style={{ width: state?.table?.getCenterTotalSize(), minWidth: '100%' }}
      data-test-id={`${testIDFormatter(`${entity}-grd-tbl`)}`}
    >
      <TableHeader data-test-id={`${testIDFormatter(`${entity}-grd-tbl-hdr`)}`}>
        <MyTableHead />
      </TableHeader>
      <MyTableBody />
    </Table>
  )
};

export default GridDesktopContainer
