'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { api } from '~/trpc/server'

interface IProps {
  id: string
  categories: string
  code?: string
}

export async function UpdateCategory({
  id,
  categories,
}: IProps) {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , mainEntity, application] = pathname.split('/')

  const result = await api.account.updateDraftAccount({
    id,
    categories,
  })
  if (application === 'wizard' && result?.data?.code) {
    redirect(`/portal/${mainEntity}/wizard/${result?.data?.code}/1?categories=${categories}`)
  }
}
