import React, { Fragment } from "react";

type Props = {
  children?: React.ReactNode;
};

const Layout = (props: Props) => {
  return (
    <Fragment>
      {props.children}
    </Fragment>
  );
};

export default Layout;
