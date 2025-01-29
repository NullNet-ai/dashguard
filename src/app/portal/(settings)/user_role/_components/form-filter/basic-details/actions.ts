"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export const selectRecord = async (rows: any[]) => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, portal, mainEntity] = pathname.split("/");
  const currentContext = "/" + portal + "/" + mainEntity;
  await api.tab.closeCurrentInnerClassTab({
    href: pathname,
    current_context: currentContext,
  });
  redirect(`/portal/${mainEntity}/wizard/${rows?.[0]?.code}/1`);
};

export const removeRecord = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, portal, mainEntity] = pathname.split("/");
  const currentContext = "/" + portal + "/" + mainEntity;
  await api.tab.closeCurrentInnerClassTab({
    href: pathname,
    current_context: currentContext,
  });
  redirect(`/portal/${mainEntity}/wizard/new/1`);
};

export const savedRecord = async ({ code }: { code: string }) => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, portal, mainEntity] = pathname.split("/");
  const currentContext = "/" + portal + "/" + mainEntity;

  await api.tab.closeCurrentInnerClassTab({
    href: pathname,
    current_context: currentContext,
  });

  redirect(`/portal/user_role/wizard/${code}/1`);
};
