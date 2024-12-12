import { api } from "~/trpc/server";
import { headers } from "next/headers";
import ProfessionalDetails from "./client";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const response = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: [
      "id",
      "current_title",
      "years_of_experience",
      "current_company",
      "current_salary",
      "salary_currency",
      "notice_period",
    ],
  });

  const notice_period_options = [
    {
      label: "2 Weeks",
      value: "2 Weeks",
    },
    {
      label: "30 Days",
      value: "30 Days",
    },
    { label: "60 Days", value: "60 Days" },
    { label: "90 Days", value: "90 Days" },
  ];

  const { data = {} } = response || {};

  const { salary_currency, current_salary, id: contact_id } = data || {};

  const default_values = {
    ...data,
    salary_currency: salary_currency || "USD",
    current_salary: current_salary || 0.0,
  };

  return (
    <div className="space-y-2">
      <ProfessionalDetails
        defaultValues={default_values}
        selectOptions={{
          notice_period: notice_period_options ?? [],
        }}
        params={{
          id: contact_id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default FormServerFetch;
