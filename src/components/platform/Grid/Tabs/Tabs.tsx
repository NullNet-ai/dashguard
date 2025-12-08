'use client';


import DraggableTabs from './_components/NewTabLists';
interface IProps {
  gridKey?: string;
  grid_tabs?: any[];
}

const GridTabs = ({ grid_tabs }: IProps) => {

  return <DraggableTabs initialTabs={grid_tabs}/>
};

export default GridTabs;
