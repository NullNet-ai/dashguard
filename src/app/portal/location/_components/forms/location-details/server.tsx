import { api } from "~/trpc/server";
import { headers } from "next/headers";
import BasicDetails from "./client";
import FormBuilderPage from "./builder";

const LocationDetailsServer = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const record = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "code", "location_name"],
  });
  const defaultValues = record?.data;
  return (
    <div className="space-y-2">
      <BasicDetails
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

export default LocationDetailsServer;
