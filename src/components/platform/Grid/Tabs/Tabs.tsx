import { api } from '~/trpc/server';
import GridTabLists from './_components/GridTablists';

const GridTabs = async () => {
  const gridTabsData = await api.grid.getSessionGridTabs();
  return (
      <GridTabLists tabs={gridTabsData}/>
  );
};

export default GridTabs;
