import { headers } from 'next/headers';

import { api } from '~/trpc/server';

import { toCapitalize } from '~/lib/capitalize';
import RefreshButton from './RefreshButton';
import { type InnerTabsProps } from './type';
import InnerEnhanceTabItems from './InnerEnhanceTabItems';
import { boolean } from 'zod';
import pluralize from 'pluralize';
import { menu_tab_name } from '~/server/menu/menu_tab_name';

const getSessionTabs = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';

  const [, portal, mainEntity, application] =
    pathname.split('/') || 'New Tab';
  const currentContext = '/' + portal + '/' + mainEntity;
  const stateTabs = (await api.tab
    .getSubTabs({
      current_context: currentContext,
    })
    .then((res) => {
      return res?.tabs ?? [];
    })
    .catch((error) => {
      console.error('Error fetching tabs:', error);
      return [];
    })) as any[];


  let entity;
  switch (mainEntity) {
    case 'user_role':
      entity = 'role';
      break;
    case 'account_organization':
      entity = 'account';
      break;
    default:
      entity = mainEntity;
  }

  const label =
    menu_tab_name[mainEntity ?? ''] || toCapitalize(pluralize(entity || ''));

  if(!stateTabs?.length) {
    const mainTab = {
      name: 'grid',
      href: `/${portal}/${mainEntity}/grid`,
      current: application === 'grid',
      label: `All ${label}`,
      default: true
    }

    api.tab?.insertSubTabs({
      current_context: currentContext,
      tabs: [
        mainTab
      ]
    })

    return [
      mainTab
    ]
  }
  // Remove duplicate under stateTabs by name
  const uniqueTabs = stateTabs.filter((tab, index, self) =>
    index === self.findIndex((t) => t.name === tab.name)
  );

  //remove tabs without name
  const filteredTabs = uniqueTabs?.filter(tab => tab?.name)
  return filteredTabs

}

const InnerTabs = async ({ variant = 'dropdown', hasNewButton = false }: InnerTabsProps) => {
  try {
    const headerList = await headers();
    const pathname = headerList.get('x-pathname') || '';
    const newTabs = await getSessionTabs();

    return (
      <div className="relative">
        {!newTabs?.length ? (
          <div className="relative h-2 overflow-hidden">
            <div className="animate-slide absolute left-0 top-0 h-[3px] w-full bg-blue-500"></div>
          </div>
        ) : (
          <InnerEnhanceTabItems  initialTabs={newTabs} hasNewButton={hasNewButton}/>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in InnerTabs:', error);
    return (
      <div className="relative">
        <div className="absolute right-2 top-1 z-10">
          <RefreshButton />
        </div>
        <div className="relative h-2 overflow-hidden">
          <div className="animate-slide absolute left-0 top-0 h-[3px] w-full bg-blue-500"></div>
        </div>
      </div>
    );
  }
};
export default InnerTabs;