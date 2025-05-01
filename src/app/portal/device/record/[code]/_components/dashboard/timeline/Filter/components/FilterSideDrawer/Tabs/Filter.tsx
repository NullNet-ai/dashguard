'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleMinus, Plus } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
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

import { useManageFilter } from '../Provider'
import { useEffect, useMemo } from 'react';
import { IDropdown } from '~/app/portal/contact/_components/forms/category-details/types';
// import { useSearchParams } from "next/navigation";

const required_fields = [
  'Time Range',
  'Resolution',
  'Graph Type',
]

const time_resolution_options: { [key: string]: string[] } = {
  '1d': ['1h', '30m'],
  '12h': ['1h', '30m'],
  '7d': ['12h', '1d'],
}

const _def_filters = [
  {
    field: 'Time Range',
    operator: 'equal',
    label: 'Time Range',
    values: [],
    type: 'criteria',
    default: true,
    input_type: 'select',
    static: true,
  },  {
    operator: 'and',
    type: 'operator',
    default: true,
  },
  {
    field: 'Resolution',
    operator: 'equal',
    label: 'Resolution',
    values: [],
    type: 'criteria',
    default: true,
    input_type: 'select',
    static: true,
  },
  {
    operator: 'and',
    type: 'operator',
    default: true,
  }
]

const default_filters = (type: string) =>{
  if(type === 'timeline_filter') return _def_filters
  
  return [
..._def_filters,
  {
    field: 'Graph Type',
    operator: 'equal',
    label: 'Graph Type',
    values: [],
    type: 'criteria',
    default: true,
    input_type: 'select',
    options: [
      { label: 'Line Chart', value: 'line' },
      { label: 'Bar Chart', value: 'bar' },
      { label: 'Area Chart', value: 'area' },
    ],
    static: true,
  },
  {
    operator: 'and',
    type: 'operator',
    default: true,
  },
] }


const OPERATORS = [
  { value: 'equal', label: 'Equals' },
  { value: 'not_equal', label: 'Not Equal' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'greater_than_or_equal', label: 'Greater Than Or Equal' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'less_than_or_equal', label: 'Less Than Or Equal' },
  // { value: 'contains', label: 'Contains' },
  // { value: 'not_contains', label: 'Not Contains' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
  { value: 'is_null', label: 'Is Null' },
  { value: 'is_not_null', label: 'Is Not Null' },
  { value: 'is_between', label: 'Is Between' },
  { value: 'is_not_between', label: 'Is Not Between' },
  // { value: 'like', label: 'Like' },
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

export default function FilterContent({filter_type}: {filter_type: string}) {
  const { actions, state } = useManageFilter()
  const { handleUpdateFilter } = actions
  const { filterDetails, columns, errors} = state ?? {}
  

  const form = useForm<z.infer<any>>({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      filters: filterDetails?.default_filter ?? [
        ...default_filters(filter_type),
        {
          field: '',
          operator: '',
          label: '',
          values: [],
          type: 'criteria',
          default: true,
        }
        
      ],
    },
    shouldFocusError: false,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'filters',
  })
  

  const getResolutionOptions = (selectedTimeRange: string): IDropdown[] => {
    const resolutionOptions: { [key: string]: string[] } = time_resolution_options;
   
    const options = resolutionOptions?.[selectedTimeRange]?.map((res: string) => ({ label: res, value: res })) || [];
    return options;
  };
  
  const selectedTimeRange = form.watch(`filters.[0].Time Range`); // Get selected value
  const resolutionOptions = useMemo(() => getResolutionOptions(selectedTimeRange), [selectedTimeRange]);
  
  
  
  
  
  form.watch((fields) => {
    handleUpdateFilter({ default_filter: fields.filters })
  })

  useEffect(() => {
    if (Object.keys(errors || {}).length > 0) { // Avoids unnecessary renders
      for (let key in errors) {
        form.setError(key, {
          type: 'required',
          message: errors[key],
        });
      }
    }
  }, [errors]);

  
  
  useEffect(() => {
    const subscription = form.watch((values) => {
      values.filters.forEach((filter: any, index: number) => {
        if (required_fields.includes(filter.field) && filter?.[filter.field]) {
          form.clearErrors(`filters.${index}.${filter.field}`);
        } else {
          if (filter.field) form.clearErrors(`filters.${index}.field`);
          if (filter.operator) form.clearErrors(`filters.${index}.operator`);
          if (filter.values && filter.values.length > 0) form.clearErrors(`filters.${index}.values`);
        }
      });
    });
  
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  
  

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
    handleUpdateFilter({ default_filter: updatedFilters })
  }

  const handleRemoveFilter = (index: number) => {
    
    remove([index - 1, index])
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
          className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          size="sm"
          variant="ghost"
          onClick={handleAppend}
        >
          <Plus className="h-4 w-4" />
          Add Filter
        </Button>
      </div>

      <Form {...form}>
        <div className="space-y-4">
          {fields.map((field: any, index) => {    
            const prefix = `filters.${index}`

            

            return (
              <div
                className="grid grid-cols-[1fr_1fr_2fr_auto] items-start gap-2"
                key={field.id}
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

                {required_fields?.includes(field?.field) && (
                  <FormModule
                    fields={[
                      {
                        id: `${prefix}.field`,
                        formType: 'input',
                        name: `${prefix}.field`,
                        // placeholder: 'Select a Field',
                        // selectSearchable: true,
                        value: field?.label,
                        disabled: true,
                      },
                      {
                        id: `${prefix}.operator`,
                        formType: 'select',
                        name: `${prefix}.operator`,
                        placeholder: 'Select an operator',
                        selectSearchable: true,
                        disabled: true,
                      },
                      {
                        id: `${prefix}.${field.field}`,
                        formType: 'select',
                        name: `${prefix}.${field.field}`,
                        placeholder: 'Select a value',
                        selectSearchable: true,
                        selectEnableCreate: true,
                        isAlphabetical: false,
                      },
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
                        [`${prefix}.Time Range`]: [
                          // { label: '30 Days', value: '30d' },
                          { label: '12 Hours', value: '12h' },
                          { label: '1 Day', value: '1d' },
                          { label: '7 Days', value: '7d' },
                        ],
                        // [`${prefix}.Resolution`]:  resolution_options,
                        [`${prefix}.Resolution`]:  resolutionOptions,
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
                          formType: 'multi-select',
                          name: `${prefix}.values`,
                          placeholder: 'Enter the value',
                          multiSelectEnableCreate: true,
                          multiSelectShowCreatableItem: false,
                          // multiSelectUseStringValues: true,
                        },
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
                    {(filter_type === 'timeline_filter' ? fields.length > 6 : fields.length > 7) && !required_fields?.includes(field?.field) && (
                      <Button
                        Icon={CircleMinus}
                        iconClassName="text-red-600 h-4 w-4"
                        iconPlacement="left"
                        variant="ghost"
                        onClick={() => handleRemoveFilter(index)}
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
