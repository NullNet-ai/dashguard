import { api } from "~/trpc/server";
import { headers } from "next/headers";
import TimezoneBasicDetails from "./client";

const TimezoneForm = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const fetched_timezone = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "timezone"],
  });

  const defaultValues = fetched_timezone?.data;

  return (
    <div className="space-y-2">
      <TimezoneBasicDetails
        defaultValues={defaultValues}
        params={{
          id: defaultValues?.id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity!,
          navigate: {
            wizard_step: "1",
            record_tab: "timezone",
          },
        }}
      />
    </div>
  );
};

export default TimezoneForm;
