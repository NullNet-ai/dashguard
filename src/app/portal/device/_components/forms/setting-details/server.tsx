/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { api } from "~/trpc/server";
import { headers } from "next/headers";
import SettingDetails from "./client";
const WizardContainer = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , application, identifier] = pathname.split("/");

  const response = await api.record.getByCode({
    id: identifier!,
    pluck_fields: ["id", "tags"],
    main_entity: "device"
  });

  const record_id = response?.data?.id;

  const defaultValues = { ...response?.data };
  return (
    <div className="space-y-2">
      <SettingDetails
        defaultValues={defaultValues}
        params={{
          id: record_id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default WizardContainer;
