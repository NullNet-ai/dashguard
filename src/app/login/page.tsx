import LoginForm from "./_components/loginForm";
import Image from "next/image";

export default function Login() {
  return (
    <>
      <div className="grid lg:grid-cols-2 grid-cols-1 min-h-screen">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-10 relative">
          <div className="w-full max-w-[655px]">
            <div className="flex flex-col items-center lg:items-start">
              <Image
                height={35}
                width={58}
                alt="Tailwind CSS Logo"
                src="/tailwindLogo.svg"
                className="mb-4"
              />
              <h2 className="mt-8 text-center text-2xl font-bold tracking-tight text-foreground lg:text-left">
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
            &copy; All Rights Reserved. {new Date().getFullYear()} DNA Micro<sup>TM</sup>. 
          </footer>
        </div>
        <div className="relative hidden lg:block">
          <img
            alt=""
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
          />
        </div>
      </div>
    </>
  );
}