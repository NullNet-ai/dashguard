import { Fragment } from "react";
import { useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem } from "~/components/ui/form";
import BasicFormHeader from "~/components/ui/basic-form-header";
import { Separator } from "~/components/ui/separator";
import FormModule from "~/components/platform/FormBuilder/FormModule";
import { type ISelectOptions } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";

interface IFeedbackDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  selectOptions?: {
    overall_result?: ISelectOptions[];
    rating?: ISelectOptions[];
  };
}

export default function CustomFeedbackForm({
  form,
  selectOptions,
}: IFeedbackDetails) {
  const toast = useToast();
  const { overall_result, rating } = selectOptions || {};

  const feedback = api.bookingParticipant.updateFeedback.useMutation();

  const { fields, remove } = useFieldArray({
    control: form?.control,
    name: "feedbacks",
    keyName: "id",
  });

  const handleSave = (index: number, field: any) => {
    const response = feedback.mutateAsync(field);
  };

  return (
    <FormField
      name="feedbacks"
      control={form.control}
      render={() => {
        return (
          <FormItem>
            {fields.map((field, index: any) => {
              const prefix = `feedbacks.${index}`;
              return (
                <Fragment key={field.id}>
                  <BasicFormHeader
                    label="Feedback"
                    ellipseOptions={[
                      {
                        id: 1,
                        name: "Save",
                        onClick: () => handleSave(index, field),
                      },
                      {
                        id: 1,
                        name: "Remove",
                        onClick: () => remove(index),
                      },
                    ]}
                  />

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <FormModule
                      fields={[
                        {
                          id: `${prefix}.contact`,
                          name: `${prefix}.contact`,
                          label: `Interviewer`,
                          placeholder: `Interviewer`,
                          formType: "input",
                          disabled: true,
                        },
                        {
                          id: `${prefix}.overall_result`,
                          name: `${prefix}.overall_result`,
                          label: `Overall Result`,
                          placeholder: `Overall Result`,
                          formType: "select",
                        },
                        {
                          id: `${prefix}.rating`,
                          name: `${prefix}.rating`,
                          label: `Rating`,
                          placeholder: `Rating`,
                          formType: "select",
                        },
                        {
                          id: `${prefix}.strength`,
                          name: `${prefix}.strength`,
                          label: `Strength`,
                          formType: "textarea",
                          placeholder: "Add your comment here...",
                        },
                        {
                          id: `${prefix}.weakness`,
                          name: `${prefix}.weakness`,
                          label: `Weakness`,
                          formType: "textarea",
                          placeholder: "Add your comment here...",
                        },
                        {
                          id: `${prefix}.red_flag`,
                          name: `${prefix}.red_flag`,
                          label: `Red Flag`,
                          formType: "textarea",
                          placeholder: "Add your comment here...",
                        },
                      ]}
                      form={form}
                      subConfig={{
                        selectOptions: {
                          [`${prefix}.overall_result`]: overall_result || [],
                          [`${prefix}.rating`]: rating || [],
                        },
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
