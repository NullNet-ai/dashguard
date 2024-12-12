import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function customArchive({
  entity,
  id,
}: {
  entity: string;
  id: string;
}) {
//   async function archive() {
//     "use server";
//     //!throw error if no id
//     const organization_contacts =
//       await api.organizations.getOrganizationContacts({ id });
//     if (!organization_contacts?.length) {
//       //!how to throw error or display message that organization has contacts and sub-organizations so it can't be archived
//       redirect(`/portal/${entity}/grid`);
//     }
//     await api.organizations.archiveOrganization({
//       id,
//     });
//     redirect(`/portal/${entity}/grid`);
//   }
//   return archive;
}
