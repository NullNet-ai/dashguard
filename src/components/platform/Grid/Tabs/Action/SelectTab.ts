"use server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function SelectTab({ href }: { href: string }) {
  await api.grid.updateGridTabs({
    href,
  });

  redirect(href);
}
