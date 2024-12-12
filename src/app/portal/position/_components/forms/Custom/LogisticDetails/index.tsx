import { Fragment } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField } from "~/components/ui/form";
import { api } from "~/trpc/react";
import FormSelect from "../../../../../../../components/platform/FormBuilder/FormType/FormSelect";
import FormMultiSelect from "~/components/platform/FormBuilder/FormType/FormMultiSelect";
import { transformDataToOptions } from "~/app/portal/contact/_components/forms/basic-details/actions/utils";

interface ICategoryDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  selectOptions?: Record<string, any>;
}

export default function CustomLogisticDetails({
  form,
  selectOptions,
}: ICategoryDetails) {
  const company_id = form.watch("company_id");
  const department_id = form.watch("department_id");
  const team_id = form.watch("team_id");

  const transformOrgs = (org_id: string) => {
    const organizationAPI =
      api.organization.getOrganizationByParentIds.useQuery({
        parent_organization_ids: [org_id],
      });
    return transformDataToOptions(organizationAPI?.data || []);
  };

  const department_options = transformOrgs(company_id);

  const team_options = transformOrgs(department_id);

  const report_to_options = api.contact.getContactByOrganizationId.useQuery({
    organization_id: team_id || department_id,
  });
  return (
    <Fragment>
      <FormField
        name="company_id"
        control={form.control}
        render={(formProps) => {
          return (
            <FormSelect
              fieldConfig={{
                id: "company_id",
                formType: "select",
                name: "company_id",
                label: "Company",
                required: true,
              }}
              formRenderProps={{
                ...formProps,
                field: {
                  ...formProps.field,
                  onChange: (value) => {
                    form.setValue("company_id", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    form.setValue("department_id", "", {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    form.setValue("report_to", [], {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  },
                },
              }}
              form={form}
              selectOptions={{
                company_id: selectOptions?.company_options || [],
              }}
            />
          );
        }}
      />
      <FormField
        name="department_id"
        control={form.control}
        render={(formProps) => {
          return (
            <FormSelect
              fieldConfig={{
                id: "department_id",
                formType: "select",
                name: "department_id",
                label: "Department",
                required: true,
              }}
              formRenderProps={{
                ...formProps,
                field: {
                  ...formProps.field,
                  onChange: (value) => {
                    form.setValue("department_id", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    form.setValue("team_id", "", {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    form.setValue("report_to", [], {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  },
                },
              }}
              form={form}
              selectOptions={{
                department_id: department_options || [],
              }}
            />
          );
        }}
      />
      <FormField
        name="team_id"
        control={form.control}
        render={(formProps) => {
          return (
            <FormSelect
              fieldConfig={{
                id: "team_id",
                formType: "select",
                name: "team_id",
                label: "Team",
                required: false,
              }}
              formRenderProps={{
                ...formProps,
                field: {
                  ...formProps.field,
                  onChange: (value) => {
                    form.setValue("team_id", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    form.setValue("report_to", [], {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  },
                },
              }}
              form={form}
              selectOptions={{
                team_id: team_options || [],
              }}
            />
          );
        }}
      />

      <FormField
        name="report_to"
        control={form.control}
        render={(formProps) => {
          return (
            <FormMultiSelect
              fieldConfig={{
                id: "report_to",
                formType: "multi-select",
                name: "report_to",
                label: "Report To",
                required: true,
              }}
              formRenderProps={{
                ...formProps,
                field: {
                  ...formProps.field,
                },
              }}
              form={form}
              multiselectOptions={{
                report_to: report_to_options?.data || [],
              }}
            />
          );
        }}
      />
    </Fragment>
  );
}
