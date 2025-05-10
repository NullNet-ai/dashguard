'use client'
import React from 'react'

import redirectToSignUp from '../_actions/redirectToSignUp'

const SignUpLabel = () => {
  return (
    <div className={"my-3 flex items-center justify-center"}>
      <p className={"text-sm font-light"}>
        Dont have an acount?
        {' '}
        <span
          aria-hidden={"true"}
          className={"cursor-pointer text-primary underline"}
          onClick={async () => {
            await redirectToSignUp()
          }}
          data-test-id="login-sign-up-link"
        >
          Sign Up
        </span>
      </p>
    </div>
  )
}

export default SignUpLabel
