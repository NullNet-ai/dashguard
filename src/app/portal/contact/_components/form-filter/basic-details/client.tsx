"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";

import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { useToast } from "~/context/ToastProvider";
import { ContactPhoneEmailSchema } from "~/server/zodSchema/contact/contactPhoneEmail";
import { api } from "~/trpc/react";
import { type IFormProps } from "../types";
import gridColumns, { FIELD_FILTER_GRID_COLUMNS } from "./_config/columns";
import { closeCurrentInnerClassTab, fetchRecords, saveContactDetails, selectRecord } from "./actions";
import SelectedView from "./components/SelectedView";
import { ulid } from "ulid";

const defaultAdvanceFilter = [
  {
    entity: "contacts",
    operator: "equal",
    type: "criteria",
    field: "status",
    id: ulid(),
    label: "Status",
    values: ["Active"],
    default: true,
  },
  {
    operator: "or",
    type: "operator",
    default: true,
  },
  {
    entity: "contacts",
    operator: "equal",
    type: "criteria",
    field: "status",
    id: ulid(),
    label: "Status",
    values: ["Draft"],
    default: true,
  }
];

export default function ContactDetails({
  params,
  defaultValues,
  selectedRecords,
  grid_data,
}: IFormProps) {
  const router = useRouter();
  const toast = useToast();

  const handleSave = async ({
    data,
    action_type,
    form,
  }: IHandleSubmit<z.infer<typeof ContactPhoneEmailSchema>>): Promise<
    any[]
  > => {
    try {
      const response = await saveContactDetails(data);
      if (response?.existing) {
        form?.setError("phones", {
          type: "manual",
          message: "Phone Number already exists.",
        });
        form?.setError("emails", {
          type: "manual",
          message: "Email already exists.",
        });
        return [];
      }

      if (action_type === "Create") {
        await closeCurrentInnerClassTab({
          code: response.code!,
        })
      }
      return [response];
    } catch (error) {
      toast.error("Failed to submit Basic Details");
      return [];
    }
  };

  const handleRemoveRecord = async ({
    filter_entity,
  }: {
    rows: any[];
    main_entity_id: string;
    filter_entity: string;
  }) => {
    try {
      // await removeRecord();
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
    // <MultipleFormBuilder
    <FormBuilder
      filterGridConfig={{
        selectedRecords,
        statusesIncluded: ["Draft"], // Enable Selectable Record Status
        actionType: "single-select",
        // actionType: "multi-select",
        hideSearch: false,
        pluck: params?.pluck_fields,
        filter_entity: "contact",
        is_same_entity_id: true,
        main_entity_id: params.id,
        gridColumns: gridColumns,
        fieldFilterGridColumns: FIELD_FILTER_GRID_COLUMNS,
        current: 1,
        limit: 1000,
        label: "Contacts",
        searchConfig: {
          router: "contact",
          resolver: "mainGrid",
          query_params: {
            entity: "contact",
            pluck: params?.pluck_fields,
            default_advance_filters : defaultAdvanceFilter,
            default_sorting : [
              {
                id: "created_date",
                desc: true,
                sort_key: "created_date",
              },
            ]
          },
        },
        // onClipboardPaste: (data, form, onSubmitFormGrid) => { // to modify pasting data
        //   form.reset(data, {
        //     keepDefaultValues: true,
        //   });

        //   form.handleSubmit((data: any) =>
        //     onSubmitFormGrid(data, { action_type: "Paste" }),
        //   )();
        // },

        onSelectRecords : async ({ filter_entity, main_entity_id, rows }) => {
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
        onRemoveSelectedRecords : async ({ filter_entity, main_entity_id, rows }) => {
          const response = (await handleRemoveRecord({
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
        onFilterFieldChange: (search_params, options) => {  
          const { data } = api.contact.mainGrid.useQuery(
            search_params,
            options,
          );
          return data;
        },
        handleSelectFieldFilterGrid: (data) => {
          const { raw_phone_number, iso_code, country_code, email, ...rest } =
            data ?? {};
          const resolvedData = {
            ...rest,
            phone: [
              {
                raw_phone_number,
                iso_code,
                country_code,
              },
            ],
            email: [
              {
                email,
              },
            ],
          };
          return resolvedData;
        },
        renderComponentSelected: (record) => {
          // Selected View Component
          return <SelectedView record={record} />;
        },
        grid_data: grid_data,
      }}
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Basic Details"
      handleSubmitFormGrid={handleSave}
      formKey="basicDetails"
      // formSchema={MultipleContactPhoneEmailSchema}
      formSchema={ContactPhoneEmailSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "phones",
          formType: "phone-input",
          placeholder: "Phone Number",
          name: "phones",
          label: "Phone Number",
          required: true,
          gridPosition: "left",
          withGridFilter: true,
          filterFieldConfig: {
            entity: "contact_phone_numbers",
            field: "raw_phone_number",
          },
        },
        {
          id: "emails",
          formType: "email-input",
          placeholder: "Email",
          name: "emails",
          label: "Email",
          required: true,
          withGridFilter: true,
          gridPosition: "right",
          filterFieldConfig: {
            entity: "contact_emails",
            field: "email",
          },
        },
      ]}
    />
  );
}
