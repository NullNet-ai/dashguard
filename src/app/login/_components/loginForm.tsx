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
  username: z.string({ required_error: "Please enter your email address." }).email("Please enter a valid email address."),
  password: z.string().min(1, { message: "Please enter your password." }),
})

export default function LoginForm(props) {
  // console.log("%c Line:22 🍊 props", "color:#e41a6a", props);
  const {defaultValues} = props;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

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
      try {
        const parsedError = JSON.parse(error.message);
        setError(parsedError?.[0]?.message)
      }
      catch {
        setError(error.message)
      }
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
          name="username"
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
                formKey="Login"
                formRenderProps={formProps}
              />
            )
          }}
        />
        <FormField
          control={form.control}
          name='password'
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
            <Checkbox id='rememberMe' name='rememberMe' />
            <label
              className='ml-2 block text-md font-semibold text-foreground'
              htmlFor='rememberMe'
            >
              Remember me
            </label>
          </div>
          <div className='text-md'>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className='font-semibold text-primary' href='#'>
              Forgot Password?
            </a>
          </div>
        </div>
        <Button
          className={'justify-center\\\\ !mt-8 flex h-auto w-full items-center rounded py-1.5 text-md font-semibold text-white shadow-sm'}
          data-test-id='login-submit-btn'
          loading={isSubmitting}
          type='submit'
        >
          Sign in
        </Button>
      </form>
    </Form>
  )
}
