'use client'
import { MinusCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import FormModule from '~/components/platform/FormBuilder/components/ui/FormModule/FormModule'
import { Button } from '~/components/ui/button'
import { Form } from '~/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

import { type IFilter } from '../../../../../types'
import { useManageFilter } from '../../Provider'

const OPERATORS = [
  { value: 'equal', label: 'Equals' },
  { value: 'not_equal', label: 'Not Equal' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'greater_than_or_equal', label: 'Greater Than Or Equal' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'less_than_or_equal', label: 'Less Than Or Equal' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
  { value: 'is_null', label: 'Is Null' },
  { value: 'is_not_null', label: 'Is Not Null' },
  { value: 'is_between', label: 'Is Between' },
  { value: 'is_not_between', label: 'Is Not Between' },
]
const ZodSchema = z.object({
  filters: z.array(
    z.discriminatedUnion('type', [
      z.object({
        field: z.string().min(1, 'Field is required'),
        operator: z.string().min(1, 'Operator is required'),
        label: z.string(),
        values: z.string().min(1, 'Value is required'),
        type: z.literal('criteria'),
        default: z.boolean(),
      }),
      z.object({
        operator: z.enum(['and', 'or']),
        type: z.literal('operator'),
        default: z.boolean(),
      }),
    ])
  ),
})

const required_fields = [
  'Time Range',
  'Resolution',
  'Graph Type',
]

const time_resolution_options: { [key: string]: string[] } = {
  '1d': ['1h', '30m', '5m'],
  '1h': ['1m', '5m'],
  '30m': ['1m', '5m'],
  '12h': ['1h', '30m'],
  '7d': ['12h', '1d'],
}

const TIME_RANGE_TO_RESOLUTION: Record<string, string> = {
  '24h': '24m',
  '12h': '12m',
  '6h': '6m',
  '3h': '3m',
  '1h': '1m',
  '30m': '30s',
}

export const FilterGroup = ({ form, groupIndex, filter_type, onRemoveFilter, onUpdateJunctionOperator }: {
  onRemoveFilter: (index: number) => void, form: any, filter_type: string, groupIndex: number
  onUpdateJunctionOperator: (index: number, operator: string) => void; }) => {
  const { state } = useManageFilter()
  const { columns, errors } = state ?? {}
  const [resolutionOptions, setResolutionOptions] = useState<{ label: string; value: string }[]>([])
  const fields = form.getValues().filterGroups

  const timeRangeFilterIndex = fields?.[groupIndex]?.filters?.findIndex(
    (f: { field: string }) => f.field === 'Time Range'
  ) ?? -1
  const timeRangeValue: string | undefined = timeRangeFilterIndex !== -1
    ? form.watch(`filterGroups.${groupIndex}.filters.${timeRangeFilterIndex}.Time Range`)
    : undefined

  useEffect(() => {
    if (!timeRangeValue) return
    const autoResolution = TIME_RANGE_TO_RESOLUTION[timeRangeValue]
    if (!autoResolution) return
    const currentFields = form.getValues().filterGroups
    const resolutionFilterIndex = currentFields?.[groupIndex]?.filters?.findIndex(
      (f: { field: string }) => f.field === 'Resolution'
    ) ?? -1
    if (resolutionFilterIndex !== -1) {
      form.setValue(
        `filterGroups.${groupIndex}.filters.${resolutionFilterIndex}.Resolution`,
        autoResolution
      )
    }
  }, [timeRangeValue, groupIndex, form])
  const isMapFilterGroupLocked = filter_type === 'map_filter' && groupIndex === 0

  // useEffect(() => {
  //   const fetchResolutionType = async () => {
  //     const { data } = await refetchResolution()
  //     setResolutionOptions(data)
  //   }
  //   fetchResolutionType()
  // },[resolutionOptions])

  useEffect(() => {
    if (Object.keys(errors || {}).length > 0) { // Avoids unnecessary renders
      for (const key in errors) {
        form.setError(key, {
          type: 'required',
          message: errors[key],
        })
      }
    }
  }, [errors])

  useEffect(() => {
    const subscription = form.watch((values: Record<string, any>) => {
      values?.filterGroups?.[groupIndex]?.filters?.forEach((filter: any, index: number) => {
        if (required_fields.includes(filter.field) && filter?.[filter.field]) {
          form.clearErrors(`filterGroups.${groupIndex}.filters.${index}.${filter.field}`)
        }
        else {
          if (filter.field) form.clearErrors(`filterGroups.${groupIndex}.filters.${index}.field`)
          if (filter.operator) form.clearErrors(`filterGroups.${groupIndex}.filters.${index}.operator`)
          if (filter.values && filter.values.length > 0) form.clearErrors(`filterGroups.${groupIndex}.filters.${index}.values`)
        }
      })
    })

    return () => subscription.unsubscribe()
  }, [form.watch])

  const criteriaFilters = fields?.[groupIndex]?.filters?.filter((_filter: IFilter) => _filter.type === 'criteria')
  const hasManyFilters = criteriaFilters?.length > 1

  return (
    <div className="space-y-4 rounded-lg bg-gray-50 pl-3 pb-3 pr-2 pt-2">
      <Form {...form}>
        <fieldset
          aria-disabled={isMapFilterGroupLocked}
          className={` ${isMapFilterGroupLocked ? 'pointer-events-none opacity-50' : ''}`}
        >
          {fields?.[groupIndex]?.filters?.map((field: any, index: number) => {
            const criteriaIndex
          = fields?.[groupIndex]?.filters?.slice(0, index + 1).filter((f: Record<string, any>) => f.type === 'criteria')
            .length - 1
            const no_group_filter = form.getValues()?.filterGroups?.length == 1

            const default_filter_last_operation = (groupIndex == 0 && fields?.[groupIndex]?.filters?.length - 1 == index && no_group_filter)

            const prefix = `filterGroups.${groupIndex}.filters.${index}`
            const filterData
            = form.getValues().filterGroups?.[groupIndex]?.filters[index]

            if (!filterData) return null


            return (
              <div
                key={field.id}
                className={`grid grid-cols-[1fr_1fr_2fr_auto] items-end gap-1 ${index > 0 ? 'grid-cols-[auto_1fr_1fr_2fr_auto]' : 'grid-cols-[1fr_1fr_2fr_auto]'}`}
              >

                {index > 0 && fields?.[groupIndex]?.filters?.[index - 1].type === 'operator' && (
                    <Select
                      disabled = { true }
                      value = {
                        fields[index - 1]?.type === 'operator'
                          ? fields?.[index - 1]?.operator
                          : 'and'
                      }
                      onValueChange = { (operator) => onUpdateJunctionOperator(index - 1, operator)}
                    >
                      <SelectTrigger className="h-9 border-gray-200 bg-white">
                        <SelectValue placeholder="AND" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        <SelectItem value="and">AND</SelectItem>
                        <SelectItem value="or">OR</SelectItem>
                      </SelectContent>
                    </Select>
                )}

                {required_fields?.includes(field?.field)
                && (
                  <FormModule
                    fields={[
                      {
                        id: `${prefix}.field`,
                        formType: 'input',
                        name: `${prefix}.field`,
                        // @ts-expect-error - value is not a valid prop for input
                        value: field?.label,
                        readonly: true,
                      },
                      {
                        id: `${prefix}.operator`,
                        formType: 'select',
                        name: `${prefix}.operator`,
                        placeholder: 'Select an operator',
                        selectSearchable: true,
                        readonly: true,
                      },
                      {
                        id: `${prefix}.${field.field}`,
                        formType: field?.field === 'Resolution' ? 'input' : 'select',
                        name: `${prefix}.${field.field}`,
                        placeholder: 'Select a value',
                        selectSearchable: true,
                        readonly: field?.field === 'Resolution',
                      },
                    ]}
                    form={form}
                    formKey={`filterGroups.${groupIndex}.filters`}
                    formSchema={ZodSchema}
                    subConfig={{
                      selectOptions: {
                        [`${prefix}.field`]:
                          columns?.map(column => ({
                            label: column.label,
                            value: column.accessorKey,
                          })) || [],
                        [`${prefix}.operator`]: OPERATORS,
                        [`${prefix}.units`]: [
                          { label: 'Seconds', value: 's' },
                          { label: 'Minutes', value: 'm' },
                          { label: 'Hours', value: 'h' },
                        ],
                        [`${prefix}.Time Range`]: [
                          {
                            label: '24h',
                            value: '24h'
                          },
                          {
                            label: '12h',
                            value: '12h'
                          },
                          {
                            label: '6h',
                            value: '6h'
                          },
                          {
                            label: '3h',
                            value: '3h'
                          },
                          {
                            label: '1h',
                            value: '1h'
                          },
                          {
                            label: '30m',
                            value: '30m'
                          },
                        ],
                        // [`${prefix}.Resolution`]:  resolution_options,
                        [`${prefix}.Resolution`]: resolutionOptions,
                        [`${prefix}.Graph Type`]: [
                          { label: 'Line Chart', value: 'line' },
                          { label: 'Bar Chart', value: 'bar' },
                          { label: 'Area Chart', value: 'area' },
                        ],
                      },
                    }}
                  />
                )}

                {field.type === 'criteria' && !required_fields?.includes(field?.field) && (
                  <>
                    <FormModule
                      fields={[
                        {
                          id: `${prefix}.field`,
                          formType: 'select',
                          name: `${prefix}.field`,
                          placeholder: 'Select a Field',
                          selectSearchable: true,
                        },
                        {
                          id: `${prefix}.operator`,
                          formType: 'select',
                          name: `${prefix}.operator`,
                          placeholder: 'Select an operator',
                          selectSearchable: true,
                        },
                        {
                          id: `${prefix}.values`,
                          formType: 'input',
                          name: `${prefix}.values`,
                          placeholder: 'Enter the value',
                          multiSelectEnableCreate: true,
                          multiSelectShowCreatableItem: false,
                          multiSelectUseStringValues: true,
                        }
                      ]}
                      form={form}
                      formKey="filters"
                      formSchema={ZodSchema}
                      subConfig={{
                        selectOptions: {
                          [`${prefix}.field`]:
                            columns?.map(column => ({
                              label: column.label,
                              value: column.accessorKey,
                            })) || [],
                          [`${prefix}.operator`]: OPERATORS,
                        },
                      }}
                    />

                    {hasManyFilters && !isMapFilterGroupLocked && (
                      <Button
                        variant = "ghost"
                        onClick = { () => onRemoveFilter(criteriaIndex) }
                      >
                        <MinusCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </fieldset>
      </Form>
    </div>
  )
}
