'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import FormPassword from '~/components/platform/FormBuilder/FormType/FormPassword'
import { Button } from '~/components/ui/button'
import { Form, FormField, FormMessage } from '~/components/ui/form'

import { setNewPassword } from '../actions/setNewPassword'

const SetupPasswordFormSchema = z.object({
  new_password: z.string(),
})

const SetupPasswordForm = () => {
  const form = useForm({
    resolver: zodResolver(SetupPasswordFormSchema),
  })

  const searchParams = useSearchParams()
  const accountId = searchParams.get('filter_id')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await setNewPassword({
        account_secret: data.new_password as string,
        id: accountId!,
      })
    }
    catch (error: unknown) {
      setError('Something went wrong')
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        className='space-y-6'
        onSubmit={(event) => {
          form.handleSubmit(onSubmit)(event)
        }}
      >
        <FormField
          control={form.control}
          name='new_password'
          render={(formProps) => {
            return (
              <FormPassword
                fieldConfig={{
                  id: 'new_password',
                  name: 'new_password',
                  label: 'New Password',
                  required: true,
                  placeholder: 'Enter your password',
                  type: 'text',
                  showPasswordStrengthBar: true,
                  hasComplexValidation: true,
                }}
                form={form}
                formKey='SetupPassword'
                formRenderProps={formProps}
              />
            )
          }}
        />
        {error && <FormMessage>{error}</FormMessage>}
        <Button
          className={
            'justify-center\\\\ !mt-8 flex h-auto w-full items-center rounded py-1.5 text-md font-semibold text-white shadow-sm'
          }
          data-test-id='login-submit-button'
          loading={isSubmitting}
          type='submit'
        >
          Set Password
        </Button>
      </form>
    </Form>
  )
}

export default SetupPasswordForm
