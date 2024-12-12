/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { api } from "~/trpc/server";
import PositionDetailsDescriptionForm from "./client";
import { headers } from "next/headers";

const PositionDetailsDescription = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const fetch_position_details = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "description", "responsibility"],
  });
  const record_id = fetch_position_details?.data?.id;
  return (
    <div className="space-y-2">
      <PositionDetailsDescriptionForm
        defaultValues={fetch_position_details?.data}
        params={{
          id: record_id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default PositionDetailsDescription;
