import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, Fragment } from 'react';
import { type UseFormReturn } from 'react-hook-form';

import FormRadio from '~/components/platform/FormBuilder/FormType/FormRadio';
import { FormField } from '~/components/ui/form';

interface ICategoryDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  selectOptions?: Record<string, any>;
}

export default function CustomCategoryDetails({ form }: ICategoryDetails) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <FormField
      control={form.control}
      name={'categories'}
      render={(formProps) => {
        return (
          <FormRadio
            fieldConfig={{
              id: `categories`,
              formType: 'radio',
              name: `categories`,
              label: 'Category',
              required: true,
            }}
            form={form}
            formKey="ContactCategoryDetails"
            formRenderProps={{
              ...formProps,
              field: {
                ...formProps.field,
                onChange: (value) => {
                  form.setValue('categories', value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  router.replace(`${pathname}?categories=${value}`);
                  router.refresh();
                },
              },
            }}
            radioOptions={{
              categories: [
                { label: 'External User', value: 'External User' },
                { label: 'Internal User', value: 'Internal User' },
              ],
            }}
          />
        );
      }}
    />
  );
}
