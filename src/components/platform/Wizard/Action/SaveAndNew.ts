"use server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function SaveAndNew({
  entity,
}: {
  entity: string;
  identifier: string;
}) {
  const response = await api.wizard.createEntity({
    entity,
  });
  // redirect(`/portal/${entity}/wizard/${response?.data?.[0]?.id}`);
  redirect(`/portal/${entity}/wizard/${response?.data?.[0]?.code}`);
}
