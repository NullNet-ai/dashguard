import { Card } from '~/components/ui/card';
import GridMobileRow from '../../../Server/views/common/GridMobileRow';
import { cn } from '~/lib/utils';
import { useContext, useMemo } from 'react';
import { useSidebar } from '~/components/ui/sidebar';
import useWindowSize from '~/hooks/use-resize';
import { remToPx } from '~/utils/fetcher';
import { GridContext } from '../../../Provider';
import Search from '../../../Search';
import Sorting from '../../../Sorting';


const GridCardViewClient = ({  parentType,
    hideSearch,
    height,
    showAction,
    parentProps,
    showPagination = false,
    gridLevel = 1,
    isLoading,
    parentExpanded} : any) => {

        const { state, actions } = useContext(GridContext);
        const { open: sidebarOpen } = useSidebar();
        const { width } = useWindowSize();
        const newWidth = width <= 0 ? 1920 : width;
        const _width = sidebarOpen ? newWidth - remToPx(17) : newWidth - remToPx(6);

    const isExpandedTable = parentType === 'grid_expansion';

    const expandedWidth = useMemo(() => {
        if (isExpandedTable) {
          return _width - 90 - (gridLevel === 3 ? 100 : 0);
        } else {
          return undefined;
        }
      }, [isExpandedTable, _width]);

  return (
    <Card className="col-span-full border-0 shadow-none py-4">
             <div
        className={cn(
          `flex flex-col  kani justify-between  grid-client-card-view`,
          `${isExpandedTable ? 'flex-col pl-4' : 'px-4'}`,
        )}
        style={{
          width: '100%',
        }}
      >
        {!hideSearch && <Search parentType={parentType} viewMode='card'/>}
        {/* <GridSearchProvider>
          <SearchDialog />
        </GridSearchProvider> */}
        {['form', 'grid_expansion'].includes(parentType) && (
          <Sorting
            className={cn(`${isExpandedTable ? 'mb-[2px] self-end' : ''}`)}
          />
        )}
      </div>
        <section>
            <div className='pl-4'>
            <GridMobileRow gridLevel={gridLevel}/>
            </div>
        </section>

    </Card>
  )
};

export default GridCardViewClient;