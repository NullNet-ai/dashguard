'use client';

import { useContext } from 'react';

import { Card } from '~/components/ui/card';
import { Table, TableHeader } from '~/components/ui/table';

import { GridContext } from '../Provider';
import MyTableBody from '../TableBody';
import MyTableHead from '../TableHead';

import GridCardView from './GridCardview';
import { usePathname } from 'next/navigation';
import { testIDFormatter } from '~/utils/formatter';

interface IProps {
  parentType?: any;
  isLoading?: boolean;
}

const GridDesktopContainer = ({ parentType, isLoading }: IProps) => {
  const { state } = useContext(GridContext);
  const path = usePathname();
  const [, , entity] = path.split('/');
  const CustomRenderCardParent = state?.config?.CustomRenderCardParent;

  if (state?.viewMode === 'card') {

    if(CustomRenderCardParent) {
        return (
          <div className='px-2'>
            <CustomRenderCardParent parentType={parentType} states={state} />
          </div>
        )
    }

    return (
      <Card className="col-span-full border-0 py-4 shadow-none">
        {/* <CardHeader>
        <Header />
      </CardHeader> */}
        <section>
          <div className="px-2">
              <GridCardView parentType={parentType} />
          </div>
        </section>
      </Card>
    );
  }

  return (
    <Table
      style={{ width: state?.table?.getCenterTotalSize(), minWidth: '100%' }}
      data-test-id={`${testIDFormatter(`${entity}-grd-tbl`)}`}
    >
      <TableHeader data-test-id={`${testIDFormatter(`${entity}-grd-tbl-hdr`)}`}>
        <MyTableHead />
      </TableHeader>
      <MyTableBody isLoading={isLoading} parentType={parentType} />
    </Table>
  );
};

export default GridDesktopContainer;
