import { FormField } from "~/components/ui/form";
import FormInput from "../../FormBuilder/FormType/FormInput";
import { IFieldComponentProps } from "./type";

export default function AddressLineTwo({ form }: IFieldComponentProps) {
  const address_values = form.getValues("details.address_line_two");
  return (
    <div className="space-y-0.5">
      <FormField
        name="details.address_line_two"
        control={form.control}
        render={(formRenderProps) => {
          return (
            <FormInput
              fieldConfig={{
                ...formRenderProps?.field,
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
