import { FormField } from "~/components/ui/form";
import FormInput from "../../FormBuilder/FormType/FormInput";
import { type IFieldComponentProps } from "./type";

export default function AddressLineTwo({
  form,
  fieldConfig,
  formKey,
}: IFieldComponentProps) {
  const address_values = form.getValues("details.address_line_two");
  return (
    <div className="space-y-0.5">
      <FormField
        name="details.address_line_two"
        control={form.control}
        render={(formRenderProps) => {
          return (
            <FormInput
              data-test-id={formKey + "-" +  "inp-" + formRenderProps.field.name }
              formKey={formKey}
              fieldConfig={{
                ...fieldConfig,
                placeholder: "Suite, Floor and Landmarks.",
                label: "Address Line 2",
                id: `details.address_line_two`,
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
