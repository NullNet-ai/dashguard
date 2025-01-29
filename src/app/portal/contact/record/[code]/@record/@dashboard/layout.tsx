"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import LinkTab from "~/components/platform/LinkTab";
import { useTabPersistence } from "~/components/platform/LinkTab/hooks/useTabPersistence";

interface RecordLayoutProps {
  params: { code: string };
  searchParams: { current_tab?: string; tab?: string };
  A: React.ReactNode;
  B: React.ReactNode;
}

const RecordLayout: React.FC<RecordLayoutProps> = (props) => {
  const { params, A, B } = props;
  const searchParams = useSearchParams();

  // const { currentPath } = useTabPersistence({
  //   code: params.code,
  //   prefix: "dashboard-tab",
  // });

  const baseUrl = `/portal/contact/record/${params.code}`;
  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: `${baseUrl}?current_tab=dashboard&tab=dashboard`,
    },
    {
      id: "users",
      label: "Users",
      href: `${baseUrl}?current_tab=dashboard&tab=users`,
    },
  ];

  const Content = React.useMemo(() => {
    const currentTab = searchParams.get("tab");

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <div style={{ display: currentTab === "dashboard" ? "block" : "none" }}>
          {A}
        </div>
        <div style={{ display: currentTab === "users" ? "block" : "none" }}>
          {B}
        </div>
        {!currentTab && <div>Default</div>}
      </Suspense>
    );
  }, [searchParams, A, B]);

  return (
    <div className="space-y-4">
      <LinkTab
        tabs={tabs}
        variant="default"
        size="md"
        orientation="horizontal"
        defaultHref={`${baseUrl}?current_tab=dashboard&tab=users`}
        // persistKey={currentPath}
      />
      {Content}
    </div>
  );
};

export default RecordLayout;
