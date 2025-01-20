"use server";

import { api } from "~/trpc/server";

export async function createRecord({ entity,  data, fieldIdentifier }: { entity: string, data: Record<string, any>, fieldIdentifier: string }) {
  const returnData = await api.form.createRecord({
    entity,
    fieldIdentifier,
    data,
  });

  return returnData
}
