import { api } from "~/trpc/server";
import { fetchWorkSetup } from "../Action/createUpdatePositionLocationDetails";
import { headers } from "next/headers";
import LocationDetails from "./client";

const StepFourPositionLocationForm = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");
  const code_details = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "code"],
  });
  const record_id = code_details?.data?.id;
  const fetched_work_setup = await api.workSetups.fetchAllWorkSetup({
    pluck: ["id", "work_setup"],
    entity: "work_setup",
  });

  const work_setup = fetched_work_setup?.data.map((item) => ({
    label: item.work_setup,
    value: item.id,
  }));
  const fetched_countries = await api.country.getCountryOptions();

  const defaultValues = await fetchWorkSetup(record_id!);

  return (
    <div className="space-y-2">
      <LocationDetails
        defaultValues={defaultValues}
        multiSelectOptions={{
          work_setup: work_setup,
          locations: fetched_countries?.map((item) => ({
            value: item.label,
            label: item.label,
          })),
        }}
        params={{
          id: record_id!,
          shell_type: application! as "record" | "wizard",
          entity: "organization",
          navigate: {
            wizard_step: "1",
            record_tab: "organization",
          },
        }}
      />
    </div>
  );
};

export default StepFourPositionLocationForm;
