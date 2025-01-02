"use server";
import { api } from "~/trpc/server";
import gridColumns, { TO_HIDE_COLUMNS_WHEN_MOBILE } from "./_config/columns";
import Grid from "~/components/platform/Grid/Server";
import Bluebird from "bluebird";
import React from "react"; // Import React if needed
import DeleteComponent from "./customDefaultActions/Delete";
import { defaultSorting } from "./_config/sorting";
import { customArchive } from "./customArchiveAction";
import ArchiveDialog from "../_components/controls/ArchiveDialog";
export default async function OrganizationGridPage({
  searchParams = {},
  params,
}: {
  searchParams?: {
    page?: string;
    perPage?: string;
  };
  params?: {
    id: string;
  };
}): Promise<React.ReactElement | null> {
  const _pluck = [
    "id",
    "code",
    "name",
    "parent_organization_id",
    "status",
    "created_date",
    "created_time",
    "created_by",
    "updated_date",
    "updated_time",
    "updated_by",
  ];

  const sorting = await api.grid.getReportSorting();

  const { items = [], totalCount } = await api.grid
    .items({
      current: +(searchParams.page ?? "0"),
      limit: +(searchParams.perPage ?? "100"),
      entity: "organization",
      pluck: _pluck,
      advance_filters: [],
      sorting: sorting?.length ? sorting : defaultSorting,
    })
    .then(async (res) => {
      const final_items = await Bluebird.map(res.items, async (item) => {
        const final_item = await api.organization
          .getById({
            id: item.parent_organization_id ?? "",
            pluck_fields: ["name"],
          })
          .then((res) => {
            return {
              ...item,
              parent_organization_name: res?.data?.name,
            };
          });

        const _final_item = await api.organization
          .getOrgWithContact({
            id: item.id ?? "",
            pluck_fields: ["id"],
          })
          .then((res) => {
            return {
              ...item,
              contact_organization_id: res?.organization_id,
            };
          });
        return { ...final_item, ..._final_item };
      });

      // disable archiving of parent organizations with children
      const updated_final_items = final_items.reduce(
        (acc: Record<string, any>[], item: Record<string, any>) => {
          const parent = final_items.find(
            (parent: Record<string, any>) =>
              parent.parent_organization_id === item.id,
          );
          const isItemDisabled = !!parent;

          const hasContact = final_items.find(
            (contact: Record<string, any>) =>
              contact.contact_organization_id === item.id,
          );
          const messages = !!hasContact
            ? {
                archive_prompt_message:
                  "This organization has assigned contacts. Please remove all contact assignments before archiving.",
                archive_title: "Cannot Archive Organization",
                archive_type: "warning",
              }
            : {};

          return [
            ...acc,
            {
              ...item,
              ...messages,
              disabled: isItemDisabled,
            },
          ];
        },
        [] as Record<string, any>[],
      );
      return {
        items: updated_final_items,
        totalCount: res.totalCount,
      };
    });

  return (
    <Grid
      totalCount={totalCount || 0}
      defaultSorting={defaultSorting}
      sorting={sorting?.length ? sorting : []}
      data={items}
      config={{
        entity: "organization",
        title: "Organizations",
        columns: gridColumns,
        hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
        deleteCustomComponent: DeleteComponent,
        archiveCustomAction: customArchive,
        archiveDialogCustomComponent: ArchiveDialog,
      }}
    />
  );
}
