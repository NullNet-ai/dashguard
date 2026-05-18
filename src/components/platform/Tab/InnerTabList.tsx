import { headers } from 'next/headers';

import { api } from '~/trpc/server';

import { toCapitalize } from '~/lib/capitalize';
import { pluralize } from '~/server/utils/pluralize';
import InnerTabItems from './InnerTabItems';
import RefreshButton from './RefreshButton';
import { type InnerTabsProps } from './type';

const getSessionTabs = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const fullSearchQueryParams =
    headerList.get('x-full-search-query-params') || '';
  const [, portal, mainEntity, application, identifier, step] =
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
  const grid = stateTabs.find((item) => item.name === 'Grid');
  const gridHref = `/${portal}/${mainEntity}/grid`;
  const hasIdentifier = stateTabs?.find((item) => item.name === identifier);

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

  const newTabs = stateTabs.map((tab) => {
    let path;
    let href;
    const main = `/${portal}/${mainEntity}/${application}/${identifier}`;
    const [, , , _application, _current] = tab.href.split('/');

    if (tab?.name === 'Grid') {
      path = pathname;
      href = tab.href.replace(/\/\d+$/, '');
    } else if (
      _application === 'record' &&
      !_current?.includes('current_tab')
    ) {
      path = `${main}/${fullSearchQueryParams}`;
      href = `${tab.href}/${fullSearchQueryParams}`;
    } else {
      path = `${main}`;
      href = tab.href;
    }

    return {
      ...tab,
      name: tab.name,
      href,
      label:
        tab.name === 'Grid'
          ? `All ${toCapitalize(pluralize(entity || ''))}`
          : tab.name,
      current: href.match(path) ? true : false,
    };
  });

  if (!grid) {
    newTabs.unshift({
      name: 'Grid',
      href: gridHref,
      current: true,
      label: `All ${toCapitalize(pluralize(entity || ''))}`,
    });
  }

  if (application === 'wizard' && !hasIdentifier && identifier) {
    newTabs.splice(1, 0, {
      name: identifier,
      href: pathname,
      current: true,
      label: identifier,
    });
  }

  if (application === 'wizard' && hasIdentifier && step) {
    const lastChar = hasIdentifier.href.slice(-1);

    if (/\d/.exec(step) && /\d/.exec(lastChar)) {
      const modifiedHref = hasIdentifier.href.slice(0, -1) + `${step}`;
      const currentTab = newTabs.findIndex((item) => item.name === identifier);
      if (currentTab !== -1) {
        newTabs[currentTab].href = modifiedHref;
      }
    }
  }

  if (application === 'record' && !hasIdentifier && identifier) {
    newTabs.splice(1, 0, {
      name: identifier,
      href: `${pathname}?${fullSearchQueryParams}`,
      current: true,
      label: identifier,
    });
  }

  await api.tab.insertSubTabs({
    current_context: currentContext,
    tabs: newTabs,
  });

  return newTabs.filter(Boolean)
}

const InnerTabs = async ({ variant = 'dropdown' }: InnerTabsProps) => {
  try {
    const headerList = await headers();
    const pathname = headerList.get('x-pathname') || '';
    const [, portal, mainEntity, application, identifier] = pathname.split('/') || [];
    
    let newTabs = await getSessionTabs();
    const copiedNewTabs = [...newTabs];
    if (!newTabs?.length) {
      console.error('No tabs found for path:', pathname);
      
      let entity = mainEntity;
      switch (mainEntity) {
        case 'user_role':
          entity = 'role';
          break;
        case 'account_organization':
          entity = 'account';
          break;
      }
      
      const gridHref = `/${portal}/${mainEntity}/grid`;
      const gridTab = {
        name: 'Grid',
        href: gridHref,
        current: application === 'grid',
        label: `All ${toCapitalize(pluralize(entity || ''))}`,
      };
      
      newTabs = [gridTab];
      
      if (application !== 'grid' && identifier) {
        newTabs.push({
          name: identifier,
          href: pathname,
          current: true,
          label: identifier,
        });
      }
      
      try {
        await api.tab.insertSubTabs({
          current_context: '/' + portal + '/' + mainEntity,
          tabs: newTabs,
        });
      } catch (error) {
        console.error('Failed to save default tabs:', error);
      }
    }

    const withIDTabs = newTabs.map((tab) => {
      return {
        ...tab,
        id: tab.name,
      };
    });

    return (
      <div className="relative">
       {!copiedNewTabs?.length && <div className="absolute right-2 top-1 z-10">
          <RefreshButton />
        </div>}
        
        {!withIDTabs?.length ? (
          <div className="relative h-2 overflow-hidden">
            <div className="animate-slide absolute left-0 top-0 h-[3px] w-full bg-blue-500"></div>
          </div>
        ) : (
          <InnerTabItems pathname={pathname} tabs={withIDTabs} variant={variant} />
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