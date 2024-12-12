import { Fragment } from "react";
import { UseFormReturn } from "react-hook-form";
import FormMultiSelect from "~/components/platform/FormBuilder/FormType/FormMultiSelect";
import { FormField } from "~/components/ui/form";

interface ICategoryDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  multiSelectOptions?: Record<string, any>;
}

export default function CustomLocationDetails({
  form,
  multiSelectOptions,
}: ICategoryDetails) {
  const locations = form.watch("locations");

  const excluded_location =
    multiSelectOptions?.locations?.length === locations?.length
      ? multiSelectOptions?.locations
      : [];

  return (
    <Fragment>
      <FormField
        name="work_setup"
        control={form.control}
        render={(formProps) => {
          return (
            <FormMultiSelect
              fieldConfig={{
                id: "work_setup",
                formType: "select",
                name: "work_setup",
                label: "Work Setup",
                required: true,
              }}
              formRenderProps={{
                ...formProps,
                field: {
                  ...formProps.field,
                  onChange: (value) => {
                    form.setValue("work_setup", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  },
                },
              }}
              form={form}
              multiselectOptions={multiSelectOptions}
            />
          );
        }}
      />
      <FormField
        name="locations"
        control={form.control}
        render={(formProps) => {
          return (
            <FormMultiSelect
              fieldConfig={{
                id: "locations",
                formType: "select",
                name: "locations",
                label: "Locations",
                placeholder: "Locations",
                required: true,
              }}
              formRenderProps={{
                ...formProps,
                field: {
                  ...formProps.field,
                  onChange: (value) => {
                    form.setValue("locations", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  },
                },
              }}
              form={form}
              multiselectOptions={multiSelectOptions}
            />
          );
        }}
      />
      <FormField
        name="excluded_location"
        control={form.control}
        render={(formProps) => {
          return (
            <FormMultiSelect
              fieldConfig={{
                id: "excluded_location",
                formType: "select",
                name: "excluded_location",
                label: "Exceptions",
                placeholder: "Excluded Locations",
                required: false,
                disabled: true,
              }}
              formRenderProps={{
                ...formProps,
                field: {
                  ...formProps.field,
                  onChange: (value) => {
                    form.setValue("excluded_location", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  },
                },
              }}
              form={form}
              multiselectOptions={{ excluded_location: excluded_location }}
            />
          );
        }}
      />
    </Fragment>
  );
}
