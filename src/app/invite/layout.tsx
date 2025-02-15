import { headers } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import React, { Fragment } from "react";
import { api } from '~/trpc/server';

type Props = {
  children?: React.ReactNode;
  searchParams: {
    token: string;
  }
};

const Layout = async (props: Props) => {
  return (
    <Fragment>
      {props.children}
    </Fragment>
  );
};

export default Layout;
