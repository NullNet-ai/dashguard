import { api } from "~/trpc/server";
import { headers } from "next/headers";
import CityBasicDetails from "./client";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

  const fetched_city = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ["id", "city", "country_id"],
  });

  const country_id_options = await api.country.getCountryOptions();
  const defaultValues = fetched_city?.data;

  return (
    <div className="space-y-2">
      <CityBasicDetails
        selectOptions={{
          country_id: country_id_options,
        }}
        defaultValues={defaultValues}
        params={{
          id: defaultValues?.id!,
          shell_type: application! as "record" | "wizard",
          entity: main_entity,
          navigate: {
            wizard_step: "1",
            record_tab: "city",
          },
        }}
      />
    </div>
  );
};

export default FormServerFetch;
