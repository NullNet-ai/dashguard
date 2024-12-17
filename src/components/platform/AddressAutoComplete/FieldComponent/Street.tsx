import { FormField } from "~/components/ui/form";
import FormInput from "../../FormBuilder/FormType/FormInput";
import { type IFieldComponentProps } from "./type";

export default function StreetName({ form,formKey }: IFieldComponentProps) {
  return (
    <div className="space-y-0.5">
      <FormField
        name="details.street"
        control={form.control}
        render={(formRenderProps) => {
          return (
            <FormInput
              data-test-id={formKey + "-" +  "inp-" + formRenderProps.field.name}
              formKey={formKey}
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
