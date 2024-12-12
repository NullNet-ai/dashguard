import { usePathname, useRouter } from "next/navigation";
import { Fragment } from "react";
import { type UseFormReturn } from "react-hook-form";
import FormSelect from "~/components/platform/FormBuilder/FormType/FormSelect";
import { FormField } from "~/components/ui/form";

interface ICategoryDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  selectOptions?: Record<string, any>;
}

export default function CustomCategoryDetails({ form }: ICategoryDetails) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Fragment>
      <FormField
        name="categories"
        control={form.control}
        render={(formProps) => {
          return (
            <FormSelect
              pillOptions={["Contact"]}
              fieldConfig={{
                id: "categories",
                formType: "select",
                name: "categories",
                label: "Category",
                required: true,
              }}
              formRenderProps={{
                ...formProps,
                field: {
                  ...formProps.field,
                  onChange: (value) => {
                    form.setValue("categories", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    router.replace(`${pathname}?categories=${value}`);
                  },
                },
              }}
              form={form}
              selectOptions={{
                categories: [
                  { label: "Employee", value: "Employee" },
                  { label: "Applicant", value: "Applicant" },
                ],
              }}
            />
          );
        }}
      />
    </Fragment>
  );
}
