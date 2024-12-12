import { Fragment } from "react";
import { useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import FormInput from "~/components/platform/FormBuilder/FormType/FormInput";
import { FormField, FormItem } from "~/components/ui/form";
import { useEventListener } from "~/hooks/useEventListener";
import BasicFormHeader from "~/components/ui/basic-form-header";
import { ulid } from "ulid";
import FormSelect from "~/components/platform/FormBuilder/FormType/FormSelect";

const empty_req = {
  requirement_type: "",
  requirement_description: "",
};

interface IRequirementDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  options?: {
    appendFormKey?: string;
  };
  selectOptions?: Record<string, any>;
}

export default function RequirementsDetails({
  form,
  options,
  selectOptions,
}: IRequirementDetails) {
  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: "requirements",
    keyName: "id",
  });

  const addRequirements = () => {
    append({
      id: ulid(),
      ...empty_req,
    });
  };

  useEventListener({
    eventKey: options?.appendFormKey,
    listener: addRequirements,
  });

  return (
    <FormField
      name="Requirements"
      control={form.control}
      render={() => {
        return (
          <FormItem>
            {fields.map((field, index: any) => {
              const prefix = `requirements.${index}`;
              return (
                <Fragment key={field.id}>
                  {fields?.length > 1 && (
                    <BasicFormHeader
                      // label="Requirements"
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
                      name={`${prefix}.requirement_type`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormSelect
                            selectOptions={{
                              [`${prefix}.requirement_type`]:
                                selectOptions?.requirement_type || [],
                            }}
                            fieldConfig={{
                              id: `${prefix}.requirement_type`,
                              formType: "select",
                              name: `${prefix}.requirement_type`,
                              label: "Requirement Type",
                              placeholder: "Requirement Type",
                            }}
                            formRenderProps={{
                              ...formProps,
                              field: { ...formProps?.field },
                            }}
                            form={form}
                          />
                        );
                      }}
                    />
                    <FormField
                      name={`${prefix}.requirement_description`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormInput
                            fieldConfig={{
                              id: `${prefix}.requirement_description`,
                              formType: "input",
                              name: `${prefix}.requirement_description`,
                              label: "Requirement Description",
                              placeholder: "Requirement Description",
                            }}
                            formRenderProps={{
                              ...formProps,
                              field: { ...formProps?.field },
                            }}
                            form={form}
                          />
                        );
                      }}
                    />
                  </div>
                </Fragment>
              );
            })}
          </FormItem>
        );
      }}
    />
  );
}
