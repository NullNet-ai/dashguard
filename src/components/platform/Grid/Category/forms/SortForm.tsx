import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { EOrderDirection } from "../type";
import { useContext } from "react";
import { GridContext } from "../../Provider";
import getHeaderValue from "~/lib/header-value";
import { useCategoryContext } from "../Provider";

const SortSchema = z.object({
  sort_by_field: z.string().min(1),
  sort_by_direction: z.enum([
    EOrderDirection.DESC,
    EOrderDirection.ASC,
    EOrderDirection.DESCENDING,
    EOrderDirection.ASCENDING,
  ]),
});

export default function SortForm() {
  const { state } = useContext(GridContext);
  const { action, state: category_state } = useCategoryContext();
  const handleSubmit = async (data: z.infer<typeof SortSchema>) => {
    action?.handleStoreUnSavedSorts(
      category_state?.filter_state?.filter_id!,
      true,
      {
        sort_by_direction: data.sort_by_direction,
        sort_by_field: data.sort_by_field,
      },
    );
  };
  const onChange = async (data: any) => {
    action?.handleStoreUnSavedSorts(
      category_state?.filter_state?.filter_id!,
      false,
      {
        sort_by_direction: data.sort_by_direction,
        sort_by_field: data.sort_by_field,
      },
    );
  };

  return (
    <FormBuilder
      formSchema={SortSchema}
      formKey="sort"
      buttonConfig={{
        hideAccordions: true,
        hideLockButton: true,
      }}
      onDataChange={onChange}
      handleSubmit={handleSubmit}
      defaultValues={{
        sort_by_field: category_state?.filter_state?.sort_by?.sort_by_field,
        sort_by_direction:
          category_state?.filter_state?.sort_by?.sort_by_direction,
      }}
      selectOptions={{
        sort_by_field:
          state?.table?.getAllLeafColumns()?.map((column) => {
            return {
              value: column.id,
              label: getHeaderValue(column),
            };
          }) ?? [],
        sort_by_direction: [
          { value: EOrderDirection.ASC, label: "Asc" },
          { value: EOrderDirection.DESC, label: "Desc" },
          {
            value: EOrderDirection.ASCENDING,
            label: "Ascending",
          },
          {
            value: EOrderDirection.DESCENDING,
            label: "Descending",
          },
        ],
      }}
      fields={[
        {
          name: "sort_by_field",
          label: "Sort By Field",
          id: "sort_by_field",
          type: "select",
          formType: "select",
        },
        {
          name: "sort_by_direction",
          label: "Sort By Direction",
          id: "sort_by_direction",
          type: "select",
          formType: "select",
        },
      ]}
    />
  );
}
