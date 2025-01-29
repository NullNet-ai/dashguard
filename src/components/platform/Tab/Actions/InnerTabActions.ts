"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export const closeInnerClassTab = async ({
  pathname,
  current,
  tabs,
}: {
  pathname: string;
  current?: any;
  tabs?: any;
}) => {

    const [, portal, mainEntity, application, identifier] =
    pathname.split("/") || "New Tab";
  const currentContext = "/" + portal + "/" + mainEntity;

  const headerList = headers();
  const currentPathname = headerList.get("x-pathname") || "";

  const tab = await api.tab.closeCurrentInnerClassTab({
    href: pathname,
    current_context: currentContext,
  });

  if (!current) {
    redirect(currentPathname);
  }

  const index = tabs.findIndex((tab: any) => tab.href === pathname);
  if (index !== -1) {
    tabs.splice(index, 1);
  }
  const previousTab = index > 0 ? tabs[index - 1] : null;

  redirect(previousTab?.href || "/portal/dashboard");
};


export const closeAllInnerClassTabs = async ({
  pathname,
  current,
  tabs,
}: {
  pathname: string;
  current?: any;
  tabs?: any;
}) => {
  const [, portal, mainEntity, application, identifier] =
    pathname.split("/") || "New Tab";
  const currentContext = "/" + portal + "/" + mainEntity;

  const headerList = headers();
  const currentPathname = headerList.get("x-pathname") || "";

  await api.tab.closeAllInnerClassTabs({
    href: pathname,
    current_context: currentContext,
  });

  redirect(`/portal/${mainEntity}/grid`);
}

export const closeOtherInnerClassTabs = async ({
  pathname,
  current,
  tabs,
}: {
  pathname: string;
  current?: any;
  tabs?: any;
}) => {
  const [, portal, mainEntity, application, identifier] =
    pathname.split("/") || "New Tab";
  const currentContext = "/" + portal + "/" + mainEntity;

  const headerList = headers();

  await api.tab.closeOtherInnerClassTabs({
    href: pathname,
    current_context: currentContext,
  });

  redirect(pathname)
}