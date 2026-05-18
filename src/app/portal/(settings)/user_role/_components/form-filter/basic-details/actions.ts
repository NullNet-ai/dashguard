'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { api } from '~/trpc/server';

export const selectRecord = async (rows: any[]) => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, portal, mainEntity] = pathname.split('/');
  const currentContext = '/' + portal + '/' + mainEntity;
  await api.tab.closeCurrentInnerClassTab({
    href: pathname,
    current_context: currentContext,
  });
  redirect(`/portal/${mainEntity}/wizard/${rows?.[0]?.code}/1`);
};

export const removeRecord = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, portal, mainEntity] = pathname.split('/');
  const currentContext = '/' + portal + '/' + mainEntity;
  await api.tab.closeCurrentInnerClassTab({
    href: pathname,
    current_context: currentContext,
  });
  redirect(`/portal/${mainEntity}/wizard/new/1`);
};

export const savedRecord = async ({
  code,
  action_type,
}: {
  code: string;
  action_type: string;
}) => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, portal, mainEntity] = pathname.split('/');
  const currentContext = '/' + portal + '/' + mainEntity;

  await api.tab.removeNewInnerClassTab({
    current_context: currentContext,
  });

  if (action_type === 'Next') {
    await api.wizard.createRedisRecordsForFormFilter({
      entity: mainEntity!,
      code: code,
    });
  }
  return;
};
