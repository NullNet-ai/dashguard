import React from "react";
import AppLayout from "~/components/application-layout/AppLayout";
import SideBarMenu from "~/components/application-layout/SideBarMenu";
import { SidebarProvider } from "~/components/ui/sidebar";
import { SmartProvider } from "~/components/ui/smart-component";
import { cookies } from 'next/headers';


type Props = {
  children: React.ReactNode;
};

const layout = async ({ children }: Props) => {
  const cookieStore = cookies(); // Access cookies
  const sidebar_state = cookieStore.get('sidebar_state'); 
  const value = !sidebar_state?.value ? true  : sidebar_state?.value === 'false';

  return (
    <SmartProvider>
      <SidebarProvider defaultOpen={value}>
        <SideBarMenu />
        <AppLayout>{children}</AppLayout>
      </SidebarProvider>
    </SmartProvider>
  );
};

export default layout;
