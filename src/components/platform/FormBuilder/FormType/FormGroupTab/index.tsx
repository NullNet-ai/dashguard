import { capitalize } from 'lodash'
import { GripVerticalIcon } from 'lucide-react'
import React, { useEffect } from 'react'
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  useFieldArray,
  type UseFormReturn,
} from 'react-hook-form'

import GroupTab from '~/components/ui/group-tab'
import {
  SortableDragHandle,
  SortableItem,
} from '~/components/ui/sortable'
import { cn } from '~/lib/utils'

import {
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
  formSchema: any
}

const FormGroupTab = ({
  fieldConfig,
  formRenderProps,
  form,
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
          component: 'NewComingSoon',
          order: 1,
          metadata: {},
          tabChildren: [],
        },
      ])
      // append({ ...initialVal, ...defValue });
    }
  }, [])

  if (isHidden) {
    return null
  }

  return (
    <GroupTab
      selected={selected}
      move={move}
      replace={replace}
      fields={fields}
      render={(field: any) => {
        return (
          <SortableItem
            key={field.id}
            value={field.id}
            asChild
            onClick={() => {
              if (!isDisabled) {
                setSelected({
                  id: field.tabName,
                })
              }
            }}
          >
            <div
              className={cn(
                `${selected?.id === field.tabName ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`, 'border-b-default-100 flex flex-row items-center gap-2 border-b py-2', 'cursor-pointer bg-white',
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
                    `${isDisabled ? ' opacity-60' : 'size-5'}`, '',
                  )}
                  aria-hidden="true"
                />
              </SortableDragHandle>
              <div className="min-w-[150px]">
                <span
                  className={cn(
                    `${isDisabled ? '!text-gray-500' : ''}`, `${field.tabName === selected?.id ? 'font-semibold text-primary' : ''}`,
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

        if (item.tabName !== selected?.id) {
          return null
        }
        const SelectedComponent
        = components?.find((Component: any) => {
          // If it's a ComponentType, check its name
          if (typeof Component === 'function' && Component.name === component) {
            return true;
          }
          // If it's a JSX.Element, check its type name
          if (React.isValidElement(Component)
            && typeof Component.type === 'function'
            && Component.type.name === component) {
            return true;
          }
          return false;
        });

        if (SelectedComponent) {
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
                customMeta={{ fields, append, move, replace, update, register }}
              />
            )
          }
          // If it's a JSX.Element, return it directly
          return SelectedComponent;
        }

        if (DefaultComponent) {
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
          component: DefaultComponent?.name,
          order: fields?.length + 1,
          metadata: {},
          tabChildren: [],
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
