/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { api } from "~/trpc/server";
import PositionDetailsRequirementsForm from "./client";
import { fetchReqByPositionIdDetails } from "../Action/createUpdatePositionRequirementDetails";
import { headers } from "next/headers";

const PositionDetailsRequirements = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const code_details = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id"],
  });

  const record_id = code_details?.data?.id;

  const fetch_requirement_type =
    await api.requirementType.fetchAllRequirementTypes({
      pluck: ["id", "requirement_type"],
    });

  const requirement_type = fetch_requirement_type?.data.map((item) => ({
    label: item.requirement_type,
    value: item.id,
  }));

  const defaultValuesRequirements = await fetchReqByPositionIdDetails(
    record_id!,
  );

  return (
    <div className="space-y-2">
      <PositionDetailsRequirementsForm
        defaultValues={{ requirements: defaultValuesRequirements }}
        selectOptions={{
          requirement_type: requirement_type,
        }}
        params={{
          id: record_id!,
          shell_type: application! as "record" | "wizard",
        }}
      />
    </div>
  );
};

export default PositionDetailsRequirements;
