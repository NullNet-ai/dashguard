import Image from 'next/image'

import SignInLabel from './_components/SignInLabel'
import SignUpForm from './_components/SignUpForm'

// import SetupPasswordForm from './_components/SetupPasswordForm'

const SetupPassword = () => {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-10">
        <div className="w-full max-w-[655px]">
          <div className="flex flex-col items-center lg:items-start">
            <Image
              alt="Tailwind CSS Logo"
              className="mb-4"
              height={35}
              src="/tailwindLogo.svg"
              width={58}
            />
            <h2 className="mt-8 text-center text-2xl font-bold tracking-tight text-foreground lg:text-left">
              Create Account
            </h2>
            <p className="text-xs lg:text-left">
              Tell us about your company to get started.
            </p>
          </div>

          <div className="mt-11">
            <div>
              <SignUpForm />
            </div>
            <SignInLabel />
          </div>
        </div>
        <footer className="absolute bottom-0 w-full py-4 text-center text-[10px] text-muted-foreground">
          &copy;
          {' All Rights Reserved. '}
          {new Date().getFullYear()}
          {' '}
          DNA Micro
          <sup>TM</sup>
          {'. '}
        </footer>
      </div>
      <div className="relative hidden lg:block">
        <img
          alt=""
          className="h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
        />
      </div>
    </div>
  )
}

export default SetupPassword
