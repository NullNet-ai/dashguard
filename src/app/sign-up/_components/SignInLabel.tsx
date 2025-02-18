'use client'
import React from 'react'

import { redirectToSignIn } from '../_actions/redirectToSignIn'

const SignInLabel = () => {
  return (
    <div className='my-3 flex items-center justify-center'>
      <p className='text-sm font-light'>
        {'Already have an account? '}
        {' '}
        <span
          aria-hidden='true'
          className='cursor-pointer text-primary underline'
          onClick={async () => {
            await redirectToSignIn()
          }}
        >
          Sign in
        </span>
      </p>
    </div>
  )
}

export default SignInLabel
