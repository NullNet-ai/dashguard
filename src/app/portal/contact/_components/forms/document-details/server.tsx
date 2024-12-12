import { api } from "~/trpc/server";
import { headers } from "next/headers";
import DocumentDetails from "./client";

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

  const contact_files =
    await api.contactFile.getContactFilesWithRelatedFileById({
      contact_id,
      pluck_fields: ["id", "contact_id", "file_id"],
    });

  const file_ids = contact_files?.map((file) => file.file_id);

  return (
    <div className="space-y-2">
      <DocumentDetails
        defaultValues={{
          file_ids,
        }}
        contact_files={contact_files}
        params={{
          id: contact_id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default FormServerFetch;
