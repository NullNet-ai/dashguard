import { type PropsWithChildren } from "react";
import { SidebarInset } from "../ui/sidebar";

import Header from "./Header";
import SmartComponent, { SmartMobileComponent } from "./SmartComponent";
import HeaderContainer from "./common/HeaderContainer";
import AppContent from "./common/AppContent";
import { headers } from "next/headers";
const AppLayout = async ({ children }: PropsWithChildren) => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , app, ,] = pathname.split("/");

  return (
    <SidebarInset application_name={app}>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <AppContent>{children}</AppContent>
      <SmartComponent />
      <SmartMobileComponent />
    </SidebarInset>
  );
};

export default AppLayout;
