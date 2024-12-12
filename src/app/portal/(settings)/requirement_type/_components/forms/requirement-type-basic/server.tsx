import { api } from "~/trpc/server";
import { headers } from "next/headers";
import RequirementTypeBasicDetails from "./client";

const RequirementTypeForm = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const fetched_requirement_types = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "requirement_type"],
  });

  const defaultValues = fetched_requirement_types?.data;

  return (
    <div className="space-y-2">
      <RequirementTypeBasicDetails
        defaultValues={defaultValues}
        params={{
          id: defaultValues?.id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity!,
          navigate: {
            wizard_step: "1",
            record_tab: "requirement_types",
          },
        }}
      />
    </div>
  );
};

export default RequirementTypeForm;
