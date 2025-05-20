import FormSelect from "../../FormBuilder/FormType/FormSelect";
import { type IFieldComponentProps } from "./type";
import CountryToCities from "../countriesToCities.json";
import { FormField } from "~/components/ui/form";

export default function CountryName({ form, formKey,fieldConfig }: IFieldComponentProps) {
  const handleSelect = (value: string) => {
    form.setValue(`details.country`, value);
    form.setValue(`details.city`, "");
    form.setValue(`details.state`, "");
    form.setValue(`details.postal_code`, "");
    form.setValue(`details.address_line_one`, "");
    form.setValue(`details.address_line_two`, "");
  };

  return (
    <FormField
      name="details.country"
      control={form.control}
      render={(formRenderProps) => {
        return (
          <FormSelect
            data-test-id={formKey + "-" + "sel-" + formRenderProps.field.name}
            formKey={formKey}
            fieldConfig={{
              ...fieldConfig,
              name: formRenderProps.field.name,
              selectSearchable: true,
              required: true,
              placeholder: "Select Country",
              label: "Country",
              id: `details.country`,
            }}
            form={form}
            formRenderProps={{
              ...formRenderProps,
              field: {
                ...formRenderProps.field,
                onChange: (value) => {
                  handleSelect(value);
                },
              },
            }}
            selectOptions={{
              [`details.country`]: Object.keys(CountryToCities ?? {})?.map(
                (country) => {
                  return { label: country, value: country };
                },
              ),
            }}
          />
        );
      }}
    />
  );
}
