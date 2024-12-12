import { api } from "~/trpc/server";
import { headers } from "next/headers";
import RoleDetails from "./client";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const fetched_role_details = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "code", "categories", "user_role_id"],
  });

  const user_role_id_options = await api.contact.getUserRoleOptions();
  const default_values = {
    user_role_id: fetched_role_details?.data?.user_role_id,
  };
  const contact_id = fetched_role_details?.data?.id;
  return (
    <div className="space-y-2">
      <RoleDetails
        defaultValues={default_values}
        selectOptions={{
          user_role_id: user_role_id_options,
        }}
        params={{
          id: contact_id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
        }}
      />
    </div>
  );
};

export default FormServerFetch;
