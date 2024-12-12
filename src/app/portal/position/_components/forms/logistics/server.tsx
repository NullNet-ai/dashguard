import { api } from "~/trpc/server";
import LogisticDetails from "./client";
import { headers } from "next/headers";

const StepTwoLogisticsForm = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const code_details = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "company_id", "department_id", "team_id"],
  });
  const record_id = code_details?.data?.id;
  const fetch_report_to = await api.position.filterRepostTo({
    id: record_id!,
  });

  let company_options = await api.organization.getCurrentUserSubOrganizations();

  company_options = company_options?.map((org) => ({
    label: org.name,
    value: org.id,
  }));

  const defaultValues = {
    ...code_details?.data,
    report_to: fetch_report_to,
  };

  return (
    <div className="space-y-2">
      <LogisticDetails
        defaultValues={defaultValues}
        selectOptions={{ company_options: company_options }}
        params={{
          id: record_id!,
          shell_type: application! as "record" | "wizard",
          entity: "position",
          navigate: {
            wizard_step: "1",
            record_tab: "position",
          },
        }}
      />
    </div>
  );
};

export default StepTwoLogisticsForm;
