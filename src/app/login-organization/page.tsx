import Image from 'next/image';

import { api } from '~/trpc/server';
import LoginOrganizationForm from './_components/LoginOrganizationForm';

const LoginOrganization = async () => {
  /* fetch organizations from contact_id */
  const fetchedAccountDetails = await api.auth.fetchAccountDetailsThruEmail();

  const default_values = {
    organization: fetchedAccountDetails?.organizations?.[0]?.value,
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-10">
        <div className="w-full max-w-[655px]">
          <div className="flex flex-col items-center lg:items-start">
            <Image
              alt="Tailwind CSS Logo"
              className="mb-4"
              height={35}
              src="/appguard-logo.png"
              width={58}
            />
            <h2 className="mt-8 text-center text-2xl font-bold tracking-tight text-foreground lg:text-left">
              Organization
            </h2>
            <p className="text-xs lg:text-left">
              You have access to multiple organizations. Please select the one
              you want to continue with.
            </p>
          </div>

          <div className="mt-11">
            <div>
              <LoginOrganizationForm
                defaultValues={default_values}
                selectOptions={{
                  organization: fetchedAccountDetails?.organizations,
                }}
              />
            </div>
          </div>
        </div>
        <footer className="absolute bottom-0 w-full py-4 text-center text-[10px] text-muted-foreground">
          &copy;
          {' All Rights Reserved. '}
          {new Date().getFullYear()} DNA Micro
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
  );
};

export default LoginOrganization;
