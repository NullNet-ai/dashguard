'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleMinus, Plus } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import { useManageFilter } from '../Provider'

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

const OPERATORS = [
  { value: 'equal', label: 'Equals' },
  { value: 'not_equal', label: 'Not Equal' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'greater_than_or_equal', label: 'Greater Than Or Equal' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'less_than_or_equal', label: 'Less Than Or Equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
  { value: 'is_null', label: 'Is Null' },
  { value: 'is_not_null', label: 'Is Not Null' },
  { value: 'is_between', label: 'Is Between' },
  { value: 'is_not_between', label: 'Is Not Between' },
  { value: 'like', label: 'Like' },
]
const ZodSchema = z.object({
  filters: z.array(
    z.discriminatedUnion('type', [
      z.object({
        field: z.string().min(1, 'Field is required'),
        operator: z.string().min(1, 'Operator is required'),
        label: z.string(),
        // values: z.array(z.string()).min(1, "Value is required"),
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

export default function FilterContent() {
  const { actions, state } = useManageFilter()
  const { handleUpdateFilter } = actions
  const { filterDetails, columns } = state ?? {}
  console.log('%c Line:62 🍞 columns', 'color:#93c0a4', columns)

  const form = useForm<z.infer<any>>({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      filters: filterDetails?.default_filter ?? [
        {
          field: '',
          operator: '',
          label: '',
          values: [],
          type: 'criteria',
          default: true,
        },
      ],
    },
    shouldFocusError: false,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'filters',
  })

  console.log('%c Line:110 🍋', 'color:#e41a6a', form.getValues(), fields, form);
  form.watch((fields) => {
    console.log('%c Line:87 🍋 fields', 'color:#ffdd4d', fields);
    // values must be an array
    handleUpdateFilter({ default_filter: fields.filters })
  })

  const handleAppend = () => {
    const newFilter = {
      field: '',
      operator: 'equal',
      label: '',
      values: [],
      type: 'criteria',
      default: true,
    }

    append({
      operator: 'and',
      type: 'operator',
      default: true,
    })
    append(newFilter as any)
    const updatedFilters = form.getValues().filters

    console.log('%c Line:110 🍋', 'color:#e41a6a', form.getValues());
    console.log('%c Line:109 🥒 updatedFilters', 'color:#fca650', updatedFilters);
    handleUpdateFilter({ default_filter: updatedFilters })
  }

  const handleRemoveFilter = (index: number) => {
    remove(index)
    handleUpdateFilter({ default_filter: form.getValues().filters })
  }

  const handleUpdateJunctionOperator = (index: number, operator: string) => {
    const updatedFilters = [...form.getValues().filters]
    updatedFilters[index]!.operator = operator
    form.setValue('filters', updatedFilters)
    handleUpdateFilter({ default_filter: updatedFilters })
  }
  
  return (
    <div className="mt-5 space-y-4 rounded-lg bg-gray-50 p-4">
      <div className="flex justify-end">
        <Button
          className = "flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          size = "sm"
          variant = "ghost"
          onClick = { handleAppend }
        >
          <Plus className="h-4 w-4" />
          Add Filter
        </Button>
      </div>

      <Form {...form}>
        <div className="space-y-4">
          {fields.map((field: any, index) => {
            const prefix = `filters.${index}.`
            return (
              <div
                className = "grid grid-cols-[1fr_1fr_2fr_auto] items-start gap-2"
                key = { field.id }
              >
                {index > 0 && field.type === 'operator' && (
                  <div className="col-span-4 mb-2">
                    <Select
                      defaultValue="and"
                      value={field.operator}
                      onValueChange={(operator) => handleUpdateJunctionOperator(index, operator) }
                    >
                      <SelectTrigger className="w-[100px] border-gray-200 bg-white">
                        <SelectValue placeholder="AND" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        <SelectItem value="and">AND</SelectItem>
                        <SelectItem value="or">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {field.type === 'criteria' && (
                  <>
                    <FormModule
                      fields = { [
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
                          formType: 'multi-select',
                          name: `${prefix}.values`,
                          placeholder: 'Enter the value',
                          multiSelectEnableCreate: true,
                          multiSelectShowCreatableItem: false,
                          multiSelectUseStringValues: true,
                        },
                      ] }
                      form = { form }
                      formKey = "filters"
                      formSchema = { ZodSchema }
                      subConfig = { {
                        selectOptions: {
                          [`${prefix}.field`]:
                            columns?.map(column => ({
                              label: column.label,
                              value: column.accessorKey,
                            })) || [],
                          [`${prefix}.operator`]: OPERATORS,
                        },
                      } }
                    />
                    {fields.length > 1 && (
                      <Button
                        Icon = { CircleMinus }
                        iconClassName = "text-red-600 h-4 w-4"
                        iconPlacement = "left"
                        variant = "ghost"
                        onClick = { () => handleRemoveFilter(index) }
                      />
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </Form>
    </div>
  )
}
