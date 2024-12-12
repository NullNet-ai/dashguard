import { api } from "~/trpc/server";
import { headers } from "next/headers";
import WorkSetupBasicDetails from "./client";

const WorkSetupForm = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const fetched_work_setup = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "work_setup"],
  });

  const defaultValues = fetched_work_setup?.data;

  return (
    <div className="space-y-2">
      <WorkSetupBasicDetails
        defaultValues={defaultValues}
        params={{
          id: defaultValues?.id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity!,
          navigate: {
            wizard_step: "1",
            record_tab: "work_setup",
          },
        }}
      />
    </div>
  );
};

export default WorkSetupForm;
