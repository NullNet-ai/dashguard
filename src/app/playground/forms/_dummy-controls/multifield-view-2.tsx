'use client'

import { group } from 'console'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import NewComingSoon from '~/components/ui/coming-soon'

export default function GroupTabView2() {
  const FormSchema = z.object({
    tabs: z.array(
      z.object({
        id: z.string(),
        tabName: z.string(),
        order: z.number().min(1), // Ensure order is at least 1
        metadata: z.object({}),
        tabChildren: z.array(
          z.object({
            id: z.string(),
            tabName: z.string(),
            order: z.number().min(1),
            metadata: z.object({}),
            component: z.string(),
          }),
        ),
        component: z.string(),
      }),
    ).transform(items => 
      // Sort items by order when retrieving
      [...items].sort((a, b) => a.order - b.order)
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
            tabName: 'Tab 1',
            order:1,
            metadata:{},
            tabChildren: [],
            component: 'NewComingSoon'
          },
        ],
      }}
      fields={[
        {
          id: 'tabs',
          disabled: false,
          formType: 'group-tab',
          name: 'tabs',
          label: 'Group Multi Field',
          groupConfig: {
            prefix: 'Tab',
            components: [
              NewComingSoon,
            ],
          }
        },
      ]}
    />
  ) 
 
}
