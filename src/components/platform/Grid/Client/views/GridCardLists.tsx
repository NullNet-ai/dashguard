'use client'

import { useContext, useState } from 'react';
import { GridContext } from '../../Provider';
import { remToPx } from '~/utils/fetcher';
import useWindowSize from '~/hooks/use-resize';
import { useSidebar } from '~/hooks/use-sidebar';
import GridCardListItem from './GridCardListItem';


const GridCardLists = ({ parentProps }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const { state, actions } = useContext(GridContext);
  const { isOpen: sidebarOpen } = useSidebar();
  const { width } = useWindowSize();
  const newWidth = width <= 0 ? 1920 : width;
  const _width = sidebarOpen ? newWidth - remToPx(17) : newWidth - remToPx(6);

  const { open, summary } = parentProps || {};

  return (
    <>
      {state?.table.getRowModel().rows?.length
        ? state?.table.getRowModel().rows.map((row) => {
            return  <GridCardListItem row={row} key={row.id}/>
          })
        : null}
    </>
  );

};

export default GridCardLists;
