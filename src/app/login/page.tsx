import LoginForm from "./_components/loginForm";
import Image from "next/image";
export default function Login() {
  return (
    <>
      {/*
          This example requires updating your template:
  
          ```
          <html class="h-full bg-white">
          <body class="h-full">
          ```
        */}
      <div className="grid grid-cols-2 min-h-screen ">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-10">
          <div className="w-[655px]">
            <div className="flex flex-col items-center lg:items-start">
              <Image
                height={35}
                width={58}
                alt="Tailwind CSS Logo"
                src="/tailwindLogo.svg"
              />
              <h2 className="mt-8 text-center text-xl-5 font-bold tracking-tight text-foreground lg:text-left">
                Sign in to your account
              </h2>
            </div>

            <div className="mt-11">
              <div>
                <LoginForm />
              </div>
            </div>
          </div>
          <footer className="absolute bottom-0 text-[10px] w-full text-center py-4 text-muted-foreground">
          &copy; All Rights Reserved. 2024 DNA Micro<sup>TM</sup>. 
        </footer>
        </div>
        <div className="relative hidden  lg:block">
          <img
            alt=""
            className="w-full h-full"
            src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
          />
        </div>
       
      </div>
    </>
  );
}
