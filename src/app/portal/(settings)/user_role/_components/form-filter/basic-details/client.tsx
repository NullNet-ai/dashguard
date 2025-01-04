"use client";

import { z } from "zod";

import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import { removeRecord, savedRecord, selectRecord } from "./actions";
import gridColumns from "./_config/columns";
import SelectedView from "./components/SelectedView";
import { api } from "~/trpc/react";
import { UserRoleFormSchema } from "~/server/zodSchema/user_role/basicDetails";

export default function RoleDetails({
  params,
  defaultValues,
  selectedRecords,
  grid_data,
}: IFormProps) {
  const toast = useToast();

  const saveUserRole = api.user_role.saveUserRole.useMutation();

  const handleSave = async ({
    data,
    action_type,
    form,
  }: IHandleSubmit<z.infer<typeof UserRoleFormSchema>>): Promise<any[]> => {
    try {
      const res = await saveUserRole.mutateAsync({
        id: params.id,
        ...data,
      });

      //@ts-expect-error - Need to fix type for this
      const { existing = false, message } = res;

      if (existing) {
        form?.setError("role", {
          type: "manual",
          message,
        });
      }
      if (res?.status_code == 200) {
        const [user_role_data] = res?.data;
        toast.success("Basic Details submit sucessfully");
        if (action_type === "Create") {
          savedRecord({ code: user_role_data?.code });
        }
        return res.data;
      }

      return [];
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
        filter_entity: "user_role",
        main_entity_id: params.id,
        gridColumns: gridColumns,
        // fieldFilterGridColumns: FIELD_FILTER_GRID_COLUMNS,
        current: 1,
        limit: 1000,
        label: "Roles",
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
        handleSelectFieldFilterGrid: (data) => {
          return data;
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
      formSchema={UserRoleFormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: "role",
          formType: "input",
          name: "role",
          label: "Role",
          required: true,
          placeholder: "Role",
          withGridFilter: true,
          filterFieldConfig: {
            entity: "user_roles",
            field: "role",
          },
        },
      ]}
    />
  );
}
