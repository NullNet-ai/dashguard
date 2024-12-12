import { type PropsWithChildren } from "react";
import { SidebarInset } from "../ui/sidebar";

import Header from "./Header";
import SmartComponent, { SmartMobileComponent } from "./SmartComponent";
import InnerTabs from "../platform/Tab/InnerTabList";
import HeaderContainer from "./common/HeaderContainer";
const AppLayout = async ({ children }: PropsWithChildren) => {
  return (
    <SidebarInset>
      <HeaderContainer>
        <Header />
        <InnerTabs />
      </HeaderContainer>
      <div className="mt-28 lg:mb-0 mb-12 md:mt-16 lg:mt-0">
        {children}
      </div>
      <SmartComponent />
      <SmartMobileComponent />
    </SidebarInset>
  );
};

export default AppLayout;
