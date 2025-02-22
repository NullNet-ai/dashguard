'use client'

import FormModule from '~/components/platform/FormBuilder/components/ui/FormModule/FormModule'
import { Form } from '~/components/ui/form'

export default function MultiFieldForms(props: any) {
  const { form, formSchema, fieldConfig } = props

  return (
    <div className="w-full">
      <Form {...form}>
        <FormModule
          form={form}
          formKey="user-profile"
          formSchema={formSchema}
          fields={[
            {
              id: 'multi-field',
              formType: 'multi-field',
              name: `group-tab-field`,
              label: `${fieldConfig.label}`,
              multiFieldConfig: {
                parentProps: props,
                fields: {
                  id: 'fullName',
                  formType: 'input',
                  name: 'full-name',
                  label: 'Full Name',
                  required: true,
                  placeholder: 'Enter your full name...',
                },
                fieldOptions: [
                  {
                    fieldType: 'input',
                    label: 'Full Name',
                  },
                  {
                    fieldType: 'select',
                    label: 'Select Control',
                    options: [
                      {
                        value: 'john.doe@example.com',
                        label: 'john.doe@example.com',
                      },
                      {
                        value: 'test.doe@example.com',
                        label: 'test.doe@example.com',
                      },
                    ],
                  },
                  {
                    fieldType: 'select',
                    label: 'Select Control 2',
                    options: [
                      {
                        value: 'ss.doe@example.com',
                        label: 'ss.doe@example.com',
                      },
                      {
                        value: 'ff.doe@example.com',
                        label: 'ff.doe@example.com',
                      },
                    ],
                  },
                ],
              },
            },
          ]}
        />
      </Form>
    </div>
  )
}
