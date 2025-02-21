import { closestCorners } from '@dnd-kit/core'
import { DevTool } from '@hookform/devtools'
import { capitalize } from 'lodash'
import { GripVerticalIcon, MinusIcon, PlusIcon } from 'lucide-react'
import React, { ComponentType, useEffect } from 'react'
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  useFieldArray,
  type UseFormReturn,
} from 'react-hook-form'

import { ButtonWithDropdown } from '~/components/platform/ButtonWithDropdown'
import { Button } from '~/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import GroupTab from '~/components/ui/group-tab'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from '~/components/ui/sortable'
import { cn } from '~/lib/utils'

import {
  type ICheckboxOptions,
  type IRadioOptions,
  type ISelectOptions,
  type IField,
} from '../../types/global/interfaces'
import { metadata } from '~/app/layout'

interface IProps {
  fieldConfig: IField
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>
    fieldState: ControllerFieldState
  }
  form: UseFormReturn<Record<string, any>, any, undefined>
  value?: string
  formKey: string
  formSchema: any
}

const FormGroupTab = ({
  fieldConfig,
  formRenderProps,
  form,
  formKey,
  formSchema,
}: IProps) => {
  const { fields, append, move, replace, update } = useFieldArray({
    control: form.control,
    name: formRenderProps.field.name,
  })

  const { register } = form
  const [selected, setSelected] = React.useState<any>(undefined)

  const isDisabled = formRenderProps.field.disabled || false

  const isHidden = fieldConfig.hidden

  const components = fieldConfig?.groupConfig?.components;
  const DefaultComponent = fieldConfig?.groupConfig?.defaultComponent;

  useEffect(() => {
    if (!fields?.length) {
      append([
        {
          id: crypto.randomUUID(),
          tabName: `${fieldConfig.groupConfig?.prefix} 1`,
          component : 'NewComingSoon',
          order: 1,
          metadata : {},
          tabChildren: []
        },
      ])
      // append({ ...initialVal, ...defValue });
    }
  }, [])

  if (isHidden) {
    return null
  }

  const renderFormControl = (
    field: IField & {
      selectOptions?: ISelectOptions[]
      radioOptions?: IRadioOptions[]
      checkboxOptions?: ICheckboxOptions[]
    },
    index: number,
    fieldType: string,
    selectOptions?: any,
    options?: any
  ) => {
    const commonProps = {
      disabled: isDisabled,
      className: 'h-10 px-3',
    }

    const handleChange = (e: string) => {
      form.setValue(`tabs.${options.index}.fields.${index}.${field.name}`, e, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }

    switch (fieldType) {
      case 'input':
        return (
          <FormItem>
            <FormControl>
              <Input
                {...register(`${fieldConfig.name}.${options.index}.fields.${index}.${field.name}`)}
                {...commonProps}
                placeholder={field.placeholder}
              />
            </FormControl>
          </FormItem>
        )
      case 'select':
        return (
          <FormItem>
            <FormControl>
              <Select
                {...register(`${fieldConfig.name}.${options.index}.fields.${index}.${field.name}`)}
                defaultValue={form.getValues(
                  `${fieldConfig.name}.${options.index}.fields.${index}.${field.name}`,
                )}
                onValueChange={handleChange}
              >
                <SelectTrigger {...commonProps}>
                  <SelectValue placeholder={options?.fieldOptions?.placeholder || field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(selectOptions)
                  && selectOptions.map((option: any) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )
      default:
        return null
    }
  }

  const dropOptions
    = fieldConfig.multiFieldConfig?.fieldOptions.map((option, index) => {
      return {
        label: option.label,
        onClick: (arg: any) => {
          const { index: parentIdx } = arg

          if (fields && fields[parentIdx]) {
            // @ts-expect-error 'fields' is possibly 'undefined'.
            const updatedFields = [...fields[parentIdx].fields, { fieldType: option.fieldType, name: option.name, optionId: index }]
            const updatedField = { ...fields[parentIdx], fields: updatedFields }

            update(parentIdx, updatedField)
            setTimeout(() => {
              setSelected({ id: parentIdx })
            }, 1000)
          }
        },
      }
    }) ?? []

  return (
    <GroupTab
      selected={selected}
      move={move}
      replace={replace}
      fields={fields}
      render={(field: any, idx) => {
        return (
          <SortableItem
            key={field.id}
            value={field.id}
            asChild
            onClick={() => {
              if (!isDisabled) {
                setSelected({
                  id: idx,
                })
              }
            }}
          >
            <div
              className={cn(
                `${selected?.id === idx ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`, 'border-b-default-100 flex flex-row items-center gap-2 border-b py-2', 'cursor-pointer bg-white',
              )}
            >
              <SortableDragHandle
                disabled={isDisabled}
                variant="link"
                size="icon"
                className="size-8 shrink-0 text-default/40"
              >
                <GripVerticalIcon
                  className={cn(
                    `${isDisabled ? 'h-0 w-0 opacity-0' : 'size-5'}`, '',
                  )}
                  aria-hidden="true"
                />
              </SortableDragHandle>
              <div className="min-w-[150px]">
                <span
                  className={cn(
                    `${idx === selected?.id ? 'font-semibold text-primary' : ''}`,
                  )}
                >
                  {capitalize(field.tabName)}
                </span>
              </div>
            </div>
          </SortableItem>
        )
      }}
      disabled={isDisabled}
      renderContent={(item: any, innerIndex: number) => {

        const { component, metadata } = item ?? {}

        if (innerIndex !== selected?.id) {
          return null
        }
  
        const SelectedComponent = components?.find((Component: ComponentType<any> | JSX.Element) => {
          // If it's a ComponentType, check its name
          if (typeof Component === 'function' && Component.name === component) {
            return true;
          }
          // If it's a JSX.Element, check its type name
          if (React.isValidElement(Component) && 
              typeof Component.type === 'function' && 
              Component.type.name === component) {
            return true;
          }
          return false;
        });

        if(SelectedComponent) {
          // If it's a ComponentType, render it as a component
          if (typeof SelectedComponent === 'function') {
            return (
              <SelectedComponent 
                {...metadata} 
                {...item} 
                index={innerIndex} 
                form={form} 
                formSchema={formSchema} 
                fieldConfig={fieldConfig} 
                formRenderProps={formRenderProps}
              />
            )
          }
          // If it's a JSX.Element, return it directly
          return SelectedComponent;
        }

        if(DefaultComponent) {
          if (typeof DefaultComponent === 'function') {
            return <DefaultComponent />
          }
          return DefaultComponent
        }
      }}
      onClickAddTab={() => {
        append({
          id: crypto.randomUUID(),
          tabName: `${fieldConfig.groupConfig?.prefix} ${fields?.length + 1}`,
          component : DefaultComponent?.name,
          order:  fields?.length + 1,
          metadata : {},
          tabChildren: []
        })
      }}
      // disabled={isdisabled}
      // onValueChange={setData}
      // onTabSelect={setSelected}
      // onClickAddTab={() => {
      //   setData([
      //     ...data,
      //     {
      //       id: crypto.randomUUID(),
      //       name: `Group ${data.length + 1}`,
      //       content: <div>Content of tab #: {data?.length + 1}</div>,
      //     },
      //   ]);
      // }}
    />
  )
};

export default FormGroupTab
