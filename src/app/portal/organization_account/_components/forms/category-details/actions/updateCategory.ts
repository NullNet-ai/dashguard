"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

interface IProps {
  id: string;
  categories: string;
  code?: string;
}

export async function UpdateCategory({
  id,
  categories,
}: IProps) {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";

  await api.contact.updateCategoryDetails({
    id,
    categories,
  });
  redirect(`${pathname}?categories=${categories}`);
}


export async function StepOneUpdateCategory({
  id,
  categories,
  code
}: IProps) {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, portal, mainEntity] = pathname.split("/");
  const currentContext = "/" + portal + "/" + mainEntity;

  await api.contact.updateCategoryDetails({
    id,
    categories,
  });

  await api.tab.closeCurrentInnerClassTab({
    href: pathname,
    current_context: currentContext,
  });

  redirect(`/portal/contact/wizard/${code}/1?categories=${categories}`);
}
