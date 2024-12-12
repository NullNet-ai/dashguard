"use server"

import { api } from "~/trpc/server";

const archive = async (recordId: string, entityName: string) => {
  await api.record.archiveRecord({ entity: entityName, id: recordId });
}

export default archive;