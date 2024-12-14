"use client";

import { z } from "zod";
import { useRouter } from "next/navigation";

import { FormBuilder } from "~/components/platform/EnhancedFormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { ContactPhoneEmailSchema } from "~/server/zodSchema/contact/contactPhoneEmail";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import { saveContactDetails, selectRecord } from "./actions";
import gridColumns, { FIELD_FILTER_GRID_COLUMNS } from "./_config/columns";
import SelectedView from "./components/SelectedView";
import { api } from "~/trpc/react";

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
    try {
      const response = await saveContactDetails(data, action_type);
      if (response?.existing) {
        // const { data } = response;
        // const { phones, emails } = data || {};
        //TODO: Add error message in field and don't proceed to view mode.
        toast.error(`Contact already exists.`);
        return [];
      }

      if (action_type === "Create") {
        const code = response?.code;
        router.push(`/portal/contact/wizard/${code}/1`);
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
        statusesIncluded: ["Draft"], // Enable Selectable Record Status
        actionType: "single-select",
        pluck: params?.pluck_fields,
        filter_entity: "contact",
        main_entity_id: params.id,
        gridColumns: gridColumns,
        fieldFilterGridColumns: FIELD_FILTER_GRID_COLUMNS,
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
          required: true,
          gridPosition: "left",
          withGridFilter: true,
          filterFieldConfig: {
            entity: "contact_phone_numbers",
            field: "raw_phone_number",
          },
        },
        {
          id: "email",
          formType: "email-input",
          placeholder: "Email",
          name: "email",
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
      // customFormFilterViewFormActions={[
      //   {
      //     label: "Custom Action",
      //     onClick: () => {
      //       console.log("Custom Action Clicked");
      //     },
      //     icon: <XIcon className="h-3 w-3 text-slate-500" strokeWidth={3} />,
      //     disabled: false,
      //     hidden: false,
      //   },
      // ]}
      // customFormFilterLockFormActions={[
      //   {
      //     label: "Custom Action",
      //     onClick: () => {
      //       console.log("Custom Action Clicked");
      //     },
      //     icon: <XIcon className="h-3 w-3 text-slate-500" strokeWidth={3} />,
      //     disabled: false,
      //     hidden: false,
      //   },
      // ]}
      // features={{

      // }}
    />
  );
}
