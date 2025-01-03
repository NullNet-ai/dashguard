"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { api } from "~/trpc/server";
import { ContactPhoneEmailSchema } from "~/server/zodSchema/contact/contactPhoneEmail";

export const saveContactDetails = async (
  data: z.infer<typeof ContactPhoneEmailSchema>,
) => {
  const response = await api.contact.saveContactPhoneEmail(data);

  if (response?.existing) {
    return response;
  }
  return response;
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
