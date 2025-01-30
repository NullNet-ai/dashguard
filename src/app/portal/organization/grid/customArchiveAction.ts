"use server";
import { DefaultRowActions } from "~/components/platform/Grid/types";

import { api } from "~/trpc/server";
import { redirect } from "next/navigation";

export const customArchive = async (args: Record<string, any>) => {
  const { id } = args;
  const entity = "organization";
  return await api.organization
    .getOrganizationByParentIds({ parent_organization_ids: [id] })
    .then(async (res) => {
      if (res.length) {
        return { message: "Organization has sub organizations assigned" };
      }
      await api.grid.archiveRecord({
        entity,
        id,
      });
      redirect(`/portal/${entity}/grid`);
    });
};
