import React, { useEffect, useMemo, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import { type IDropdown } from '~/app/portal/contact/_components/forms/category-details/types'
import countriesToCities from '~/components/platform/AddressAutoComplete/countriesToCities.json'
import {
  countryList,
  getStates,
} from '~/components/platform/AddressAutoComplete/countryStates'
import FormInput from '~/components/platform/FormBuilder/FormType/FormInput'
import FormSelect from '~/components/platform/FormBuilder/FormType/FormSelect'
import { FormField, FormItem } from '~/components/ui/form'
import Map from '../../../maps'
import { getCitiesByState } from '~/components/platform/AddressAutoComplete/statesToCities'

interface BasicDetails {
  defaultValues?: Partial<{
    model: string
    grouping: string
    country: string
    city: string
    state: string
    id: string
  }>
  form: UseFormReturn<Record<string, any>, any, undefined>
  options?: {
    appendFormKey?: string
  }
  selectOptions: {
    model: IDropdown[]
    grouping: IDropdown[]
  }
  disabledModel: boolean
}

const transformDropdown = (data: string[]) => data?.map(item => ({ value: item, label: item }))

export default function CustomBasicDetails({
  form,
  selectOptions,
  disabledModel,
}: BasicDetails) {
  const { control, watch } = form
  const { model, grouping } = selectOptions

  const [city_options, setCityOptions] = useState<IDropdown[]>([])
  const [state_options, setStateOptions] = useState<IDropdown[]>([])

  const country_options = useMemo(() => {
    return countryList.map((country: string) => ({
      value: country,
      label: country,
    }))
  }, [])

  const selected_country = watch('country') as 'China'
  const selected_state = watch('state') as 'China'
  const selected_city = watch('city') as 'China'

  useEffect(() => {
    if (!selected_country) return
    

    const states = getStates(selected_country) as string[]
    const state_options = transformDropdown(states)
    setStateOptions(state_options)
  }, [selected_country])

  useEffect(() => {
    if(!selected_state) return
    // const cities = countriesToCities?.[selected_country] as string[]
    const cities = getCitiesByState(selected_state) as string[]
    const city_options = transformDropdown(cities)
    setCityOptions(city_options)
  },[selected_state])

  return (
    <FormField
      control={form.control}
      name="Basic Details"
      render={() => {
        return (
          <FormItem>
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <FormField
                  control={control}
                  name="model"
                  render={(formProps) => (
                    <FormSelect
                      fieldConfig={{
                        id: `model`,
                        formType: 'select',
                        name: `model`,
                        label: 'Model',
                        required: true,
                        disabled: disabledModel,
                        selectSearchable: true,
                      }}
                      form={form}
                      formKey="device_model"
                      formRenderProps={formProps}
                      selectOptions={{
                        model,
                      }}
                    />
                  )}
                />
                <FormField
                  control={control}
                  name="instance_name"
                  render={(formProps) => (
                    <FormInput
                      fieldConfig={{
                        id: `instance_name`,
                        formType: 'input',
                        name: `instance_name`,
                        label: 'Instance Name',
                        required: true,
                        
                      }}
                      form={form}
                      formKey="device_instance_name"
                      formRenderProps={formProps}
                    />
                  )}
                />

                <FormField
                  control={control}
                  name="grouping"
                  render={(formProps) => (
                    <FormSelect
                      fieldConfig={{
                        id: `grouping`,
                        formType: 'select',
                        name: `grouping`,
                        label: 'Grouping',
                        selectSearchable: true,
                      }}
                      form={form}
                      formKey="device_grouping"
                      formRenderProps={formProps}
                      selectOptions={{
                        grouping,
                      }}
                    />
                  )}
                />
              </div>


<div className='grid grid-cols-2 gap-4 border p-4 mt-4 rounded-md pb-12'>

              
             

              <div className="flex flex-col">
              <FormField
                  control={control}
                  name="country"
                  render={(formProps) => (
                    <FormSelect
                      fieldConfig={{
                        id: `country`,
                        formType: 'select',
                        name: `country`,
                        label: `Country`,
                        selectSearchable: true,
                      }}
                      form={form}
                      formKey="device_country"
                      formRenderProps={{
                        ...formProps,

                        field: {
                          ...formProps.field,
                          onChange: (value) => {
                            form.setValue('country', value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                            form.setValue('city', '', {
                              shouldDirty: true,
                            })
                            form.setValue('state', '', {
                              shouldDirty: true,
                            })
                          },
                        },
                      }}
                      selectOptions={{
                        country: country_options,
                      }}
                    />
                  )}
                />
                <FormField
                  control={control}
                  name="state"
                  render={(formProps) => (
                    <FormSelect
                      fieldConfig={{
                        id: `state`,
                        formType: 'select',
                        name: `state`,
                        label: `State/Province`,
                        selectSearchable: true,
                      }}
                      form={form}
                      formKey="device_state"
                      formRenderProps={{
                        ...formProps,

                        field: {
                          ...formProps.field,
                          onChange: (value) => {
                            form.setValue('state', value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                            form.setValue('city', '', {
                              shouldDirty: true,
                            })
                          },
                        },
                      }}
                      selectOptions={{
                        state: state_options,
                      }}
                    />
                  )}
                />
                 <FormField
                  control={control}
                  name="city"
                  render={(formProps) => (
                    <FormSelect
                      fieldConfig={{
                        id: `city`,
                        formType: 'select',
                        name: `city`,
                        label: `City`,
                        selectSearchable: true,
                      }}
                      form={form}
                      formKey="device_city"
                      formRenderProps={formProps}
                      selectOptions={{
                        city: city_options,
                      }}
                    />
                  )}
                />

                
              </div>
           

              {/* Map component */}
              <div className=" justify-center">
                <div className=" w-[500px] h-[185px] rounded-md">
                  <h1 className='m-1 text-md font-semibold'>Maps</h1>
                  <Map
                    country={selected_country}
                    state={selected_state}
                    city={selected_city}
                  />
                </div>
              </div>
</div>
              
              
            </>
          </FormItem>
        )
      }}
    />
  )
}
