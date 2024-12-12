import { Fragment } from "react";
import type { UseFormReturn } from "react-hook-form";
import FormNumberInput from "~/components/platform/FormBuilder/FormType/FormNumberInput";
import FormSelect from "~/components/platform/FormBuilder/FormType/FormSelect";
import { FormField, FormItem } from "~/components/ui/form";
import { IDropdown } from "../../types";

interface CompensationDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  options?: {
    appendFormKey?: string;
  };
  selectOptions: {
    pay_period_options: IDropdown[];
    currency_options: IDropdown[];
  };
}

export default function CustomCompensationDetails({
  form,
  selectOptions,
}: CompensationDetails) {
  const { control } = form;
  const { pay_period_options, currency_options } = selectOptions;

  return (
    <FormField
      name="Skills"
      control={form.control}
      render={() => {
        return (
          <FormItem>
            <Fragment>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  name={`pay_period_id`}
                  control={control}
                  render={(formProps) => {
                    return (
                      <FormSelect
                        fieldConfig={{
                          id: `pay_period_id`,
                          formType: "select",
                          name: `pay_period_id`,
                          label: "Pay Period",
                          placeholder: "Duration",
                        }}
                        formRenderProps={formProps}
                        form={form}
                        selectOptions={{
                          pay_period_id: pay_period_options,
                        }}
                      />
                    );
                  }}
                />
                <FormField
                  name={`currency`}
                  control={control}
                  render={(formProps) => {
                    return (
                      <FormSelect
                        fieldConfig={{
                          id: `currency`,
                          formType: "select",
                          name: `currency`,
                          label: "Currency",
                          placeholder: "Currency",
                        }}
                        formRenderProps={formProps}
                        form={form}
                        selectOptions={{
                          currency: currency_options,
                        }}
                      />
                    );
                  }}
                />
              </div>
              <div className="text-md pt-3 font-semibold text-gray-700">
                Salary Range
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  name={`minimum_salary`}
                  control={control}
                  render={(formProps) => {
                    return (
                      <FormNumberInput
                        fieldConfig={{
                          id: `minimum_salary`,
                          formType: "number-input",
                          name: `minimum_salary`,
                          label: `Min`,
                        }}
                        formRenderProps={formProps}
                        form={form}
                      />
                    );
                  }}
                />
                <FormField
                  name={`maximum_salary`}
                  control={control}
                  render={(formProps) => {
                    return (
                      <FormNumberInput
                        fieldConfig={{
                          id: `maximum_salary`,
                          formType: "number-input",
                          name: `maximum_salary`,
                          label: `Max`,
                        }}
                        formRenderProps={formProps}
                        form={form}
                      />
                    );
                  }}
                />
              </div>
            </Fragment>
          </FormItem>
        );
      }}
    />
  );
}
