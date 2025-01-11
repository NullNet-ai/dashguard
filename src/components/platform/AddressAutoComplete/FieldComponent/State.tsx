import FormSelect from "../../FormBuilder/FormType/FormSelect";
import { type IFieldComponentProps } from "./type";
import States from "../states.json";
import { useMemo } from "react";
import { FormField } from "~/components/ui/form";

export default function StateName({ form,fieldConfig, formKey }: IFieldComponentProps) {
  const address_values_country = form.getValues("details.country");
  const state_list = useMemo(() => {
    return (
      States?.filter((op) => {
        return op?.country_name === address_values_country;
      })?.map((state) => ({
        label: state?.name,
        value: state?.name,
      })) ?? []
    );
  }, [address_values_country]);
  return (
    <div>
      <FormField
        name="details.state"
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
                // required: true,
                placeholder: "Select State",
                label: "State",
                id: `details.state`,
              }}
              form={form}
              formRenderProps={formRenderProps}
              selectOptions={{
                [`details.state`]: state_list,
              }}
            />
          );
        }}
      />
    </div>
  );
}
