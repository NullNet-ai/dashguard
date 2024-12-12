import React from "react";
import AppLayout from "~/components/application-layout/AppLayout";
import SideBarMenu from "~/components/application-layout/SideBarMenu";
import { SidebarProvider } from "~/components/ui/sidebar";
import { SmartProvider } from "~/components/ui/smart-component";

type Props = {
  children: React.ReactNode;
};

const layout = async ({ children }: Props) => {
  return (
    <SmartProvider>
      <SidebarProvider>
        <SideBarMenu />
        <AppLayout>{children}</AppLayout>
      </SidebarProvider>
    </SmartProvider>
  );
};

export default layout;
