'use client'

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ulid } from 'ulid'

import { WizardContext } from '~/components/platform/Wizard/Provider'
import { useSidebar } from '~/components/ui/sidebar'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { cn } from '~/lib/utils'
import { api } from '~/trpc/react'

import Grid from '../../../../Grid/Client'
import Skeleton from '../../../../Grid/Skeleton'
import { type IFilterGridConfig, type IGridData } from '../../../types/global/interfaces'

import { fetchRecords } from './actions'

export default function FormFilterGrid({
  config,
  handleCloseGrid,
  handleSelectedGridRecords,
  handleListLoading,
  className,
  formKey,
}: {
  handleSelectedGridRecords: (records: any[]) => void
  handleCloseGrid: () => void
  handleListLoading: (loading: boolean) => void
  className?: string
  config: IFilterGridConfig
  formKey?: string
}) {
  const {
    current,
    limit,
    actionType,
    pluck,
    label,
    gridColumns,
    main_entity_id,
    onSelectRecords,
    filter_entity,
    hideSearch,
    selectedRecords: _form_filter_selected_record,
    searchConfig,
  } = config
  const eventEmitter = useEventEmitter()
  const { state } = useContext(WizardContext)
  const { open } = useSidebar()

  const [gridData, setGridData] = useState<IGridData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(
    async ({
      current,
      limit,
      pluck,
      advance_filters = [],
      sorting = [],
    }: {
      current: number
      limit: number
      pluck: string[]
      advance_filters: any[]
      sorting: any[]
    }) => {
      setIsLoading(true)
      try {
        if (Object.keys(searchConfig ?? {}).length) {
          const {
            router = 'grid',
            resolver = 'items',
            query_params,
          } = searchConfig ?? {}

          const updateSearchItems = query_params?.default_advance_filters.length
            ? [
                ...query_params?.default_advance_filters ?? [],
                ...(query_params?.default_advance_filters.length
                  ? [{ id: ulid(), type: 'operator', operator: 'and' }]
                  : []),
                ...advance_filters,
              ]
            : advance_filters

          const result = await fetchRecords({
            advance_filters: updateSearchItems,
            pluck_fields: query_params?.pluck || [],
            router,
            resolver,
            sort: sorting,
          })
          setGridData({
            ...result,
            advance_filters,
            sorting,
          })
        }
        else {
          const [, list] = api.grid.items.useSuspenseQuery({
            entity: filter_entity!,
            current,
            limit: limit || 100,
            pluck,
          })
          const { isLoading: list_is_loading, data } = list ?? {}
          setIsLoading(list_is_loading)
          const { items, totalCount } = data ?? {}
          setGridData({ items: items || [], totalCount: totalCount || 0 })
        }
      }
      catch (error) {
        console.error('Error fetching grid data:', error)
      }
      finally {
        setIsLoading(false)
      }
    }, [filter_entity, searchConfig],
  )

  useEffect(() => {
    void fetchData({
      current: current || 1,
      limit: limit || 100,
      pluck: pluck || [],
      advance_filters: [],
      sorting: [],
    })
  }, [])

  const selectedRecords = (config.selectedRecords || [])
    ?.map((record: any) => record?.id)
    .filter(Boolean) as string[]

  const calcWidth = useMemo(() => {
    if (className) {
      return className
    }
    if (open && state?.isSummaryOpen) {
      return 'w-full'
    }
    else if (!open && state?.isSummaryOpen) {
      return 'w-auto'
    }
    else if (open && !state?.isSummaryOpen) {
      return 'w-[calc(100vw-320px)]'
    }
    else return ''
  }, [open, state?.isSummaryOpen, className])

  const containerWidth = useMemo(() => {
    if (className) {
      return className
    }
    if (open && state?.isSummaryOpen) {
      return 'lg:w-[calc(100vw-550px)]'
    }
    else if (!open && state?.isSummaryOpen) {
      return 'w-auto'
    }
    else if (open && !state?.isSummaryOpen) {
      return 'w-[calc(100vw-320px)]'
    }
    else return ''
  }, [open, state?.isSummaryOpen, className])

  handleListLoading(isLoading)

  if (isLoading) {
    return (
      <div className='bg-white'>
        <Skeleton />
      </div>
    )
  }

  const initialSelectedRecords = selectedRecords.reduce(
    (acc, id) => ({ ...acc, [id]: true }), {},
  )

  return (
    <div className={cn('w-full', containerWidth)}>
      <div className={cn(`${calcWidth}`)}>
        <Grid
          advanceFilter={gridData?.advance_filters || []}
          config={{
            statusesIncluded: config?.statusesIncluded ?? [
              'draft',
              'active',
              'Draft',
              'Active',
            ],
            entity: filter_entity!,
            title: label,
            columns: gridColumns!,
            actionType,
            searchConfig,
            onFetchRecords: void fetchData,
            rowClickCustomAction: ({ row, config }) => {
              if (
                row.original.id === _form_filter_selected_record?.[0]?.id
                || !config?.statusesIncluded?.includes(row.original.status)
                || !onSelectRecords
              ) return

              void Promise.resolve(
                onSelectRecords({
                  rows: [row?.original],
                  main_entity_id: main_entity_id || '',
                  filter_entity: config?.entity,
                }),
              )?.then((data) => {
                eventEmitter.emit(`formStatus:${formKey}`, {
                  status: 'done',
                  form_key: formKey,
                });

                handleSelectedGridRecords(
                  Object.keys(data?.rows).length ? [data?.rows] : [],
                )
                handleCloseGrid()
              })
            },
          }}
          data={gridData?.items || []}
          defaultSorting={
            config?.searchConfig?.query_params?.default_sorting || []
          }
          height="300px"
          hideSearch={hideSearch}
          initialSelectedRecords={initialSelectedRecords}
          parentProps={{
            width: containerWidth,
            open,
            summary: state?.isSummaryOpen,
          }}
          parentType="form"
          showPagination={false}
          sorting={gridData?.sorting}
          totalCount={gridData?.totalCount || 0}
          onSelectRecords={(rows) => {
            if (!onSelectRecords) return
            void Promise.resolve(
              onSelectRecords({
                rows,
                main_entity_id,
                filter_entity,
              }),
            )?.then((data) => {
              eventEmitter.emit(`formStatus:${formKey}`, {
                status: 'done',
                form_key: formKey,
              })
              handleSelectedGridRecords(data?.rows || [])
              handleCloseGrid()
            })
          }}
        />
      </div>
    </div>
  )
}
