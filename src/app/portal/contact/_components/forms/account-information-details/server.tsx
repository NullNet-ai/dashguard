import { api } from "~/trpc/server";
import { headers } from "next/headers";
import AccountInformation from "./client";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const response = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id"],
  });

  const { id: contact_id } = response?.data || {};

  const contact_emails = await api.contactEmail.getEmailsByContactId({
    contact_id,
    pluck_fields: ["email"],
    status: "Active",
    advance_filters: {
      is_primary: true,
    },
  });

  const [contact] = contact_emails || [];

  const default_values = {
    email: contact?.email,
    contact_id,
  };

  return (
    <div className="space-y-2">
      <AccountInformation
        defaultValues={default_values}
        params={{
          id: contact_id,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default FormServerFetch;
