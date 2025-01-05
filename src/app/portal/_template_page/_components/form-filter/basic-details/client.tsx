"use client";

import { z } from "zod";
import { useRouter } from "next/navigation";

import { FormBuilder } from "~/components/platform/EnhancedFormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { ContactPhoneEmailSchema } from "~/server/zodSchema/template/contactPhoneEmail";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import { removeRecord, saveContactDetails, selectRecord } from "./actions";
import gridColumns, { FIELD_FILTER_GRID_COLUMNS } from "./_config/columns";
import SelectedView from "./components/SelectedView";
import { api } from "~/trpc/react";
import { param } from "node_modules/cypress/types/jquery";

const form_filter_entity = ''

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
      const { id, entity } = params
      const response = await saveContactDetails({
        id, 
        ...data,
        [form_filter_entity]: data[form_filter_entity].map(e => {
          return {
            ...e,
            [`${entity}_id`]: id,
          }
        }), 
        form_filter_entity
      }, action_type);
      if (response?.existing) {
        // const { data } = response;
        // const { phones, emails } = data || {};
        form?.setError(form_filter_entity, {
          type: "manual",
          message: "Email already exists.",
        });
        return [];
      }

      if (action_type === "Create") {

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
      await removeRecord();
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
      const updated_main_entity_id = main_entity_id || params.id
      const [selectedRecord] = selectedRecords
      let item
      if (selectedRecord) {
        item = selectedRecord[filter_entity][0]
      }
      await selectRecord(rows, updated_main_entity_id, filter_entity, item)
      return {
        rows,
        filter_entity,
        main_entity_id: updated_main_entity_id,
      };
    } catch (error) {
      toast.error("Failed to submit Basic Details");
    }
  };

  return (
    <FormBuilder
      filterGridConfig={{
        selectedRecords,
        statusesIncluded: ["Active"], // Enable Selectable Record Status
        actionType: "single-select",
        pluck: params?.pluck_fields,
        filter_entity: form_filter_entity,
        main_entity_id: params.id,
        gridColumns: gridColumns,
        fieldFilterGridColumns: FIELD_FILTER_GRID_COLUMNS,
        current: 1,
        limit: 1000,
        label: "Test Label",
        // onClipboardPaste: (data, form, onSubmitFormGrid) => { // to modify pasting data
        //   form.reset(data, {
        //     keepDefaultValues: true,
        //   });

        //   form.handleSubmit((data: any) =>
        //     onSubmitFormGrid(data, { action_type: "Paste" }),
        //   )();
        // },
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
            rows,
            filter_entity,
            main_entity_id,
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
          // @ts-expect-error - Fix type later
          const { data } = api[params.entity].mainGrid.useQuery(
            search_params,
            options,
            form_filter_entity,
          );
          return data;
        },
        handleSelectFieldFilterGrid: (data) => {
          const { [form_filter_entity]: email, ...rest } =
            data ?? {};
          const resolvedData = {
            ...rest,
            [form_filter_entity]: [
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
      formSchema={ContactPhoneEmailSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "email",
          formType: "email-input",
          placeholder: "Email",
          name: form_filter_entity,
          label: "Email",
          required: true,
          withGridFilter: true,
          gridPosition: "right",
          filterFieldConfig: {
            entity: form_filter_entity,
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
