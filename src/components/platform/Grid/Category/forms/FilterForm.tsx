import { Fragment, useContext, useState } from "react";
import { z } from "zod";
import { GridContext } from "../../Provider";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { useToast } from "~/context/ToastProvider";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { useCategoryContext } from "../Provider";
import { ulid } from "ulid";
import CustomFilterForm from "./CustomFilterForm";

const formSchema = z.object({
  filters: z.array(
    z
      .object({
        id: z.string().optional(),
        type: z.enum(["criteria", "operator"]).optional(),
        operator: z.string().optional(),
        field: z.string().optional(),
        values: z.string().optional(),
      })
      .refine(
        (data) =>
          (data.type === "criteria" &&
            data.field &&
            data.values &&
            data.operator) ||
          (data.type === "operator" && data.operator),
        (data) => {
          return {
            path: ["filters"],
            message:
              "For 'criteria', 'field' and 'values' are required. For 'operator', they should be optional.",
          };
        },
      ),
  ),
});

export default function FilterForm() {
  const { state } = useContext(GridContext);
  const { action, state: category_state } = useCategoryContext();
  const [filterSubmit, setFilterSubmit] = useState(false);
  const toast = useToast();
  const onSubmit = async ({ data }: any) => {
    const lastOperator =
      data?.filters?.[data?.filters?.length - 1]?.type === "operator";

    if (lastOperator) {
      toast.error("Please add a criteria before submitting");
      return;
    }

    try {
      setFilterSubmit(true);
      const newData = [...(data?.filters ?? [])];
      const filters = newData.map((filter) => {
        return {
          ...filter,
          values: [filter.values],
        };
      });
      action?.handleStoreUnSavedFilters(state?.config?.entity!, true, filters);
      // await SaveFilters({
      //   mainEntity: state?.config?.entity || "",
      //   filter_id,
      //   filters,
      // });
      setFilterSubmit(false);
    } catch (error) {
      setFilterSubmit(false);
    }
  };

  const handleChange = (data: any) => {
    const newData = [...(data?.filters ?? [])];
    const filters = newData.map((filter) => {
      return {
        ...filter,
        values: [filter.values],
      };
    });
    action?.handleStoreUnSavedFilters(state?.config?.entity!, false, filters);
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: "space-y-2",
      }}
      fields={[]}
      formKey="filters"
      formSchema={formSchema}
      // buttonHeaderRender={
      //   <div>
      //     <Button>
      //       <PlusIcon className="h-5 w-5" />
      //       Add filter
      //     </Button>
      //   </div>
      // }
      onDataChange={handleChange}
      handleSubmit={onSubmit}
      defaultValues={{
        filters: !!category_state?.filter_state.filter_by?.raw.length
          ? category_state?.filter_state.filter_by?.raw?.map((item) => {
              return {
                ...item,
                values:
                  typeof item.values === "string"
                    ? item.values
                    : item.values.join(", "),
              };
            })
          : [
              {
                id: ulid(),
                type: "criteria",
                field: "",
                operator: "",
                values: "",
              },
            ],
      }}
      buttonConfig={{
        hideAccordions: true,
        hideLockButton: true,
      }}
      customRender={(form) => {
        const hasError = (form?.formState?.errors?.filters as any)?.filter(
          Boolean,
        ) as any;
        return (
          <Fragment>
            {hasError?.length ? (
              <div className="my-2 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <XCircleIcon
                      aria-hidden="true"
                      className="h-5 w-5 text-red-400"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      There were {hasError?.length} errors with your submission
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul role="list" className="list-disc space-y-1 pl-5">
                        {hasError?.map((error: any, index: number) => (
                          <li key={index}>{error?.filters?.message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <CustomFilterForm form={form} />
          </Fragment>
        );
      }}
    />
  );
}
