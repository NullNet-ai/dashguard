import { Fragment } from "react";
import { useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import FormInput from "~/components/platform/FormBuilder/FormType/FormInput";
import { FormField, FormItem } from "~/components/ui/form";
import { useEventListener } from "~/hooks/useEventListener";
import BasicFormHeader from "~/components/ui/basic-form-header";
import { Separator } from "~/components/ui/separator";
import { ulid } from "ulid";

interface IPostingDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  options?: {
    appendFormKey?: string;
  };
  params?: {
    id: string;
  };
}

export default function CustomPostingDetails({
  form,
  options,
}: IPostingDetails) {
  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: "postings",
    keyName: "id",
  });

  const addPosting = () => {
    append({
      id: ulid(),
      posting_site: "",
      posting_link: "",
    });
  };

  useEventListener({
    eventKey: options?.appendFormKey,
    listener: addPosting,
  });

  return (
    <FormField
      name="Postings"
      control={form.control}
      render={() => {
        return (
          <FormItem>
            {fields.map((field, index: any) => {
              const prefix = `postings.${index}`;
              return (
                <Fragment key={field.id}>
                  {fields?.length > 1 && (
                    <BasicFormHeader
                      label="Posting"
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
                      name={`${prefix}.posting_site`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormInput
                            fieldConfig={{
                              id: `${prefix}.posting_site`,
                              formType: "input",
                              name: `${prefix}.posting_site`,
                              label: `Posting Site`,
                              placeholder: "Posting Site",
                              required: false,
                            }}
                            formRenderProps={formProps}
                            form={form}
                          />
                        );
                      }}
                    />
                    <FormField
                      name={`${prefix}.posting_link`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormInput
                            fieldConfig={{
                              id: `${prefix}.posting_link`,
                              formType: "input",
                              name: `${prefix}.posting_link`,
                              label: `Posting Link`,
                              placeholder: "Posting Link",
                              required: false,
                            }}
                            formRenderProps={formProps}
                            form={form}
                          />
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
