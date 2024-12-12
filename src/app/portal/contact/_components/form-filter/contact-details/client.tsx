"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/EnhancedFormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import { removeRecord, saveContactDetails, selectRecord } from "./actions";
import gridColumns from "./_config/columns";
import { useRouter } from "next/navigation";
import { ContactPhoneEmailSchema } from "~/server/zodSchema/contact/contactPhoneEmail";

export default function ContactDetails({
  params,
  defaultValues,
  selectedRecords,
}: IFormProps) {
  const router = useRouter();
  const toast = useToast();
  const handleSave = async ({
    data,
    action_type,
  }: IHandleSubmit<z.infer<typeof ContactPhoneEmailSchema>>): Promise<
    any[]
  > => {
    const response = await saveContactDetails(data, action_type);
    if (action_type === "Create") {
      router.push(`/portal/contacts/wizard/${response?.[0]?.code}/1`);
    }
    return response;
  };

  const handRemoveRecord = async ({
    filter_entity,
  }: {
    rows: any[];
    main_entity_id: string;
    filter_entity: string;
  }) => {
    try {
      removeRecord();
      return {
        rows: [],
        filter_entity,
        main_entity_id: "",
      };
    } catch (error) {
      toast.error("Failed to submit Basic Details");
    }
  };

  const handleSelectRecord = async ({
    rows,
    filter_entity,
    main_entity_id,
  }: {
    rows: any[];
    main_entity_id: string;
    filter_entity: string;
  }) => {
    try {
      await selectRecord(rows);
      return {
        rows,
        filter_entity,
        main_entity_id,
      };
    } catch (error) {
      toast.error("Failed to submit Basic Details");
    }
  };

  return (
    <FormBuilder
      filterGridConfig={{
        selectedRecords,
        statusesIncluded: ["Draft"],
        actionType: "single-select",
        pluck: params?.pluck_fields,
        filter_entity: "contact",
        main_entity_id: params.id,
        gridColumns: gridColumns,
        current: 1,
        limit: 1000,
        label: "Contacts",
        async onSelectRecords({ filter_entity, main_entity_id, rows }) {
          const response = (await handleSelectRecord({
            rows,
            filter_entity,
            main_entity_id,
          })) as {
            rows: any[];
            main_entity_id: string;
            filter_entity: string;
          };

          return {
            rows: response.rows,
            filter_entity: response.filter_entity,
            main_entity_id: response.main_entity_id,
          };
        },
        async onRemoveSelectedRecords({ filter_entity, main_entity_id, rows }) {
          const response = (await handRemoveRecord({
            rows,
            filter_entity,
            main_entity_id,
          })) as {
            rows: any[];
            filter_entity: string;
            main_entity_id: string;
          };
          return {
            rows: response.rows,
            filter_entity: response.filter_entity,
            main_entity_id: response.main_entity_id,
          };
        },
        renderComponentSelected: (record) => {
          return (
            <div>
              <div>
                Primary Phone Number: {record.phone?.[0]?.raw_phone_number}
              </div>
              <div>Primary Email: {record.email?.[0]?.email}</div>
            </div>
          );
        },
      }}
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Basic Details"
      handleSubmitFormGrid={handleSave}
      formKey="basicDetails"
      formSchema={ContactPhoneEmailSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "phone",
          formType: "phone-input",
          placeholder: "Phone Number",
          name: "phone",
          label: "Phone Number",
        },
        {
          id: "email",
          formType: "email-input",
          placeholder: "email address",
          name: "email",
          label: "Email Address",
        },
      ]}
    />
  );
}
