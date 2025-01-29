import FormInput from "../../FormBuilder/FormType/FormInput";
import { type IFieldComponentProps } from "./type";
import { FormField, FormMessage } from "~/components/ui/form";

export default function PostalName({ form,fieldConfig,formKey }: IFieldComponentProps) {
  const address_values = form.getValues("details.postal_code");
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   form.setValue(`details.postal_code`, e.target.value);
  // };

  return (
    <div className="space-y-0.5">
      <FormField
        name="details.postal_code"
        control={form.control}
        render={(formRenderProps) => {
          return (
            <FormInput
            data-test-id={formKey + "-" +  "inp-" + formRenderProps.field.name }
              formKey={formKey}
              fieldConfig={{
                ...fieldConfig,
                required: true,
                placeholder: "Enter ZIP Code",
                label: "ZIP Code",
                id: `details.postal_code`,
              }}
              formRenderProps={formRenderProps}
              form={form}
              value={address_values}
            />
          );
        }}
      />
      <FormMessage />
    </div>
  );
}
