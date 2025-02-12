'use client'
import { Combobox, ComboboxOptions } from '@headlessui/react'
import { kebabCase } from 'lodash'
import React, { useCallback, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { type z } from 'zod'

import { useDebounce } from '~/components/ui/multi-select'
import { cn } from '~/lib/utils'
import { api } from '~/trpc/react'

import {
  type IField,
  type IFilterGridConfig,
  type ISearchParams,
  type TFormSchema,
} from '../../../../FormBuilder/types'
import Grid from '../../../../Grid/Client'

export default function FormInputGridWrapper({
  fieldConfig,
  gridConfig,
  children,
  form,
  onSelectFieldFilterGrid,
  formSchema,
}: {
  fieldConfig: IField
  children: React.ReactElement
  gridConfig: IFilterGridConfig
  form: UseFormReturn<Record<string, any>, any, undefined>
  formSchema: TFormSchema
  onSelectFieldFilterGrid?: (data: z.infer<typeof formSchema>) => Promise<void>
}) {
  const {
    gridColumns = [],
    pluck = [],
    pluck_object,
    filter_entity = '',
    onFilterFieldChange,
    fieldFilterGridColumns,
    selectedRecords = [],
    statusesIncluded,
  } = gridConfig ?? {}

  const { entity: field_entity = '', field = '' }
    = fieldConfig?.filterFieldConfig ?? {}

  const [isOpen, setIsOpen] = useState(false)
  const [filterField, setFilterField] = useState('')
  const filter_key = field || fieldConfig.id

  const open = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterField(event.target.value)
    setIsOpen(true)
  }, [])
  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleSearch = (filter: string) => {
    setFilterField(filter)
  }

  const debouncedSearchInput = useDebounce(filterField, 500)

  const defaultFilterQuery = (
    search_params: ISearchParams,
    options: Record<string, any>,
  ) => {
    const { data } = api.grid.items.useQuery(search_params, options)
    return data
  }

  const onFieldFilterFn = onFilterFieldChange
    ? onFilterFieldChange
    : defaultFilterQuery

  const data = onFieldFilterFn(
    {
      entity: filter_entity,
      current: 0,
      limit: 100,
      pluck,
      pluck_object,
      advance_filters: [
        {
          type: 'criteria',
          field: filter_key,
          operator: 'like',
          values:
            filter_key === 'raw_phone_number'
              ? [debouncedSearchInput?.replace(/[^\d]/g, '')]
              : [debouncedSearchInput],
          ...(field_entity ? { entity: field_entity } : {}),
        },
      ],
    }, {
      refetchOnWindowFocus: false,
      gcTime: 0,
      enabled: debouncedSearchInput?.length > 3,
    },
  )

  const { items, totalCount } = data ?? {}
  const columns = fieldFilterGridColumns?.length
    ? gridColumns?.filter(
      (col: any) => fieldFilterGridColumns.includes(col?.accessorKey))
    : gridColumns

  return (
    <Combobox>
      {React.cloneElement(children, {
        fieldFilterActions: {
          onBlur: close,
          onFocus: open,
          handleSearch,
        },
      })}
      {isOpen && filterField.length > 3 && (
        <ComboboxOptions
          as='ul'
          className={
            cn(`absolute z-[100] w-[96%] md:w-full mx-auto lg:w-full
              right-0 overflow-y-auto rounded-md border border-gray-200
              bg-white shadow-lg mt-4 lg:mt-8 `, fieldConfig?.gridPosition
              ? `${fieldConfig?.gridPosition}-0`
              : 'left-0')
          }
          data-test-id={kebabCase('cbx-' + fieldConfig.name)}
          static={true}
        >
          <Grid
            config={{
              statusesIncluded: ['draft', 'active', 'Draft', 'Active'],
              entity: 'contact',
              title: 'Contacts',
              columns,
              defaultValues: {
                categories: ['Contact'],
              },
              disableDefaultAction: true,
              actionType: 'single-select',
              hideColumnsOnMobile: ['select'],
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              rowClickCustomAction: async (data) => {
                let formData = data?.row.original

                const disableActions
                = selectedRecords.includes(formData.id)
                  || !statusesIncluded?.includes(formData?.status)

                if (disableActions) return

                if (gridConfig?.handleSelectFieldFilterGrid) {
                  formData = await gridConfig?.handleSelectFieldFilterGrid(formData)
                }

                form.reset(formData, {
                  keepDefaultValues: true,
                })
                await form.handleSubmit(onSelectFieldFilterGrid!)()
              },
            }}
            data={items || []}
            parentType='field'
            totalCount={totalCount || 0}
          />

        </ComboboxOptions>

      )}
    </Combobox>
  )
}
