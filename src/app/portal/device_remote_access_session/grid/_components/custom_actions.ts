
'use server'
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { api } from "~/trpc/server";
import { CustomNewButtonAction } from "./custom_new_action";


const redirectToNewPage = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application] = pathname.split("/");
  const newPageUrl = `/portal/${main_entity}/${application}/new`;
  await api.tab.closeCurrentInnerClassTab({
    href: pathname,
    current_context: newPageUrl,
  })
  redirect(`/portal/${main_entity}/${application}/new`)
}


export const newButtonCustomAction = () => {
  return CustomNewButtonAction
}