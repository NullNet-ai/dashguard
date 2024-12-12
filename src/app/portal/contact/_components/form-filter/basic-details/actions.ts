"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export const saveContactDetails = async (data: any, action_type?: string) => {
  const response = await api.contact.saveContactPhoneEmail(data);

  if (action_type === "Create") {
    const headerList = headers();
    const pathname = headerList.get("x-pathname") || "";
    const [, portal, mainEntity] = pathname.split("/");
    const currentContext = "/" + portal + "/" + mainEntity;
    await api.tab.closeCurrentInnerClassTab({
      href: pathname,
      current_context: currentContext,
    });
  }
  return [response];
};

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
