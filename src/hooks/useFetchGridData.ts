import { useEffect, useState } from 'react'
import { IGroupBy } from '~/components/platform/Grid/Category/type'

import { ISearchItem, type IAdvanceFilter } from '~/components/platform/Grid/Search/types'
import { api } from '~/trpc/react'

export interface IFetchDataParams {
  entity: string
  pluck?: any
  pluck_object?: any
  current?: number
  limit?: number
  advance_filters?: IAdvanceFilter[]
  group_advance_filters?: ISearchItem[];
  sorting?: any[]
  grouping?: string[]
}

interface IData {
  totalCount: number
  items: any[]
  currentPage: number
  totalPages: number
}

interface IQueryOptions {
  router: string
  resolver: string
}

const removeNullUndefined = (obj: any) => {
  return Object.fromEntries(
    // eslint-disable-next-line no-unused-vars
    Object.entries(obj).filter(([_, v]) => v != null)
  )
}

const advanceFilterResolver = (advance_filters: IAdvanceFilter[]) => {
  const advanceFilter = advance_filters?.map(
    ({ entity, operator, type, field, values }) => {
      const filter = {
        entity,
        operator,
        type,
        field,
        values,
      };
      return removeNullUndefined(filter);
    },
  )
  return advanceFilter
}
const useFetchGridData = (initialArgs: IFetchDataParams, query_options?: IQueryOptions,queryConditions?: any, ) => {
  const [args, setArgs] = useState(initialArgs)
  const [currentData, setCurrentData] = useState<IData>()
  const { router = 'grid', resolver = 'items' } = query_options ?? {}
  // @ts-expect-error - TS doesn't know that `api` is a global variable that is defined in the `trpc` package
  const { data, isLoading, error, refetch } = api?.[router]?.[resolver].useQuery({
    current: 0,
    limit: 100,
    pluck: args.pluck,
    sorting: args.sorting,
    advance_filters: advanceFilterResolver(args.advance_filters ?? []),
    ...args,
  }, queryConditions)

  useEffect(() => {
    if (!isLoading) {
      setCurrentData(data)
    }
  }, [data, isLoading])

  useEffect(() => {
    refetch()
  }, [args, refetch])

  const fetchData = (newArgs?: IFetchDataParams) => {
    setArgs((prev: IFetchDataParams) => ({ ...prev, ...newArgs }))
  }

  return { data: currentData, isLoading, error, fetchData }
}

export default useFetchGridData