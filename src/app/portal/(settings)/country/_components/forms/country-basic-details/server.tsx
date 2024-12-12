import { api } from "~/trpc/server";
import { headers } from "next/headers";
import CountryBasicDetails from "./client";

const StepOneCountriesForm = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , application, identifier] = pathname.split("/");

  const fetched_countries = await api.record.getByCode({
    main_entity: "countries",
    id: identifier!,
    pluck_fields: ["id", "country"],
  });
  CountryBasicDetails;
  const defaultValues = fetched_countries?.data;

  return (
    <div className="space-y-2">
      <CountryBasicDetails
        defaultValues={defaultValues}
        params={{
          id: defaultValues?.id!,
          shell_type: application! as "record" | "wizard",
          entity: "countries",
          navigate: {
            wizard_step: "1",
            record_tab: "country",
          },
        }}
      />
    </div>
  );
};

export default StepOneCountriesForm;
