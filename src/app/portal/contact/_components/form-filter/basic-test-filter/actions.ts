'use server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ulid } from 'ulid'
import { type z } from 'zod'

import { type ISearchItem } from '~/components/platform/Grid/Search/types'
import { getGridCacheData } from '~/components/platform/Grid/utils/gridget-cache-data'
import { api } from '~/trpc/server'

import { defaultSorting } from './_config/sorting'
import { GLOBAL_ENTITY_NAME, GLOBAL_PARENT_VARIABLE_KEY } from './constants'
import { FormSchema } from './client'

const defaultAdvanceFilter = [
  {
    entity: GLOBAL_PARENT_VARIABLE_KEY,
    operator: 'equal',
    type: 'criteria',
    field: 'status',
    id: ulid(),
    label: 'Status',
    values: ['Active'],
    default: true,
  },
  {
    operator: 'or',
    type: 'operator',
    default: true,
  },
  {
    entity: GLOBAL_PARENT_VARIABLE_KEY,
    operator: 'equal',
    type: 'criteria',
    field: 'status',
    id: ulid(),
    label: 'Status',
    values: ['Draft'],
    default: true,
  },
] as ISearchItem[]

export const saveRecordDetails = async (
  data: z.infer<typeof FormSchema>,
) => {
  return {}
}

export const selectRecord = async (rows: any[]) => {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, portal, mainEntity] = pathname.split('/')
  const currentContext = '/' + portal + '/' + mainEntity
  await api.tab.closeCurrentInnerClassTab({
    href: pathname,
    current_context: currentContext,
  })
  redirect(`/portal/${mainEntity}/wizard/${rows?.[0]?.code}/1`)
}

export const removeRecord = async () => {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, portal, mainEntity] = pathname.split('/')
  const currentContext = '/' + portal + '/' + mainEntity
  await api.tab.closeCurrentInnerClassTab({
    href: pathname,
    current_context: currentContext,
  })
  redirect(`/portal/${mainEntity}/wizard/new/1`)
}

export const closeCurrentInnerClassTab = async ({ code }: { code: string }) => {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, portal, mainEntity] = pathname.split('/')
  const currentContext = '/' + portal + '/' + mainEntity

  await api.tab.closeCurrentInnerClassTab({
    href: pathname,
    current_context: currentContext,
  })

  redirect(`/portal/${GLOBAL_ENTITY_NAME}/wizard/${code}/1`)
}

export const fetchRecords = async ({
  advance_filters = [],
  pluck_fields,
}: {
  pluck_fields: string[]
  advance_filters: {
    type: string
    operator: string
    values?: string[] | undefined
    entity?: string | undefined
    field?: string | undefined
  }[]
}) => {
  // @ts-expect-error  TODO: fix this
  const { sorting } = (await getGridCacheData()) ?? {}
  const { items = [], totalCount } = await api[GLOBAL_ENTITY_NAME].mainGrid({
    current: 0,
    limit: 100,
    entity: GLOBAL_ENTITY_NAME,
    pluck: pluck_fields,
    sorting: sorting?.length ? sorting : defaultSorting,
    advance_filters: advance_filters?.length
      ? advance_filters
      : defaultAdvanceFilter,
  })
  return {
    items,
    totalCount,
  }
}
