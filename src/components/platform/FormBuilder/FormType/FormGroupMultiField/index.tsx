import { closestCorners } from '@dnd-kit/core'
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

const FormGroupMultiField = ({
  fieldConfig,
  formRenderProps,
  form,
  formKey,
}: IProps) => {
  const { fields, append, move, update, replace } = useFieldArray({
    control: form.control,
    name: formRenderProps.field.name,
  })
  const { register } = form
  const [selected, setSelected] = React.useState<any>(undefined)

  const isDisabled = formRenderProps.field.disabled || false

  const isHidden = fieldConfig.hidden

  useEffect(() => {
    if (!fields?.length) {
      append([
        {
          id: crypto.randomUUID(),
          tabName: 'Group Tab 1',
          fields: [
            {
              fieldType: 'input',
              fullname: '',
            },
          ],
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

          if (fields?.[parentIdx]) {
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
      replace={replace}
      disabled={ isDisabled }
      fields={ fields }
      move={ move }
      render={ (field: any, idx) => {
        return (
          <SortableItem
            asChild={ true }
            key={field.id}
            value={field.id}
            onClick={() => {
              if (!isDisabled) {
                setSelected({
                  id: idx,
                })
              }
            }}
          >
            <div
              className={ cn(
                `${selected?.id === idx ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`, 'border-b-default-100 flex flex-row items-center gap-2 border-b py-2', 'cursor-pointer bg-white',
              ) }
            >
              <SortableDragHandle
                className={"size-8 shrink-0 text-default/40"}
                disabled={isDisabled}
                size={"icon"}
                variant={"link"}
              >
                <GripVerticalIcon
                  aria-hidden={"true"}
                  className={cn(
                    `${isDisabled ? 'h-0 w-0 opacity-0' : 'size-5'}`, '',
                  )}
                />
              </SortableDragHandle>
              <div className="min-w-[150px]">
                <span
                  className={ cn(
                    `${idx === selected?.id ? 'font-semibold text-primary' : ''}`,
                    `${isDisabled ? '!text-default-400' : ''}`,
                  ) }
                >
                  {capitalize(field.tabName)}
                </span>
              </div>
            </div>
          </SortableItem>
        )
      } }
      renderContent={ (item,) => {
        const { field, index: parentIdx } = item
        if (parentIdx !== selected?.id) {
          return null
        }

        return (
          <div className="flex-1">
            <FormItem>
              <div className="h-[49px] py-2">
                <ButtonWithDropdown
                  buttonClassName={""}
                  buttonLabel="Add"
                  buttonVariant="default"
                  disabled={isDisabled}
                  dropdownOptions={dropOptions as any}
                  entity="group-tab-btn-drpdwn"
                  leftIcon={PlusIcon}
                  // options={item as any}
                  side={"start"}
                />
              </div>
              <div className="border-t-default-100 !m-0 flex h-[49px] items-center border-b border-t border-b-primary">
                <FormLabel className="">{fieldConfig.label}</FormLabel>
              </div>
              <FormControl>
                <Sortable
                  collisionDetection={closestCorners}
                  value={field?.fields}
                  orientation="vertical"
                  // onMove={({ activeIndex, overIndex }) =>
                  //   move(activeIndex, overIndex)
                  // }
                >
                  <div className="!m-0 flex w-full flex-col">
                    {field?.fields.length
                      ? (
                          field?.fields.map((innerField: any, index: number) => {
                            return (
                              <SortableItem
                                asChild={ true }
                                draggable={!isDisabled}
                                key={index}
                                value={index}
                              >
                                <div className="border-default-100 flex flex-row items-center gap-2 border-b py-2">
                                  {!isDisabled
                                    ? (
                                        <SortableDragHandle
                                          className={"size-8 shrink-0 text-default/40"}
                                          disabled={isDisabled}
                                          size={"icon"}
                                          variant={"link"}
                                        >
                                          <GripVerticalIcon />
                                        </SortableDragHandle>
                                      )
                                    : null}
                                  <div className="min-w-[150px]">
                                    <FormLabel className="font-normal">
                                      {form.getValues(
                                        `${fieldConfig.name}.${index}.name`,
                                      )
                                      ?? fieldConfig.multiFieldConfig?.fields?.label}
                                    </FormLabel>
                                  </div>
                                  <div
                                    className={ cn(
                                      'flex-1', `${form.getValues(`${fieldConfig.name}.${index}.fieldType`) === 'input' ? '-mt-[8px]' : ''}`,
                                    ) }
                                  >
                                    <FormField
                                      control={ form.control }
                                      disabled={ isDisabled }
                                      name={ `${fieldConfig.multiFieldConfig?.fields.name}-${parentIdx}-fields-${index}-${fieldConfig?.name ?? ''}` }
                                      render={ () => fieldConfig.multiFieldConfig
                                        ? (
                                            (renderFormControl(
                                              fieldConfig.multiFieldConfig.fields, index, innerField.fieldType, fieldConfig.multiFieldConfig
                                                ?.fieldOptions[
                                                  form.getValues(
                                                    `tabs.${parentIdx}.fields.${index}.optionId`,
                                                  )
                                                ]?.options ?? [], { ...item, index: parentIdx, fieldOptions: fieldConfig.multiFieldConfig.fieldOptions[form.getValues(
                                                `tabs.${parentIdx}.fields.${index}.optionId`,
                                              )] }
                                            ) ?? <div />)
                                          )
                                        : (
                                            // eslint-disable-next-line react/jsx-no-useless-fragment
                                            <></>
                                          ) }
                                    />
                                  </div>
                                  {!isDisabled && (
                                    <Button
                                      className={"mt-2 size-6 shrink-0 rounded-full"}
                                      disabled={isDisabled}
                                      size={"icon"}
                                      type={"button"}
                                      variant={"softDestructive"}
                                      onClick={() => {
                                        if (fields?.[parentIdx]) {
                                          // @ts-expect-error 'fields' is possibly 'undefined'.
                                          const updatedFields = fields[parentIdx]?.fields.filter(
                                            (_: any, idx: number) => idx !== index
                                          )
                                          const updatedField = {
                                            ...fields[parentIdx],
                                            fields: updatedFields,
                                          }
                                          update(parentIdx, updatedField)
                                        }
                                      }}
                                    >
                                      <MinusIcon
                                        aria-hidden={"true"}
                                        className={"size-4 text-destructive"}
                                      />
                                      <span className="sr-only">{"Remove"}</span>
                                    </Button>
                                  )}
                                </div>
                              </SortableItem>
                            )
                          })
                        )
                      : (
                          <div className="text-left text-sm text-default-400 py-4 px-2">
                            {"No fields added"}
                          </div>
                        )}
                  </div>
                </Sortable>
              </FormControl>
              <DevTool control={ form.control } />
              <FormMessage
                data-test-id={ `${formKey}-err-msg-${fieldConfig.name}` }
              />
            </FormItem>
          </div>
        )
      } }
      selected={ selected }
      onClickAddTab={() => {
        append({
          id: crypto.randomUUID(),
          tabName: `Group Tab ${fields.length + 1}`,
          fields: [
            {
              fieldType: 'input',
              fullname: '',
            },
          ],
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
}

export default FormGroupMultiField
