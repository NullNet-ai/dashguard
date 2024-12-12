import { useFieldArray, UseFormReturn } from "react-hook-form";
import { ulid } from "ulid";
import { useEventListener } from "~/hooks/useEventListener";
import { IDropdown } from "../../types";
import { FormField, FormItem } from "~/components/ui/form";
import { Fragment } from "react";
import FormModule from "~/components/platform/FormBuilder/FormModule";
import { Button } from "~/components/ui/button";
import { TrashIcon } from "@heroicons/react/24/outline";
import { IField } from "~/components/platform/FormBuilder/type";

interface IFilterDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  options?: {
    appendFormKey?: string;
  };
  selectOptions: {
    operator?: IDropdown[];
  };
  identifier: string;
}

const criteria_options = [
  { value: "equal", label: "Equal" },
  { value: "not_equal", label: "Not Equal" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Not Contains" },
  { value: "greater_than", label: "Greater Than" },
  { value: "greater_than_or_equal", label: "Greater Than or Equal" },
  { value: "less_than", label: "Less Than" },
  { value: "less_than_or_equal", label: "Less Than or Equal" },
  { value: "is_empty", label: "Is Empty" },
  { value: "is_not_empty", label: "Is Not Empty" },
  { value: "is_null", label: "Is Null" },
  { value: "is_not_null", label: "Is Not Null" },
  { value: "is_between", label: "Is Between" },
];

const operator_options = [
  { value: "and", label: "And" },
  { value: "or", label: "Or" },
];

const ReportFilter = ({ form, options, identifier }: IFilterDetails) => {
  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: "filters",
  });

  const addFilter = () => {
    append({
      id: ulid(),
      type: "operator",
      field: "N/A",
      operator: "",
      values: "N/A", // [] or "",
      report_id: identifier,
    });
    append({
      id: ulid(),
      type: "criteria",
      field: "",
      operator: "",
      values: "", // [] or "",
      report_id: identifier,
    });
  };

  useEventListener({
    eventKey: options?.appendFormKey,
    listener: addFilter,
  });

  return (
    <FormField
      name="filters"
      control={form.control}
      render={({ formState }) => {
        return (
          <FormItem className="h-[700px] overflow-y-auto">
            {fields?.map((item, index) => {
              // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
              const { type } = item;
              const prefix = `filters.${index}`;

              const form_fields: IField[] = [
                {
                  id: "type",
                  formType: "input",
                  name: `${prefix}.type`,
                  label: "Type",
                  required: false,
                  readonly: true,
                },
                {
                  id: "field",
                  formType: "input",
                  name: `${prefix}.field`,
                  label: "Field",
                  required: type === "criteria",
                  hidden: type === "operator",
                },
                {
                  id: "operator",
                  formType: "select",
                  name: `${prefix}.operator`,
                  label: "Operator",
                  required: true,
                },
                {
                  id: "values",
                  formType: "input",
                  name: `${prefix}.values`,
                  label: "Values",
                  required: type === "criteria",
                  hidden: type === "operator",
                },
              ];

              const select_options =
                type === "criteria" ? criteria_options : operator_options;
              return (
                <Fragment key={item.id}>
                  <div key={index} className="flex w-max items-center">
                    <div className="flex flex-1 items-center gap-2 space-x-2 rounded-md bg-tertiary p-2">
                      <FormModule
                        subConfig={{
                          selectOptions: {
                            [`${prefix}.operator`]: select_options,
                          },
                        }}
                        fields={form_fields}
                        form={form}
                      />
                      {index === 0 ||
                      type === "operator" ||
                      formState.disabled ? null : (
                        <Button
                          onClick={() => {
                            remove(index);
                            remove(index - 1);
                          }}
                          variant={"ghost"}
                          className="text-red-500"
                        >
                          <TrashIcon className="h-6 w-6" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </FormItem>
        );
      }}
    />
  );
};

export default ReportFilter;
