import { api } from "~/trpc/server";
import { headers } from "next/headers";
import ContactDetails from "./client";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const pluck_fields = ["id", "code", "role", "status"];
  const [, , main_entity, application, identifier] = pathname.split("/");
  const fetched_user_role = await api.contact.fetchContactPhoneEmail({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields,
  });
  const defaultValues = fetched_user_role?.data;

  return (
    <div className="space-y-2">
      <ContactDetails
        defaultValues={{
          ...defaultValues,
        }}
        params={{
          id: defaultValues?.id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
          pluck_fields,
        }}
        selectedRecords={defaultValues?.id ? [defaultValues] : []}
      />
    </div>
  );
};

export default FormServerFetch;
