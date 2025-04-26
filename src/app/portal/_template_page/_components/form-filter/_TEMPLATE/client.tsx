"use client";

import { z } from "zod";

import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { useToast } from "~/context/ToastProvider";
import { ContactPhoneEmailSchema } from "~/server/zodSchema/template/contactPhoneEmail";
import { type IFormProps } from "../types";
import GRID_COLUMNS, { FIELD_FILTER_GRID_COLUMNS } from "./_config/columns";

import ACTION_TYPE from "./_config/actionType";
import FORM_FILTER_LABEL from "./_config/label";
import PAGINATION_LIMIT from "./_config/paginationLimit";
import STATUS_INCLUDED from "./_config/statusIncluded";
import handleSelectFieldFilterGrid from "./actions/handleSelectFieldFilterGrid";
import onFilterFieldChange from "./actions/onFilterFieldChange";
import onRemoveSelectedRecords from "./actions/onRemoveSelectedRecords";
import onSelectRecords from "./actions/onSelectRecords";
import SelectedView from "./components/SelectedView";
import renderComponentSelected from "./components/renderComponentSelected";

const { CURRENT, LIMIT } = PAGINATION_LIMIT;
const form_filter_entity = "";

const FormSchema = z.object({
  name: z.string(),
});

export default function ContactDetails({
  params,
  defaultValues,
  selectedRecords,
}: IFormProps) {
  const toast = useToast();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>): Promise<any[]> => {
    try {
      alert(JSON.stringify(data, null, 2));
      return await Promise.resolve([]);
    } catch (error) {
      toast.error("Failed to submit Basic Details");
      return [];
    }
  };

  return (
    <FormBuilder
      filterGridConfig={{
        selectedRecords,
        main_entity_id: params.id,
        pluck: params?.pluck_fields,
        filter_entity: form_filter_entity,
        current: CURRENT,
        limit: LIMIT,
        label: FORM_FILTER_LABEL,
        actionType: ACTION_TYPE,
        gridColumns: GRID_COLUMNS,
        statusesIncluded: STATUS_INCLUDED,
        fieldFilterGridColumns: FIELD_FILTER_GRID_COLUMNS,
        onSelectRecords,
        onRemoveSelectedRecords,
        onFilterFieldChange,
        handleSelectFieldFilterGrid,
        renderComponentSelected: renderComponentSelected(SelectedView),
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
          id: "name",
          formType: "input",
          name: "name",
          label: "Name",
          required: true,
          placeholder: "Name",
          withGridFilter: true,
          gridPosition: "right",
          filterFieldConfig: {
            entity: form_filter_entity,
            field: "name",
          },
        },
      ]}
    />
  );
}
