import { api } from "~/trpc/server";
import { headers } from "next/headers";
import PersonalDetails from "./client";

const FormServerFetch = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , application, identifier] = pathname.split("/");

  const response = await api.contact.getByCode({
    code: identifier!,
    pluck_fields: ["id", "date_of_birth", "nationalities", "address_id"],
  });

  let address_details = null;
  if (response?.data?.address_id) {
    const _address_details = await api.record.getById({
      id: response?.data?.address_id,
      main_entity: "addresses",
      pluck_fields: ["country", "city"],
    });
    address_details = _address_details;
  }

  const nationalities_options = await api.contact.nationalities();
  const countries = await api.contact.countries();
  const cities = await api.contact.cities({
    country: "United States",
  });

  if (response?.data) {
    const { address_id, nationalities = [], ...rest } = response.data;
    const _nationalities = nationalities.map((item: string) => ({
      label: item,
      value: item,
    }));
    response.data = { ...rest, nationalities: _nationalities };
  }

  const defaultValues = {
    ...response?.data,
    address: address_details?.data,
  };
  const contact_id = response?.data?.id;
  return (
    <div className="space-y-2">
      <PersonalDetails
        defaultValues={defaultValues}
        selectOptions={{
          "address.country": countries,
          "address.city": cities,
        }}
        multiSelectOptions={{
          nationalities: nationalities_options,
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
