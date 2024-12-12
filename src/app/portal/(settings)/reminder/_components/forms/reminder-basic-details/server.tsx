import { api } from "~/trpc/server";
import { headers } from "next/headers";
import ReminderBasicDetails from "./client";

const StepOneReminderForm = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const fetched_reminder = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "reminder"],
  });

  const defaultValues = fetched_reminder?.data;

  return (
    <div className="space-y-2">
      <ReminderBasicDetails
        defaultValues={defaultValues}
        params={{
          id: defaultValues?.id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
          navigate: {
            wizard_step: "1",
            record_tab: "reminder",
          },
        }}
      />
    </div>
  );
};

export default StepOneReminderForm;
