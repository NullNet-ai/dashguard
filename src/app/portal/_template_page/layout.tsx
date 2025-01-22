import React, { Fragment } from "react";
import InnerTabs from "~/components/platform/Tab/InnerTabList";

type Props = {
  children?: React.ReactNode;
};

const Layout = (props: Props) => {
  return (
    <Fragment>
      <InnerTabs />
      {props.children}
    </Fragment>
  );
};

export default Layout;
