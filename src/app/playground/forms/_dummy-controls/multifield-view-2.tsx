'use client'

import { toast } from 'sonner'
import { z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'

export default function GroupTabView2() {
  const FormSchema = z.object({
    tabs: z.array(
      z.object({
        id: z.string(),
        tabName: z.string(),
        fields: z.array(
          z.object({
            fieldType: z.string(),
            fieldName: z.string(),
          }),
        ),
      }),
    ),
  })

  const handleSave = async (values: { data: z.infer<typeof FormSchema> }) => {
    return new Promise<void>((resolve, reject) => {
      try {
        toast(
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              {JSON.stringify(values.data, null, 2)}
            </code>
          </pre>,
        )
        resolve()
      }
      catch (error) {
        console.error('Profile update error', error)
        toast.error('Failed to update profile. Please try again.')
        reject(new Error('Profile update error'))
      }
    })
  };

  return (
    <FormBuilder
      enableFormRegisterToParent
      formLabel="Group Tab Form"
      formKey="user-profile"
      handleSubmit={handleSave}
      formSchema={FormSchema}
      customDesign={{
        formClassName: 'grid-cols-1 lg:grid-cols-1',
      }}
      defaultValues={{
        tabs: [
          {
            id: crypto.randomUUID(),
            tabName: 'Group Tab 1',
            fields: [
              {
                fieldType: 'input',
                fullname: 'juphter',
              },
            ],
          },
        ],
      }}
      fields={[
        {
          id: 'tabs',
          formType: 'group-multi-field',
          name: 'tabs',
          label: 'Group Multi Field',
          multiFieldConfig: {
            fields: {
              id: 'fullName',
              formType: 'input',
              name: 'fullname',
              label: 'Full Name',
              required: true,
              disabled: false,
              placeholder: 'Enter your full name...',
            },
            fieldOptions: [
              {
                fieldType: 'input',
                label: 'Full Name',
                name: 'fullname',
              },
              {
                fieldType: 'select',
                label: 'Select Control',
                placeholder: 'Select an option...',
                name: 'email',
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
                placeholder: 'Select an option...',
                name: 'email2',
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
  )
}
