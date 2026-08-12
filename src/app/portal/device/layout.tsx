import React, { Fragment } from "react";
import InnerTabs from "~/components/platform/Tab/InnerTabList";

type Props = {
  children?: React.ReactNode;
};

const Layout = (props: Props) => {
  return (
    <Fragment>
      <InnerTabs recordLabelField="device_name" />
      {props.children}
    </Fragment>
  );
};

export const dynamic = 'force-dynamic'

export default Layout;
