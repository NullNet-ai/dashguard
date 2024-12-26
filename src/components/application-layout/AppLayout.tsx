import { type PropsWithChildren } from "react";
import { SidebarInset } from "../ui/sidebar";

import Header from "./Header";
import SmartComponent, { SmartMobileComponent } from "./SmartComponent";
import InnerTabs from "../platform/Tab/InnerTabList";
import HeaderContainer from "./common/HeaderContainer";
import App from "next/app";
import AppContent from "./common/AppContent";
const AppLayout = async ({ children }: PropsWithChildren) => {
  
  return (
    <SidebarInset>
      <HeaderContainer>
        <Header />
        <InnerTabs />
      </HeaderContainer>
      <AppContent>{children}</AppContent>
      <SmartComponent />
      <SmartMobileComponent />
    </SidebarInset>
  );
};

export default AppLayout;
