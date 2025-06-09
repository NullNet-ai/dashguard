'use client';

import EnhanceGridTabs from './_components/EnhanceTabs';
interface IProps {
  gridKey?: string;
  grid_tabs?: any[];
}

const GridTabs = ({ grid_tabs }: IProps) => {

  return <EnhanceGridTabs tabs={grid_tabs?? []} />;
  // return <GridTabLists tabs={grid_tabs ?? []} />;
};

export default GridTabs;
