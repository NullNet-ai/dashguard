import { api } from "~/trpc/server";
import BasicDetails from "./client";
import { headers } from "next/headers";

const StepOnePositionBasicDetailsForm = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const position = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: [
      "id",
      "title",
      "activation_date",
      "expiration_date",
      "position_type_id",
      "employment_type_id",
    ],
  });
  const record_id = position?.data?.id;
  // const position_role_options =
  //   await api.positionRoles.getPositionRoleOptions();

  const employment_type_options =
    await api.employmentType.getEmploymentTypeOptions();

  const position_type_options = await api.positionType.getPositionTypeOptions();

  const defaultValues = position?.data;

  return (
    <div className="space-y-2">
      <BasicDetails
        defaultValues={defaultValues}
        selectOptions={{
          employment_type_id: employment_type_options || [],
          position_type_id: position_type_options || [],
          // position_role_id: position_role_options || [],
        }}
        params={{
          id: record_id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
        }}
      />
    </div>
  );
};

export default StepOnePositionBasicDetailsForm;
