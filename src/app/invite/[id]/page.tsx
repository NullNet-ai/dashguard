import Image from 'next/image';
import { api } from '~/trpc/server';
import { headers } from 'next/headers';
import SignInLabel from '~/app/sign-up/_components/SignInLabel';
import SignUpForm from '~/app/sign-up/_components/SignUpForm';
import { redirect, RedirectType } from 'next/navigation';
import { formatDate } from '~/server/utils/formatDate';

const INVITATION_LINK_EXPIRED = parseInt(
  process.env.INVITATION_LINK_EXPIRED || '1',
  10,
);

const isInvitationLinkExpired = (createdDate: string): boolean => {
  const created = new Date(createdDate);
  const expirationDate = new Date(created);
  expirationDate.setDate(created.getDate() + INVITATION_LINK_EXPIRED);
  const currentDate = formatDate(new Date()).date;
  return new Date(currentDate) > expirationDate;
};

export default async function Invite({ searchParams }: any) {
  if (!searchParams.token) {
    return redirect('/login');
  }
  const headerList = headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , id] = pathname.split('/');
  const record = await api.account.getInvitationAccountDetailsPublicly({
    id: id!,
    token: searchParams.token,
  });

  if (
    isInvitationLinkExpired(record?.invitation?.created_date) ||
    record.invitation?.status === 'Archived'
  ) {
    Promise.all([
      api.record.updateDynamicRecord({
        entity: 'organization_account',
        id: record?.id,
        data: {
          account_status: ['Pending Setup', 'Invited'].includes(
            record?.account_status,
          )
            ? 'Invitation Expired'
            : record?.account_status,
        },
      }),
      api.record.updateDynamicRecord({
        entity: 'invitation',
        id: record.invitation?.id,
        data: {
          status: 'Archived',
        },
      }),
    ]);

    return redirect('/expired-link', RedirectType.push);
  }

  if (record?.categories.includes('Internal User')) {
    return redirect(
      `/login/${record.id}?token=${searchParams.token}&invitation_id=${record.invitation?.id}`,
      RedirectType.push,
    );
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
              Create Account
            </h2>
            <p className="text-xs lg:text-left">
              Tell us about your company to get started.
            </p>
          </div>

          <div className="mt-11">
            <div>
              <SignUpForm
                recordData={
                  record?.categories.includes('External User') ? record : {}
                }
                account_id={
                  record?.categories.includes('External User') ? record?.id : ''
                }
                invitation_id={record?.invitation?.id}
              />
            </div>
            <SignInLabel />
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
