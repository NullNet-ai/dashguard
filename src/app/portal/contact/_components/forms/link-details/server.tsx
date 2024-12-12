import { ulid } from "ulid";
import { api } from "~/trpc/server";
import { headers } from "next/headers";
import LinkDetails from "./client";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const contact = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id"],
  });

  const contact_id = contact?.data?.id!;

  const response = await api.contactLink.getLinksByContactId({
    contact_id,
  });

  const defaultValues = response?.length
    ? response
    : [{ id: ulid(), title: "", link: "" }];

  return (
    <div className="space-y-2">
      <LinkDetails
        defaultValues={{
          links: defaultValues,
        }}
        params={{
          id: contact_id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default FormServerFetch;
