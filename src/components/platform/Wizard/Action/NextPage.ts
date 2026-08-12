'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { api } from '~/trpc/server';

export async function NextPage() {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const fullSearchQueryParams =
    headerList.get('x-full-search-query-params') || '';
  const path = pathname.split('/');
  const [, , mainEntity, application = 'wizard', identifier, currentStep] = path;
  const version = '1';

  if (application !== 'wizard' || !identifier || identifier === 'new') return;

  const step = Number(currentStep) + 1;
  await api.wizard.wizardCreateStep({
    identifier,
    entity: mainEntity!,
    step: step.toString(),
  });

  if (fullSearchQueryParams) {
 
    redirect(
      `/portal/${mainEntity}/wizard/${identifier}/${step}?${fullSearchQueryParams}`,
    );
  
  }

  redirect(`/portal/${mainEntity}/wizard/${identifier}/${step}`);
  
}
