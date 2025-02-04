'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import FormInput from '~/components/platform/FormBuilder/FormType/FormInput'
import FormPassword from '~/components/platform/FormBuilder/FormType/FormPassword'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Form, FormField, FormMessage } from '~/components/ui/form'

import LoginSubmit from '../actions/loginSubmit'

const formSchema = z.object({
  username: z.string().min(1, { message: 'Please enter your username.' }),
  password: z.string().min(1, { message: 'Please enter your password.' }).min(5, 'Password must contain at least 5 characters.'),
});

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const response = await LoginSubmit(data)
      if (response && response.statusCode !== 200) {
        throw response
      }
    }
    catch (error: any) {
      console.error('Error Details:', error.message)
      setIsSubmitting(false)
      setError(error.message)
    }
  }
  const form = useForm({
    resolver: zodResolver(formSchema),
  })

  return (
    <Form {...form}>
      <form
        className='space-y-6'
        onSubmit={(event) => {
          void form.handleSubmit(onSubmit)(event)
        }}
      >
        <FormField
          name="username"
          control={form.control}
          render={(formProps) => {
            return (
              <FormInput
                fieldConfig={{
                  id: 'username',
                  name: 'username',
                  label: 'Username',
                  required: true,
                  placeholder: 'Enter your username',
                  type: 'text',
                }}
                form={form}
                formKey='Login'
                formRenderProps={formProps}
              />
            )
          }}
        />
        <FormField
          control={form.control}
          name="password"
          render={(formProps) => {
            return (
              <FormPassword
                fieldConfig={{
                  id: 'password',
                  name: 'password',
                  label: 'Password',
                  required: true,
                  placeholder: 'Enter at least 5 characters',
                }}
                form={form}
                formKey='Login'
                formRenderProps={formProps}
              />
            )
          }}
        />
        {error && <FormMessage>{error}</FormMessage>}
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center'>
            <Checkbox
              id='rememberMe'
              name='rememberMe'
            />
            <label
              className="ml-2 block text-md font-semibold text-foreground"
              htmlFor="rememberMe"
            >
              Remember me
            </label>
          </div>
          <div className='text-md'>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className="font-semibold text-primary" href="#">
              Forgot Password?
            </a>
          </div>
        </div>
        <Button
          className='!mt-8 flex h-auto w-full items-center justify-center\
          rounded py-1.5 text-md font-semibold text-white shadow-sm'
          data-test-id='login-submit-btn'
          loading={isSubmitting}
          type="submit"
        >
          Sign in
        </Button>
      </form>
    </Form>
  )
}
