import { headers } from 'next/headers';
import React from 'react';

import { cn } from '~/lib/utils';
import { api } from '~/trpc/server';

import TabItems from './TabItems';
import type { IPropsTabList } from './type';
import { loadGetInitialProps } from 'next/dist/shared/lib/utils';

const getSessionTabs = async (): Promise<{
  pathname: string
  newTabs: IPropsTabList[]
}> => {
  const headerList = headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, portal, mainEntity, , ,] = pathname.split('/') || 'New Tab';
  const stateTabs = (await api.tab.getMainTabs()) as IPropsTabList[];
  const currentContext = `/${portal}/${mainEntity}`;



  let newTabs = stateTabs.map((tab) => {
    return {
      ...tab,
      current: tab.name === mainEntity,
      is_current: tab.name === mainEntity,
    };
  });
  


  if (newTabs.length === 0) {
    newTabs = [
      {
        name: mainEntity!,
        href: pathname,
        current: true,
        is_current: true,
      },
    ];
  }

  // if (!newTabs.find(item => item.current === true)) {
  //   newTabs.push({
  //     name: mainEntity!,
  //     href: pathname,
  //     current: true,

  //   });
  // }

  // api.tab.insertMainTabs(newTabs);
  return { pathname, newTabs };
};

export default async function TabList({ className }: { className?: string }) {
  const { newTabs } = await getSessionTabs();

  if (!newTabs?.length) return null;

  const withIDTabs = newTabs.map((tab) => {
    return {
      ...tab,
     id: tab.name,
    }
  })



  return (
    <TabItems items={withIDTabs} />
  );
}
