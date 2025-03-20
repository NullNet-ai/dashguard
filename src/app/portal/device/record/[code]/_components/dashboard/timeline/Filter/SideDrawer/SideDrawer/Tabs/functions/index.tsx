'use client'
import {  MinusCircle } from 'lucide-react'
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
import { useEffect, useMemo } from 'react';
import { IDropdown } from '~/app/portal/contact/_components/forms/category-details/types';
import { useManageFilter } from '../../Provider'
import { IFilter } from '../../../../../types'

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
  '1d': ['1h', '30m'],
  '12h': ['1h', '30m'],
  '7d': ['12h', '1d'],
}




export const FilterGroup = ({form, groupIndex, onRemoveFilter, onUpdateJunctionOperator}: {
  onRemoveFilter: (index: number) => void,form: any, filter_type: string, groupIndex: number, 
  onUpdateJunctionOperator: (index: number, operator: string) => void;}) => {
    
  const { actions, state } = useManageFilter()
  const { handleUpdateFilter } = actions
  const { columns, errors} = state ?? {}
  
  
  const fields = form.getValues().filterGroups
  

  const getResolutionOptions = (selectedTimeRange: string): IDropdown[] => {
    const resolutionOptions: { [key: string]: string[] } = time_resolution_options;
   
    const options = resolutionOptions?.[selectedTimeRange]?.map((res: string) => ({ label: res, value: res })) || [];
    return options;
  };
  const selectedTimeRange = form.watch(`filterGroups.${groupIndex}.filters.[0].Time Range`); // Get selected value
  const resolutionOptions = useMemo(() => getResolutionOptions(selectedTimeRange), [selectedTimeRange]);
  
  
  
  
  
  form.watch((fields: Record<string,any>) => {
    handleUpdateFilter({ filterGroups: fields.filterGroups })
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
    const subscription = form.watch((values: Record<string,any>) => {
      values?.filterGroups?.[groupIndex]?.filters?.forEach((filter: any, index: number) => {
        if (required_fields.includes(filter.field) && filter?.[filter.field]) {
          form.clearErrors(`filterGroups.${groupIndex}.filters.${index}.${filter.field}`);
        } else {
          if (filter.field) form.clearErrors(`filterGroups.${groupIndex}.filters.${index}.field`);
          if (filter.operator) form.clearErrors(`filterGroups.${groupIndex}.filters.${index}.operator`);
          if (filter.values && filter.values.length > 0) form.clearErrors(`filterGroups.${groupIndex}.filters.${index}.values`);
        }
      });
    });
  
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  


  const criteriaFilters = fields?.[groupIndex]?.filters?.filter((_filter: IFilter) => _filter.type === 'criteria');
  const hasManyFilters = criteriaFilters.length > 1;

  return (
    <div className="mt-5 space-y-4 rounded-lg bg-gray-50 p-4">
      <Form {...form}>
        <div className="space-y-4">
          {fields?.[groupIndex]?.filters?.map((field: any, index: number) => {  
            
          const criteriaIndex =
          fields?.[groupIndex]?.filters?.slice(0, index + 1).filter((f: Record<string, any>) => f.type === 'criteria')
            .length - 1;
            const no_group_filter = form.getValues()?.filterGroups?.length == 1
            
            const default_filter_last_operation = (groupIndex == 0 && fields?.[groupIndex]?.filters?.length -1 == index && no_group_filter) 

            
            const prefix = `filterGroups.${groupIndex}.filters.${index}`          
            const filterData =
            form.getValues().filterGroups?.[groupIndex]?.filters[index];
          
            
            if(!filterData) return null
            
            return (
              <div
                className="grid grid-cols-[1fr_1fr_2fr_auto] items-start gap-2"
                key={field.id}
              >
                {((( groupIndex == 1 && index == 0)) || (index > 0 && (!default_filter_last_operation) )) && field.type === 'operator' && (
                  <div className="col-span-4 mb-2">
                    <Select
                      value={
                        fields[index - 1]?.type === 'operator'
                          ? fields?.[index - 1]?.operator
                          : 'and'
                      }
                      onValueChange={(operator) =>
                        onUpdateJunctionOperator(index - 1, operator)
                      }
                      disabled={true}
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

                {required_fields?.includes(field?.field) && 
                (
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
                        isAlphabetical: false,

                        // multiSelectEnableCreate: true,
                        // multiSelectShowCreatableItem: false,
                        // multiSelectUseStringValues: true,
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
                          multiSelectUseStringValues: true,
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
                   
                   {hasManyFilters && (
                    <Button
                      onClick={() => onRemoveFilter(criteriaIndex)}
                      variant="ghost"
                    >
                      <MinusCircle className="h-4 w-4 text-red-600" />
                    </Button>
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


