import { headers } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import React, { Fragment } from "react";
import { api } from '~/trpc/server';

type Props = {
  children?: React.ReactNode;
};

const Layout = async (props: Props) => {

  const headerList = headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , id] = pathname.split('/');
  const record = await api.account.getInvitationAccountDetails({
    id: id!,
  });

  if (record?.categories.includes('Internal User')) {
    return redirect(`/login/${record.id}`, RedirectType.push)
  }

  return (
    <Fragment>
      {props.children}
    </Fragment>
  );
};

export default Layout;
