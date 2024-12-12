import { api } from "~/trpc/server";
import { headers } from "next/headers";
import PositionRoleDetails from "./client";

const StepOnePositionRolesForm = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const fetched_countries = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "position_role"],
  });

  const defaultValues = fetched_countries?.data;

  return (
    <div className="space-y-2">
      <PositionRoleDetails
        defaultValues={defaultValues}
        params={{
          id: defaultValues?.id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
          navigate: {
            wizard_step: "1",
            record_tab: "position_role",
          },
        }}
      />
    </div>
  );
};

export default StepOnePositionRolesForm;
