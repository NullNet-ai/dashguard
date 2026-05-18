'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { api } from '~/trpc/server';

export const closeInnerClassTab = async ({
  pathname,
  current,
  tabs,
}: {
  pathname: string;
  current?: any;
  tabs?: any;
}) => {
  const [newPath] = pathname?.split('?');
  const [, portal, mainEntity] = pathname.split('/') || 'New Tab';
  const currentContext = '/' + portal + '/' + mainEntity;

  const headerList = await headers();
  const currentPathname = headerList.get('x-pathname') || '';

  await api.tab.closeCurrentInnerClassTab({
    href: newPath!,
    current_context: currentContext,
  });

  if (!current) {
    // redirect(currentPathname);
    return currentPathname;
  }

  const index = tabs.findIndex((tab: any) => tab.href === newPath);
  if (index !== -1) {
    tabs.splice(index, 1);
  }
  const previousTab = index > 0 ? tabs[index - 1] : null;

  // redirect(previousTab?.href || "/portal/dashboard");

  return previousTab?.href || '/portal/dashboard';
};

export const closeAllInnerClassTabs = async ({
  pathname,
  current,
  tabs,
}: {
  pathname: string;
  current?: any;
  tabs?: any;
}) => {
  const [, portal, mainEntity] = pathname.split('/') || 'New Tab';
  const currentContext = '/' + portal + '/' + mainEntity;

  await api.tab.closeAllInnerClassTabs({
    href: pathname,
    current_context: currentContext,
  });

  // redirect(`/portal/${mainEntity}/grid`);
  return `/portal/${mainEntity}/grid`;
};

export const closeOtherInnerClassTabs = async ({
  pathname,
  current,
  tabs,
}: {
  pathname: string;
  current?: any;
  tabs?: any;
}) => {
  const [, portal, mainEntity] = pathname.split('/') || 'New Tab';
  const currentContext = '/' + portal + '/' + mainEntity;

  await api.tab.closeOtherInnerClassTabs({
    href: pathname,
    current_context: currentContext,
  });

  return pathname;
};
