'use client'

import { toast } from 'sonner'
import { z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { platformPasswordValidator } from '~/components/platform/FormBuilder/Utils/platformPasswordValidation'

const FormSchema = z.object({
  password: z.string().superRefine((value, ctx) => {
    platformPasswordValidator(value, ctx)
  }),
})

export default function PasswordDetails() {
  function handleSave(values: {
    data: z.infer<typeof FormSchema>
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        toast(
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {JSON.stringify(values.data, null, 2)}
            </code>
          </pre>,
        )
        resolve()
      }
      catch (error) {
        console.error('Form submission error', error)
        toast.error('Failed to submit the form. Please try again.')
        reject(new Error('Form submission error'))
      }
    })
  }

  return (
    <>
      {/* FormBuilder: User Registration Password */}
      <FormBuilder
        enableFormRegisterToParent={true}
        fields={[
          {
            id: 'password',
            formType: 'password',
            name: 'password',
            label: 'Create Password',
            required: true,
            showPasswordStrengthBar: false,
            hasComplexValidation: false,
            placeholder: 'Enter your password',
          },
        ]}
        formKey="user-registration"
        formLabel="User Registration"
        formSchema={FormSchema}
        handleSubmit={handleSave}
      />
    </>
  )
}
