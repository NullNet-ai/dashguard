import Image from 'next/image';

import ResetPasswordForm from './_components/ResetPasswordForm';
import { RedirectType, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { api } from '~/trpc/server';
import { isInvitationLinkExpired } from '~/utils/isInvitationLinkExpired';

export default async function SetupPassword() {
  const headerList = headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , id] = pathname.split('/');
  const record = await api.account.getInvitationAccountDetailsPublicly({
    id: id!,
  });
  if (
    !record?.invitation?.id ||
    record.invitation?.status === 'Archived' 
    // ||
    // isInvitationLinkExpired(
    //   record.invitation?.created_date,
    //   record.invitation?.created_time,
    // )
  ) {
    return redirect('/expired-link', RedirectType.push);
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
              src="/tailwindLogo.svg"
              width={58}
            />
            <h2 className="mt-8 text-center text-2xl font-bold tracking-tight text-foreground lg:text-left">
              Reset Your Password
            </h2>
            <p className="text-xs lg:text-left">
              Secure your account with a strong password
            </p>
          </div>

          <div className="mt-11">
            <div>
              <ResetPasswordForm />
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
}
