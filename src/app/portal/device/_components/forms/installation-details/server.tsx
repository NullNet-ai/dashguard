import { api } from "~/trpc/server";
import { headers } from "next/headers";
import InstallationDetails from "./client";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const fetched_user_role = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "code"],
  });
  const defaultValues = fetched_user_role?.data;
  return (
    <div className="space-y-2">
      <InstallationDetails
        defaultValues={defaultValues ?? {}}
        params={{
          id: defaultValues?.id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
        }}
      />
    </div>
  );
};

export default FormServerFetch;
