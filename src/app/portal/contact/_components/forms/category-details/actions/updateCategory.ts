"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

interface IProps {
  id: string;
  categories: string;
}

export default async function UpdateCategory({
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
