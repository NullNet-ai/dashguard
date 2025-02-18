"use server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function DeleteDevice({ id }: { id: string }) {
  await api.device.deleteDevice({
    id,
  });
  redirect(`/portal/device/grid`);
}
