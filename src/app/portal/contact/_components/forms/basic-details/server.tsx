import { api } from "~/trpc/server";
import { headers } from "next/headers";
import BasicDetails from "./client";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const fetched_user_role = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: [
      "id",
      "code",
      "first_name",
      "middle_name",
      "last_name",
      "goes_by",
    ],
  });

  const default_values = fetched_user_role?.data || {};

  const contact_id = default_values?.id;

  const phones = await api.contactPhoneNumber.getPhoneNumbersByContactId({
    contact_id,
    status: "Active",
  });

  const emails = await api.contactEmail.getEmailsByContactId({
    contact_id,
    status: "Active",
  });

  return (
    <div className="space-y-2">
      <BasicDetails
        defaultValues={{
          ...default_values,
          phones: phones,
          emails: emails,
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
