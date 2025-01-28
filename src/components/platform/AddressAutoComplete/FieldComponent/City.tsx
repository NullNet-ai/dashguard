import FormSelect from "../../FormBuilder/FormType/FormSelect";
import { type IFieldComponentProps } from "./type";
import CountryToCities from "../countriesToCities.json";
import { useMemo } from "react";
import { FormField } from "~/components/ui/form";
export default function CityName({
  form,
  formKey,
  fieldConfig,
}: IFieldComponentProps) {
  const address_values_country = form.getValues("details.country");

  const city_list = useMemo(() => {
    //@ts-expect-error - country is not a valid key
    const cities = CountryToCities?.[address_values_country] as string[];
    const _cities = [...new Set(cities || [])] as string[];
    return (
      _cities?.map((city) => ({
        label: city,
        value: city,
      })) ?? []
    );
  }, [address_values_country]);

  return (
    <div>
      <FormField
        name="details.city"
        control={form.control}
        render={(formRenderProps) => {
          return (
            <FormSelect
              data-test-id={formKey + "-" + "sel-" + formRenderProps.field.name}
              formKey={formKey}
              fieldConfig={{
                selectSearchable: true,
                ...fieldConfig,
                name: formRenderProps.field.name,
                required: true,
                placeholder: "Select City",
                label: "City",
                id: `details.city`,
              }}
              form={form}
              formRenderProps={formRenderProps}
              selectOptions={{
                [`details.city`]: city_list,
              }}
            />
          );
        }}
      />
    </div>
  );
}
