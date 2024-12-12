import { api } from "~/trpc/server";
import { ulid } from "ulid";
import Benefits from "./client";
import { headers } from "next/headers";

const StepFiveBenefitsForm = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const position = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id"],
  });
  const record_id = position?.data?.id;
  const benefit_options = await api.benefit.getBenefitOptions();

  const benefits = await api.positionBenefit.getPositionBenefitsByPositionId({
    position_id: record_id!,
    pluck_fields: ["id", "benefit_id", "position_id"],
  });

  const default_values = benefits?.length
    ? benefits
    : [{ id: ulid(), benefit_id: "" }];

  return (
    <div className="space-y-2">
      <Benefits
        defaultValues={{
          benefits: default_values,
        }}
        selectOptions={{ benefits: benefit_options }}
        params={{
          id: record_id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default StepFiveBenefitsForm;
