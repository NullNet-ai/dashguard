import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/20/solid'
import { ChevronDownIcon } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from 'react-hook-form'
import { usePopper } from 'react-popper'

import { Badge } from '~/components/ui/badge'
import {
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '~/components/ui/form'
import { useToast } from '~/context/ToastProvider'
import { cn, formatFormTestID } from '~/lib/utils'

import { createRecord } from '../../Actions/CreateRecord'
import { type IField, type ISelectOptions } from '../../types'

interface IProps {
  fieldConfig: IField
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>
    fieldState: ControllerFieldState
  }
  selectOptions: Record<string, ISelectOptions[]> | undefined
  form: UseFormReturn<Record<string, any>, any, undefined>
  pillOptions?: any[]
  formKey: string
}

export default function FormSelect({
  fieldConfig,
  formRenderProps,
  selectOptions,
  pillOptions,
  formKey,
  form,
}: IProps) {
  form.watch(fieldConfig?.name)
  const toast = useToast()
  const { error } = useFormField()

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const isDisabled = fieldConfig.disabled ?? false
  const isReadOnly = formRenderProps.field.disabled || fieldConfig.readonly

  const [referenceElement, setReferenceElement] = useState<any>(null)
  const [popperElement, setPopperElement] = useState<any>(null)
  const [options, setOptions] = useState<ISelectOptions[]>(
    selectOptions?.[fieldConfig?.name] ?? []
  )
  const [isCreateLoading, setIsCreateLoading] = useState(false)

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-start',
    modifiers: [
      {
        name: 'preventOverflow',
        options: {
          rootBoundary: 'viewport',
        },
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['top-start'],
        },
      },
    ],
  })

  const SelectIcon = fieldConfig.selectIcon

  // Helper function to check if a string is numeric
  // Helper function to sort options
  const sortOptions = useCallback((opts: ISelectOptions[]) => {
    const isNumeric = (str: string) => {
      if (typeof str !== 'string') return false
      return !isNaN(parseFloat(str)) && isFinite(Number(str))
    }

    return [...opts].sort((a, b) => {
      // Check if both values are numeric strings
      if (isNumeric(a.value) && isNumeric(b.value)) {
        return Number(a.value) - Number(b.value)
      }
      // Fall back to alphabetical sorting if not numeric
      return a.label?.localeCompare(b.label) ?? 0
    })
  }, [])

  const filteredOptions = useMemo(() => {
    const filtered = query === ''
      ? options?.filter(opt => !!opt?.label)?.slice(0, 250)
      : options
        ?.filter((opt) => {
          return opt.label.toLowerCase().includes(query.toLowerCase().trim())
        })
        ?.slice(0, 5)
        ?.filter(opt => !!opt?.label)

    return sortOptions(filtered ?? [])
  }, [query, options, sortOptions])

  React.useEffect(() => {
    if(fieldConfig?.selectEnableCreate) return
    setOptions(selectOptions?.[fieldConfig?.name] ?? [])
  }, [selectOptions, fieldConfig?.name])

  const label = useMemo(() => {
    return options?.find(opt => opt.value === formRenderProps?.field.value)
  }, [formRenderProps?.field.value, options])

  const inputReadOnly = useMemo(() => {
    return (
      (!fieldConfig?.selectSearchable && !fieldConfig?.selectEnableCreate)
      || isReadOnly
      || isDisabled
    )
  }, [
    fieldConfig?.selectSearchable,
    isReadOnly,
    isDisabled,
    fieldConfig?.selectEnableCreate,
  ])

  const createNewRecord = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  
    if (!fieldConfig?.selectOnCreateRecord) {
      toast.error('selectOnCreateRecord is not defined in fieldConfig')
      return
    }
    if (fieldConfig?.selectOnCreateValidate) {
      const validation = await fieldConfig?.selectOnCreateValidate(query)
      if (!validation?.valid) {
        toast.error(validation?.message || 'Invalid Input')
        return
      }
    }
    setIsCreateLoading(true)
    let createdData = null
    if (typeof fieldConfig?.selectOnCreateRecord === 'function') {
      createdData = await fieldConfig?.selectOnCreateRecord(query)
    }
    else {
      const { entity, fieldIdentifier, customParams }
        = fieldConfig?.selectOnCreateRecord ?? {}
      createdData = (await createRecord({
        entity,
        fieldIdentifier,
        data: {
          ...(customParams ?? {}),
          [fieldIdentifier]: query,
        },
      })) as ISelectOptions
    }
    setOptions(sortOptions([...(options ?? []), createdData]))
    formRenderProps?.field.onChange(createdData?.value || '')
    setIsCreateLoading(false)
    setTimeout(() => setOpen(false), 100)
  }

  const isOptionsExist = options?.find(p => p.label === query?.trim())

  return (
    <FormItem>
      <div>
        <FormLabel
          data-test-id = { `${formKey}-lbl-${fieldConfig.name}` }
          required = { fieldConfig?.required }
        >
          {fieldConfig?.label}
        </FormLabel>
        {pillOptions?.length
          ? (
              <>
              {pillOptions.map((option, index) => (
                  <Badge
                  className = "mx-2 border border-success bg-success/10 text-success"
                  data-test-id = { `${formKey}-opt-${option}-${fieldConfig.name}` }
                  key = { index }
                >
                  {option}
                </Badge>
                ))}
            </>
            )
          : null}
      </div>
      <Combobox
        as = "div"
        disabled = { isDisabled }
        value = {
          label || {
            label: query,
            value: '',
          }
        }
        onChange = { (value) => {
          setTimeout(() => setOpen(false), 100)
          setQuery('')
          formRenderProps?.field.onChange(value?.value || '')
        } }
      >
        <div className="relative mt-2">
          {SelectIcon && (
            <SelectIcon
              aria-hidden = "true"
              className = { cn(
                'absolute left-2 top-2.5 size-5 text-muted-foreground', {
                  'opacity-50': isDisabled,
                },
              ) }
            />
          )}
          <ComboboxInput
            className={cn(
              'block w-full rounded-md border-border py-[5px] pl-8 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary disabled:border-gray-300 disabled:bg-secondary disabled:text-gray-400 sm:text-sm/6', {
                'outline-destructive': error,
                'border-destructive': error,
                'cursor-text': isReadOnly,
              }, SelectIcon ? 'pl-8' : 'pl-2',
            )}
            disabled={isDisabled}
            placeholder={fieldConfig.placeholder}
            readOnly={inputReadOnly}
            ref={setReferenceElement}
            onBlur={() => {
              setTimeout(() => setOpen(false), 100)
            }}
            onChange={event => setQuery(event.target.value)}
            onClick={() => {
              if (isDisabled || isReadOnly) return
              setOpen(true)
            }}
            data-test-id={`${formKey}-inp-${fieldConfig.name}`}
            // @ts-expect-error - Type 'string' is not assignable to type 'undefined'.
            displayValue={value => value?.label}
          />
          <ComboboxButton
            className = { cn(
              'inset-y-0 right-0 flex w-full items-center rounded-r-md focus:outline-none', {
                'cursor-default': isReadOnly,
              },
            ) }
            data-test-id = { `${formKey}-btn-${fieldConfig.name}` }
            disabled = { isDisabled }
          >
            <ChevronDownIcon
              aria-hidden = "true"
              className = { cn(
                'absolute right-2 top-2.5 size-5 text-muted-foreground', {
                  'opacity-50': isDisabled || isReadOnly,
                },
              ) }
            />
          </ComboboxButton>
          {!(isDisabled || isReadOnly) && (
            <ComboboxOptions
              ref = { setPopperElement }
              static = { open }
              style = { styles.popper }
              { ...attributes.popper }
              className = "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
              data-test-id = { `${formKey}-opts-${fieldConfig.name}` }
            >
              {filteredOptions?.slice(0, 700).map(opt => (
                <ComboboxOption
                  className = { cn(
                    'group relative cursor-default select-none py-2 text-md  pr-12 text-foreground data-[focus]:bg-primary data-[focus]:text-white data-[focus]:outline-none', SelectIcon ? 'pl-8' : 'pl-2', {
                      'cursor-not-allowed': isDisabled,
                      'cursor-default': isReadOnly,
                    },
                  ) }
                  data-test-id = { `${formKey}-opt-${formatFormTestID(opt.value)}-${fieldConfig.name}` }
                  disabled = { isDisabled || isReadOnly }
                  key = { opt?.value }
                  value = { opt }
                >
                  <span
                    className="block truncate"
                    data-test-id={`${formKey}-opt-${formatFormTestID(opt.value)}-lbl-${fieldConfig.name}`}
                  >
                    {opt.label}
                  </span>

                  <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-primary group-data-[selected]:flex group-data-[focus]:text-white">
                    <CheckIcon aria-hidden = "true" className = "size-5" />
                  </span>
                </ComboboxOption>
              ))}
              {fieldConfig?.selectEnableCreate
                ? (
                    !isOptionsExist
                    && query && (
                      <button
                        className="block cursor-pointer truncate px-3 py-2 text-secondary-foreground hover:bg-primary hover:text-primary-foreground  bg-primary/10 font-bold"
                        data-test-id={`${formKey}-opt-create-new-${fieldConfig.name}`}
                        onClick={createNewRecord}
                      >
                        {isCreateLoading ? 'Creating...' : `Create "${query}"`}
                      </button>
                    )
                  )
                : (
                    !filteredOptions.length && (
                      <span
                        className="block truncate group-data-[selected]:font-semibold ms-3"
                        data-test-id={`${formKey}-opt-not-found-${fieldConfig.name}`}
                      >
                        {'No '}
                        {' '}
                        {fieldConfig?.label}
                        {' '}
                        found.
                      </span>
                    )
                  )}
            </ComboboxOptions>
          )}
        </div>
      </Combobox>

      <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
    </FormItem>
  )
}
