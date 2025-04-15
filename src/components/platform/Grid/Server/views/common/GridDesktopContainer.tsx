'use client'

import { useContext } from 'react'

import { Card } from '~/components/ui/card'
import { Table, TableHeader } from '~/components/ui/table'

import { GridContext } from '../../../Provider'
import MyTableBody from '../../../TableBody'
import MyTableHead from '../../../TableHead'

import GridCardView from './GridCardview'

const GridDesktopContainer = ({ parentType }: any) => {
  const { state } = useContext(GridContext)

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
      style={{ width: state?.table?.getCenterTotalSize() }}
    >
      <TableHeader>
        <MyTableHead />
      </TableHeader>
      <MyTableBody />
    </Table>
  )
};

export default GridDesktopContainer
