import { FormField } from "~/components/ui/form";
import FormInput from "../../FormBuilder/FormType/FormInput";
import { IFieldComponentProps } from "./type";

export default function AddressLineOne({ form }: IFieldComponentProps) {
  const address_values = form.getValues("details.address_line_one");
  return (
    <div className="space-y-0.5">
      <FormField
        name="details.address_line_one"
        control={form.control}
        render={(formRenderProps) => {
          return (
            <FormInput
            formKey="AddressLineOne"
              fieldConfig={{
                ...formRenderProps?.field,
                required: true,
                placeholder: "Street , House/Building No and Apartment/Unit No",
                label: "Address Line 1",
                id: `details.address_line_one`,
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
