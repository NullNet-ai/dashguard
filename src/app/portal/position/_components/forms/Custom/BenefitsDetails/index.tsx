import { Fragment } from "react";
import { useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem } from "~/components/ui/form";
import { useEventListener } from "~/hooks/useEventListener";
import BasicFormHeader from "~/components/ui/basic-form-header";
import { Separator } from "~/components/ui/separator";
import { ulid } from "ulid";
import FormSelect from "~/components/platform/FormBuilder/FormType/FormSelect";
import { cn } from "../../../../../../../lib/utils";
import { IDropdown } from "../../types";

interface IBenefitDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  options?: {
    appendFormKey?: string;
  };
  params?: {
    id: string;
  };
  selectOptions?: {
    benefits?: IDropdown[];
  };
}

export default function CustomBenefitsDetails({
  form,
  options,
  selectOptions,
}: IBenefitDetails) {
  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: "benefits",
    keyName: "id",
  });

  const addBenefits = () => {
    append({
      id: ulid(),
      benefit_id: "",
    });
  };

  useEventListener({
    eventKey: options?.appendFormKey,
    listener: addBenefits,
  });

  return (
    <FormField
      name="benefits"
      control={form.control}
      render={(formProps) => {
        const errorMessage = formProps?.formState?.errors as {
          [key: string]: any;
        };
        return (
          <FormItem>
            {fields.map((field, index: any) => {
              const prefix = `benefits.${index}`;
              const _name = `${prefix}.benefit_id`;
              return (
                <Fragment key={field.id}>
                  {fields?.length > 1 && (
                    <BasicFormHeader
                      ellipseOptions={[
                        {
                          id: 1,
                          name: "Remove",
                          onClick: () => remove(index),
                        },
                      ]}
                    />
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      name={_name}
                      control={control}
                      render={(formProps) => {
                        return (
                          <div className="flex flex-col">
                            <FormSelect
                              fieldConfig={{
                                id: _name,
                                formType: "select",
                                label: `Benefit`,
                                required: true,
                                ...formProps.field,
                              }}
                              selectOptions={{
                                [_name]: selectOptions?.benefits || [],
                              }}
                              formRenderProps={formProps}
                              form={form}
                            />
                            {errorMessage?.[index] && (
                              <p
                                id={field.id}
                                className={cn(
                                  "py-1 text-sm font-medium text-destructive",
                                )}
                              >
                                {errorMessage[index]?.benefit_id?.message}
                              </p>
                            )}
                          </div>
                        );
                      }}
                    />
                  </div>
                  <Separator />
                </Fragment>
              );
            })}
          </FormItem>
        );
      }}
    />
  );
}
