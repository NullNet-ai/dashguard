import { api } from "~/trpc/server";
import { headers } from "next/headers";
import OrganizationDetails from "./client";
import { EOperator } from "@dna-platform/common-orm";
import { EStatus } from "~/server/api/types";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const fetch_entities = [
    {
      entity: "organization",
      pluck_fields: ["id", "name"],
    },
    {
      entity: "user_role",
      pluck_fields: ["id", "role"],
    },
  ];

  const [contact, organizations, user_roles] = await Promise.all([
    api.record.getByCode({
      main_entity: main_entity!,
      id: identifier!,
      pluck_fields: ["id"],
    }),
    ...fetch_entities.map(async ({ entity, pluck_fields }) => {
      const res = await api.grid.items({
        entity,
        pluck: pluck_fields,

        limit: 100,
        advance_filters: [
          {
            type: "criteria",
            field: "status",
            operator: EOperator.EQUAL,
            values: [EStatus.ACTIVE],
          },
        ],
      });
      return res.items?.map(({ id, name, role }) => ({
        value: id,
        label: name || role,
      }));
    }),
  ]);

  const fetch_def_val = await api.organizationContact.fetchOrganizations({
    contact_id: contact?.data?.id!,
  });
  const default_values = { ...contact?.data, ...fetch_def_val?.data };

  return (
    <div className="space-y-2">
      <OrganizationDetails
        defaultValues={default_values}
        multiSelectOptions={{ organizations, user_roles }}
        params={{
          id: default_values?.id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default FormServerFetch;
