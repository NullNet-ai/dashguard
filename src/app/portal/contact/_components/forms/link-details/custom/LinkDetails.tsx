import { ulid } from "ulid";
import { Fragment } from "react";
import { useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem } from "~/components/ui/form";
import { useEventListener } from "~/hooks/useEventListener";
import BasicFormHeader from "~/components/ui/basic-form-header";
import { Separator } from "~/components/ui/separator";
import FormModule from "../../../../../../../components/platform/FormBuilder/FormModule";

interface ILinkDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  options?: {
    appendFormKey?: string;
  };
}

export default function CustomLinkDetails({ form, options }: ILinkDetails) {
  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: "links",
    keyName: "id",
  });

  const addLink = () => {
    append({
      id: ulid(),
      title: "",
      link: "",
    });
  };

  useEventListener({
    eventKey: options?.appendFormKey,
    listener: addLink,
  });

  return (
    <FormField
      name="links"
      control={form.control}
      render={() => {
        return (
          <FormItem>
            {fields.map((field, index: any) => {
              const prefix = `links.${index}`;
              return (
                <Fragment key={field.id}>
                  {fields?.length > 1 && (
                    <BasicFormHeader
                      label="Links"
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
                    <FormModule
                      fields={[
                        {
                          id: `${prefix}.title`,
                          name: `${prefix}.title`,
                          label: `Title`,
                          formType: "input",
                          placeholder: "Title",
                          required: true,
                        },
                        {
                          id: `${prefix}.link`,
                          name: `${prefix}.link`,
                          label: `Link`,
                          formType: "input",
                          placeholder: "Link",
                          required: true,
                        },
                      ]}
                      form={form}
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
