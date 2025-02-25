import React, { Fragment } from 'react';
import SessionChecker from '../session-checker';

type Props = {
  children?: React.ReactNode;
};

const Layout = ({children}: Props) => {
  return (
    <Fragment>
      <section>
        <SessionChecker />
        {children}
      </section>
    </Fragment>
  );
};

export default Layout;
