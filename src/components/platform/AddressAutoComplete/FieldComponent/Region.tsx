import { FormField } from "~/components/ui/form";
import FormInput from "../../FormBuilder/FormType/FormInput";
import { IFieldComponentProps } from "./type";

export default function RegionName({ form, formKey }: IFieldComponentProps) {
  const address_values = form.getValues("details.region");
  return (
    <div className="space-y-0.5">
      <FormField
        name="details.region"
        control={form.control}
        render={(formRenderProps) => {
          return (
            <FormInput
              data-test-id={formKey + "-" + formRenderProps.field.name + "-inp"}
              formKey={formKey}
              fieldConfig={{
                ...formRenderProps?.field,
                label: "Region",
                id: `details.region`,
              }}
              formRenderProps={formRenderProps}
              form={form}
              value={address_values}
            />
          );
        }}
      />
    </div>
  );
}
