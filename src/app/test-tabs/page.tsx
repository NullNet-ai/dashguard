import Tablists from './_components/TabLists';
import { api } from '~/trpc/server';
import { headers } from 'next/headers';

const getTabs = async () => {
  const headerList = headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, portal, mainEntity, , ,] = pathname.split('/') || 'New Tab';
  const stateTabs = (await api.tab.getMainTabs()) as any[];
  const currentContext = `/${portal}/${mainEntity}`;

  return {
    tabs: stateTabs,
    currentContext
  }
}

export default async function Page() {
  // Get tabs from api 
  const { tabs, currentContext } = await getTabs();

  return (
    <div>
      <Tablists tabs={tabs} />
    </div>
  )
}

