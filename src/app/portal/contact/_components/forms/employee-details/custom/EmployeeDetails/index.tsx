import { Fragment } from "react";
import { type UseFormReturn } from "react-hook-form";
import { FormField } from "~/components/ui/form";
import { api } from "~/trpc/react";
import { transformDataToOptions } from "../../actions/utils";
import FormSelect from "../../../../../../../../components/platform/FormBuilder/FormType/FormSelect";
import FormInput from "../../../../../../../../components/platform/FormBuilder/FormType/FormInput";

interface ICategoryDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  multiSelectOptions?: Record<string, any>;
}

export default function CustomEmployeeDetails({
  form,
  multiSelectOptions,
}: ICategoryDetails) {
  const organizations = form.watch("organizations");

  const organizationAPI = api.organization.getOrganizationByParentIds.useQuery({
    parent_organization_ids: [organizations],
  });

  const sub_org_options = transformDataToOptions(organizationAPI?.data || []);

  return (
    <Fragment>
      <FormField
        name="organizations"
        control={form.control}
        render={(formProps) => {
          return (
            <FormSelect
              fieldConfig={{
                id: "organizations",
                formType: "select",
                name: "organizations",
                label: "Organization",
                required: true,
              }}
              formRenderProps={{
                ...formProps,
                field: {
                  ...formProps.field,
                  onChange: (value) => {
                    form.setValue("organizations", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    form.setValue("sub_organizations", "", {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  },
                },
              }}
              form={form}
              selectOptions={{
                organizations: multiSelectOptions?.organizations || [],
              }}
            />
          );
        }}
      />
      <FormField
        name="sub_organizations"
        control={form.control}
        render={(formProps) => {
          return (
            <FormSelect
              fieldConfig={{
                id: "sub_organizations",
                formType: "select",
                name: "sub_organizations",
                label: "Sub Organization",
                required: false,
              }}
              formRenderProps={{
                ...formProps,
                field: {
                  ...formProps.field,
                },
              }}
              form={form}
              selectOptions={{
                sub_organizations: sub_org_options || [],
              }}
            />
          );
        }}
      />
      <FormField
        name="job_title"
        control={form.control}
        render={(formProps) => {
          return (
            <FormInput
              fieldConfig={{
                id: "job_title",
                formType: "input",
                name: "job_title",
                label: "Job Title",
                required: true,
              }}
              formRenderProps={{
                ...formProps,
                field: {
                  ...formProps.field,
                },
              }}
              form={form}
            />
          );
        }}
      />
    </Fragment>
  );
}
