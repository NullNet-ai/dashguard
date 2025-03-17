'use server'

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { api } from '~/trpc/server';

interface IProps {
    id?: string
    name: string
  }
  
export async function UpdateCommunicationTemplate({
    id,
    name,
  }: IProps) {
    const headerList = headers()
    const pathname = headerList.get('x-pathname') || ''
    const [, portal, mainEntity, application] = pathname.split('/')
    const currentContext = "/" + portal + "/" + mainEntity;
    const result = await api.communicationTemplate.updateDraftTemplate({
      id,
      name,
    })
    if(application === 'wizard' && result?.data?.code) {
      await api.tab.closeCurrentInnerClassTab({
        href: pathname,
        current_context: currentContext,
      });
      redirect(`/portal/${mainEntity}/wizard/${result?.data?.code}/1`)
    }
  }
  