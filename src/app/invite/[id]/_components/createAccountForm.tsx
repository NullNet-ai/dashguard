'use client'

import { UserPlusIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { omit } from 'lodash'
import React, { useState } from 'react'
import { type Control, type FieldValues, useForm, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import SignUpFormField from '~/app/sign-up/_components/SignUpFormField'
import FormInput from '~/components/platform/FormBuilder/FormType/FormInput'
import FormPassword from '~/components/platform/FormBuilder/FormType/FormPassword'
import { Button } from '~/components/ui/button'
import { Form, FormMessage } from '~/components/ui/form'

import registerAccountFromInvite from '../_actions/registerAccountFromInvite'

const SignUpSchema = z
  .object({
    organization_name: z.string().optional(),
    first_name: z.string({ required_error: 'Please enter the first name' }),
    last_name: z.string({ required_error: 'Please enter the last name.' }),
    email: z
      .string({ required_error: 'Please enter the email address.' })
      .email({ message: 'Please enter a valid email.' }),
    password: z.string().min(1, { message: 'Please enter the password.' }),
    confirmed_password: z
      .string()
      .min(1, { message: 'Please enter the password.' }),
  })
  .refine(data => data.password === data.confirmed_password, {
    message: 'Passwords don\'t match',
    path: ['confirmed_password'],
  })

type PickedSignUpSchema = Pick<z.infer<typeof SignUpSchema>, 'organization_name' | 'email'>
interface SignUpFormProps {
  defaultValues: PickedSignUpSchema, params: { organization_id: string }
}

const SignUpForm: React.FC<SignUpFormProps> = (props) => {
  const { params, defaultValues } = props
  const form = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    const registrationData = omit(data, ['confirmed_password']) as {
      first_name: string
      last_name: string
      email: string
      password: string
      organization_name?: string
    }

    try {
      await registerAccountFromInvite({
        ...registrationData,
        organization_id: params.organization_id,
      })
    }
    catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      }
      else {
        setError('Something went wrong')
      }
    }
    finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        className={"space-y-6"}
        onSubmit={(event) => {
          void form.handleSubmit(onSubmit)(event)
        }}
      >
        <SignUpFormField
          control={form.control as unknown as Control<FieldValues, any>}
          fields={[
            {
              FormComponent: FormInput,
              name: 'organization_name',
              id: 'organization_name',
              label: 'Organization Name',
              placeholder: 'Example: DNA Micro',
              type: 'text',
            },
            {
              FormComponent: FormInput,
              name: 'first_name',
              id: 'first_name',
              label: 'First Name',
              placeholder: 'Example: John',
              type: 'text',
              required: true,
            },
            {
              FormComponent: FormInput,
              name: 'last_name',
              id: 'last_name',
              label: 'Last Name',
              placeholder: 'Example: John',
              type: 'text',
              required: true,
            },
            {
              FormComponent: FormInput,
              name: 'email',
              id: 'email',
              label: 'Email Address',
              placeholder: 'Example: john@example.com',
              type: 'email',
              required: true,
            },
            {
              FormComponent: FormPassword,
              name: 'password',
              id: 'password',
              label: 'New Password',
              placeholder: 'Enter your password',
              type: 'text',
              required: true,
              showPasswordStrengthBar: true,
              hasComplexValidation: true,

            },
            {
              FormComponent: FormPassword,
              name: 'confirmed_password',
              id: 'confirmed_password',
              label: 'Confirm Password',
              placeholder: 'Enter your password',
              type: 'text',
              required: true,
            },
          ]}
          form={form as unknown as UseFormReturn<FieldValues, any, undefined>}
          formKey={"SignUp"}
        />
        {error && <FormMessage>{error}</FormMessage>}
        <Button
          className={'justify-center\\\\ !mt-8 flex h-auto w-full items-center rounded py-1.5 text-md font-semibold text-white shadow-sm'}
          data-test-id={"login-submit-btn"}
          loading={isSubmitting}
          type={"submit"}
        >
          <UserPlusIcon className={"mr-2 h-5 w-5"} />
          Create Account
        </Button>
      </form>
    </Form>
  )
}

export default SignUpForm
