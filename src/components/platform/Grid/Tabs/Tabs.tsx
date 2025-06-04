'use client';

import GridTabLists from './_components/GridTablists';
interface IProps {
  gridKey?: string;
  grid_tabs?: any[];
}

const GridTabs = ({ grid_tabs }: IProps) => {

  return <GridTabLists tabs={grid_tabs ?? []} />;
};

export default GridTabs;
