import { api } from '~/trpc/server';
import GridTabLists from './_components/GridTablists';

interface IProps {
  gridKey?: string;
}

const GridTabs = async ({ gridKey }: IProps) => {
  const gridTabsData = await api.grid.getSessionGridTabs({ gridKey });
  return <GridTabLists tabs={gridTabsData} />;
};

export default GridTabs;

