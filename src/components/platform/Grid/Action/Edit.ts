"use server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function Edit({
  entity,
  id,
  code,
  status,
}: {
  entity: string;
  id?: string;
  code?: string;
  status?: string;
}) {
  const response = await api.wizard.getCurrentStep({
    entity,
    identifier: code!,
  });

  const { identifier } = response ?? {};

  if (status === "Draft") {
    redirect(`/portal/${entity}/wizard/${identifier}/`);
  }

  redirect(`/portal/${entity}/record/${code}?current_tab=dashboard`);
}
