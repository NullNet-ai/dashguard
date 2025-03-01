import { DevTool } from '@hookform/devtools'
import { capitalize } from 'lodash'
import { GripVerticalIcon, MinusIcon, PlusIcon } from 'lucide-react'
import React, { useEffect } from 'react'
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

interface IProps {
  fieldConfig: IField
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>
    fieldState: ControllerFieldState
  }
  form: UseFormReturn<Record<string, any>, any, undefined>
  value?: string
  formKey: string
}

const FormMultiField = ({
  fieldConfig,
  formRenderProps,
  form,
  formKey,
}: IProps) => {
  const parentProps = fieldConfig?.multiFieldConfig?.parentProps

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const fieldhook = !parentProps ? useFieldArray({
    control: form.control,
    name: 'example_field_only',
    shouldUnregister: true,
  }) : null

  const [customFields, setCustomFields] = React.useState([])

  const register = parentProps ? parentProps?.customMeta?.register : form.register

  const { fields, append, move, remove, update } = parentProps?.customMeta || fieldhook

  const { form: newForm } = parentProps ?? {}

  const isDisabled = formRenderProps.field.disabled
  const isHidden = fieldConfig.hidden

  const defValue = fieldConfig.multiFieldConfig?.fields?.name
    ? { [fieldConfig.multiFieldConfig.fields.name]: '', fieldType: 'input' }
    : { name: '', fieldType: 'input' }

  useEffect(() => {
    if (!parentProps && !fields?.length) {
      append(defValue)
    }
    else {
      if (parentProps) {
        const items = parentProps.fields?.map((field: any, index: number) => {
          const newField = {
            name: field.name,
            id: field.id,
            fieldType: field.fieldType,
            optionId: field.optionId,
            order: index + 1,
          }
          return newField
        })

        setCustomFields(items)
      }
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
    customname?: string
  ) => {
    const commonProps = {
      disabled: isDisabled,
      className: 'h-10 px-3',
    }

    const handleChange = (e: string) => {
      form.setValue(`${customname ? customname : `${fieldConfig.name} {index}.${field.name}`}`, e, {
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
                {...register(`${customname ? customname : `${fieldConfig.name} {index}.${field.name}`}`)}
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
                {...register(`${customname ? customname : `${fieldConfig.name} {index}.${field.name}`}`)}
                defaultValue={form.getValues(
                  `${customname ? customname : `${fieldConfig.name} {index}.${field.name}`}`,
                )}
                onValueChange={handleChange}
              >
                <SelectTrigger {...commonProps}>
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(selectOptions)
                  && selectOptions.map(option => (
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
      onClick: () => {
        if (!parentProps) {
          append({
            name: option.label,
            fieldType: option.fieldType,
            optionId: index,
          })
        }
        else {
          const parentFields = parentProps.metadata.fields
          const parentIndex = parentProps.index

          const newFields: any = [...parentFields, {
            name: option.label,
            fieldType: option.fieldType,
            id: crypto.randomUUID(),
            value: '',
            optionId: index,
          }]
          setCustomFields(newFields)
          update(parentIndex, {
            id: parentProps.id,
            metadata: {
              fields: newFields,
            },
            optionId: index,
            order: newFields.length - 1,
            tabName: parentProps.tabName,
            component: parentProps.component,
            tabChildren: parentProps.tabChildren,
          })
        }
      },
    }
  }) ?? []

  return (
    <FormItem>
      <div className="py-2 h-[49px]">
        <ButtonWithDropdown
          entity='test'
          buttonClassName=""
          buttonVariant='default'
          leftIcon={PlusIcon}
          buttonLabel='Add'
          dropdownOptions={dropOptions}
          side="start"
          disabled={
            isDisabled
          }
        />
      </div>
      <div className="border-t-default-100 border-b border-t border-b-primary !m-0 h-[49px] flex items-center">
        <FormLabel className="">{fieldConfig.label}</FormLabel>
      </div>
      <FormControl>
        <Sortable
          value={parentProps ? customFields : fields}
          onMove={({ activeIndex, overIndex }) => {
            if (!parentProps) {
              move(activeIndex, overIndex)
            }
            else {
              const parentFields = parentProps.metadata.fields
              const parentIndex = parentProps.index
              const newFields: any = [...parentFields]
              newFields.splice(overIndex, 0, newFields.splice(activeIndex, 1)[0])
              setCustomFields(newFields)
              update(parentIndex, {
                id: parentProps.id,
                metadata: {
                  fields: newFields,
                },
                order: newFields.length - 1,
                tabName: parentProps.tabName,
                component: parentProps.component,
                tabChildren: parentProps.tabChildren,
              })
            }
          }}
        >
          <div className="!m-0 flex w-full flex-col">
            {(parentProps ? customFields : fields).map((field: any, index: any) => {
              return (
                <SortableItem
                  key={field.id}
                  value={field.id}
                  asChild
                  draggable={isDisabled ? false : true}
                >
                  <div className="border-default-100 flex flex-row items-center gap-2 border-b py-2">
                    {!isDisabled
                      ? (
                          <SortableDragHandle
                            variant="link"
                            size="icon"
                            className="size-8 shrink-0 text-default/40"
                            disabled={isDisabled}
                          >
                            <GripVerticalIcon />
                          </SortableDragHandle>
                        )
                      : null}
                    <div className="min-w-[150px]">
                      <FormLabel className="font-normal">
                        { parentProps
                          ? capitalize(field?.name?.replace(/[-_]/g, ' '))
                          : form.getValues(`${fieldConfig.name}.${index}.name`)
                            ?? fieldConfig.multiFieldConfig?.fields?.label}
                      </FormLabel>
                    </div>
                    <div
                      className={cn(
                        'flex-1', `${form.getValues(`${fieldConfig.name}.${index}.fieldType`) === 'input' ? '' : ''}`,
                      )}
                    >
                      <FormField
                        control={parentProps ? newForm.control : form.control}
                        disabled={isDisabled}
                        name={`${fieldConfig.multiFieldConfig?.fields.name}-${index}-${fieldConfig?.name ?? ''}`}
                        render={() => {
                          const fieldname = parentProps ? `${parentProps?.fieldConfig?.name}.${parentProps?.index}.metadata.fields.${index}.value` : undefined
                          const optionsID = parentProps
                            ? field?.optionId
                            : form.getValues(
                                `${fieldConfig.name}.${index}.optionId`,
                              )

                          return fieldConfig.multiFieldConfig
                            ? (
                                (renderFormControl(
                                  fieldConfig.multiFieldConfig.fields, index, field.fieldType, fieldConfig.multiFieldConfig?.fieldOptions[optionsID]?.options ?? [], fieldname
                                ) ?? <div />)
                              )
                            : (
                                <div />
                              )
                        }}
                      />
                    </div>
                    {!isDisabled
                      ? (
                          <Button
                            disabled={isDisabled}
                            type="button"
                            variant="softDestructive"
                            size="icon"
                            className=" size-6 shrink-0 rounded-full"
                            onClick={() => {
                              if (!parentProps) {
                                remove(index)
                              }
                              else {
                                const parentFields = parentProps.metadata.fields
                                const parentIndex = parentProps.index
                                const newItems = parentFields?.filter((f: any) => f.id !== field.id)
                                setCustomFields(newItems)
                                update(parentIndex, {
                                  id: parentProps.id,
                                  metadata: {
                                    fields: newItems,
                                  },
                                  order: 1,
                                  tabName: parentProps.tabName,
                                  component: parentProps.component,
                                  tabChildren: parentProps.tabChildren,
                                })
                              }
                            }}
                          >
                            <MinusIcon
                              className="size-4 text-destructive"
                              aria-hidden="true"
                            />
                            <span className="sr-only">Remove</span>
                          </Button>
                        )
                      : null}
                  </div>
                </SortableItem>
              )
            })}
          </div>
        </Sortable>
      </FormControl>
      <DevTool control={form.control} />
      <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
    </FormItem>
  )
}

export default FormMultiField
