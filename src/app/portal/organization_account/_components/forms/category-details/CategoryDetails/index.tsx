import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, Fragment } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import FormRadio from '~/components/platform/FormBuilder/FormType/FormRadio'
import { FormField } from '~/components/ui/form'

interface ICategoryDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>
  selectOptions?: Record<string, any>
}

export default function CustomCategoryDetails({ form }: ICategoryDetails) {
  const router = useRouter()
  const pathname = usePathname()

  // this is needed to trigger the setting of the default value
  useEffect(() => {
    form.setValue('categories', 'User', {
      shouldValidate: true,
      shouldDirty: true,
    }
    )
  }, [])

  return (
    <FormField
      control={form.control}
      name={"categories"}
      render={(formProps) => {
        return (
          <FormRadio
            fieldConfig={ {
              id: `categories`,
              formType: 'radio',
              name: `categories`,
              label: 'Category',
            } }
            form={ form }
            formKey='ContactCategoryDetails'
            formRenderProps={ {
              ...formProps,
              field: {
                ...formProps.field,
                onChange: (value) => {
                  form.setValue('categories', value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                  router.replace(`${pathname}?categories=${value}`)
                  router.refresh()
                },
              },
            } }
            radioOptions={ {
              categories: [{ label: 'User', value: 'User' }],
            }}
          />
        )
      } }
    />
  )
}
