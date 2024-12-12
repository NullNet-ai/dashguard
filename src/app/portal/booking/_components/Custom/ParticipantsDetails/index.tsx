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
  full_name: "",
  assignment: "",
};

interface IParticipantsDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  options?: {
    appendFormKey?: string;
  };
  selectOptions?: Record<string, any>;
}

export default function ParticipantsDetails({
  form,
  options,
  selectOptions,
}: IParticipantsDetails) {
  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: "participants",
    keyName: "id",
  });

  const addParticipants = () => {
    append({
      id: ulid(),
      ...empty_req,
    });
  };

  useEventListener({
    eventKey: options?.appendFormKey,
    listener: addParticipants,
  });

  return (
    <FormField
      name="Participants"
      control={form.control}
      render={() => {
        return (
          <FormItem>
            {fields.map((field, index: any) => {
              const prefix = `participants.${index}`;
              return (
                <Fragment key={field.id}>
                  {fields?.length > 1 && (
                    <BasicFormHeader
                      // label="Participants"
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
                      name={`${prefix}.full_name`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormSelect
                            selectOptions={{
                              [`${prefix}.full_name`]:
                                selectOptions?.full_name || [],
                            }}
                            fieldConfig={{
                              id: `${prefix}.full_name`,
                              formType: "select",
                              name: `${prefix}.full_name`,
                              label: "Full Name",
                              placeholder: "Full Name",
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
                      name={`${prefix}.assignment`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormInput
                            fieldConfig={{
                              id: `${prefix}.assignment`,
                              formType: "input",
                              name: `${prefix}.assignment`,
                              label: "Assignment in Booking",
                              placeholder: "Assignment in Booking",
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
