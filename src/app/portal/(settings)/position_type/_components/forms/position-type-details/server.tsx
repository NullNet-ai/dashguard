import { headers } from "next/headers";
import { api } from "~/trpc/server";
import PositionTypesBasicDetails from "./client";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const fetched_position_type = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "position_type"],
  });

  const defaultValues = fetched_position_type?.data;

  return (
    <PositionTypesBasicDetails
    defaultValues={defaultValues ?? {}}
    params={{
      id: defaultValues?.id!,
      shell_type: application! as "record" | "wizard",
      entity: main_entity,
    }}
    />
  );
};

export default FormServerFetch;
