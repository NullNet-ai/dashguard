'use client';

import React, { useContext } from 'react';
import { Card, CardHeader } from '~/components/ui/card';
import CreateButton from '../Header/ButtonHeader';
import MobileHeader from '../Header/MobileHeader';
import InfiniteScrollContainer from '../common/InfiniteScroll';
import { GridContext } from '../Provider';
import { Table, TableHeader } from '~/components/ui/table';
import MyTableHead from '../TableHead';
import MyTableBody from '../TableBody';
import { testIDFormatter } from '~/utils/formatter';
import { usePathname } from 'next/navigation';
import { useIsMobile } from '~/hooks/use-mobile';
import { cn } from '~/lib/utils';
import AdvancedScrollbar from '~/components/ui/AdvancedScrollbar';

function GridMobile({ gridKey, grid_tabs, isLoading }: any) {
  const path = usePathname();
  const [, , entity] = path.split('/');
  const { state } = useContext(GridContext);
  const isMobile = useIsMobile();

  const hasGrouping = state?.grouping?.length;

  if (hasGrouping) {
    return (
      <Card className="col-span-full border-0 py-2 pt-0 shadow-none">
        <CardHeader>
          <MobileHeader gridKey={gridKey} grid_tabs={grid_tabs} />
        </CardHeader>

        <AdvancedScrollbar
          className='w-[100dvw] px-2 mb-[6px]'
        >
          <Table
            style={{
              width: '100%',
            }}
            containerClassname=""
            data-test-id={`${testIDFormatter(`${entity}-grd-tbl`)}`}
            showScrollbar={true}
          >
            <TableHeader
              data-test-id={`${testIDFormatter(`${entity}-grd-tbl-hdr`)}`}
              className={cn(`${isMobile ? '!static' : ''}`)}
            >
              <MyTableHead />
            </TableHeader>
            <MyTableBody isLoading={isLoading} />
          </Table>
        </AdvancedScrollbar>
      </Card>
    );
  }

  return (
    <Card className="col-span-full border-0 py-2 pt-0 shadow-none">
      <CardHeader>
        <MobileHeader gridKey={gridKey} grid_tabs={grid_tabs} />
      </CardHeader>
      <section className="px-2 lg:px-0">
        <InfiniteScrollContainer />
        <CreateButton className="fixed bottom-[5rem] right-4 size-10 rounded-full md:bottom-[9rem]" />
      </section>
    </Card>
  );
}

export default GridMobile;
