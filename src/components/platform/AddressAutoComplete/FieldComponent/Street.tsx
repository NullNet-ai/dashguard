import { FormField } from "~/components/ui/form";
import FormInput from "../../FormBuilder/FormType/FormInput";
import { IFieldComponentProps } from "./type";

export default function StreetName({ form }: IFieldComponentProps) {
  return (
    <div className="space-y-0.5">
      <FormField
        name="details.street"
        control={form.control}
        render={(formRenderProps) => {
          return (
            <FormInput
              formKey="StreetName"
              fieldConfig={{
                ...formRenderProps?.field,
                label: "Street",
                id: `details.street`,
              }}
              form={form}
              formRenderProps={formRenderProps}
            />
          );
        }}
      />
    </div>
  );
}
