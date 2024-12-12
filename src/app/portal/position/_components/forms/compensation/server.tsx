import { api } from "~/trpc/server";
import { headers } from "next/headers";
import CompensationDetails from "./client";

const StepFiveCompensationForm = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const pay_period_options = await api.position.getDropdowns({
    entity: "pay_periods",
    label_field: "pay_period",
    pluck: ["id", "pay_period"],
  });

  const currency_options = await api.position.getCurrency();

  const position = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: [
      "id",
      "pay_period_id",
      "currency",
      "minimum_salary",
      "maximum_salary",
    ],
  });
  const record_id = position?.data?.id;
  const defaultValues = position?.data!;

  return (
    <div className="space-y-2">
      <CompensationDetails
        defaultValues={defaultValues}
        selectOptions={{ pay_period_options, currency_options }}
        params={{
          id: record_id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default StepFiveCompensationForm;
