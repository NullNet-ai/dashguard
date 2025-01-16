"use client";

import { type z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import { ContactOrganizationDetailsSchema } from "~/server/zodSchema/contact/organizationDetails";

export default function OrganizationDetails({
  params,
  defaultValues,
  selectOptions,
  multiSelectOptions,
}: IFormProps) {
  const toast = useToast();
  const updateOrganization = api.organizationContact.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof ContactOrganizationDetailsSchema>>) => {
    try {
      const { organizations, user_roles } = data;
      const response = await updateOrganization.mutateAsync({
        contact_organization_ids: organizations?.map((itm) => itm.value),
        user_role_ids: user_roles?.map((itm) => itm.value),
        contact_id: params.id,
      });
      if (response) {
        toast.success("Organization Details submit successfully");
        return response;
      }
      throw new Error("Failed to submit Organization Details");
    } catch (error) {
      toast.error("Failed to submit Organization Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent={false}
      formProps={params}
      formLabel="Organization"
      handleSubmit={handleSave}
      formKey="organization_details"
      formSchema={ContactOrganizationDetailsSchema}
      defaultValues={defaultValues}
      multiSelectOptions={multiSelectOptions}
      selectOptions={selectOptions}
      fields={[
        {
          id: "organizations",
          formType: "select",
          name: "organizations",
          label: "Organization",
          required: true,
          selectEnableCreate: true,
          // onCreateRecord: async (data) => {
          //   console.log(
          //     "%c 🔣: data ",
          //     "font-size:16px;background-color:#146755;color:white;",
          //     data,
          //   );
          //   return {
          //     value: "testing123334",
          //     label: "testing",
          //   };
          // },
          onCreateRecord: {
            entity: "organization",
            fieldIdentifier: "name",
            customParams: {
              parent_organization_id: "01JBHKXHYSKPP247HZZWHA3JCT",
              organization_id: "01JBHKXHYSKPP247HZZWHA3JCT",
            },
          },
        },
        {
          id: "user_roles",
          formType: "multi-select",
          name: "user_roles",
          label: "Role",
          required: true,
          selectEnableCreate: true,
          onCreateRecord: {
            entity: "user_role",
            fieldIdentifier: "role",
          },
          // onCreateRecord: async (data) => {
          //   return {
          //     value: "testing123334",
          //     label: data,
          //   };
          // },
        },
      ]}
    />
  );
}
