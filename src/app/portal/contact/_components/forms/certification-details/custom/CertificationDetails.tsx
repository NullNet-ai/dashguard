import { Fragment } from "react";
import { useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import FormInput from "~/components/platform/FormBuilder/FormType/FormInput";
import { FormField, FormItem } from "~/components/ui/form";
import { useEventListener } from "~/hooks/useEventListener";
import BasicFormHeader from "~/components/ui/basic-form-header";
import FormDatePicker from "~/components/platform/FormBuilder/FormType/FormDate";
import { ulid } from "ulid";
import { Separator } from "~/components/ui/separator";

const empty_cert_val = {
  certificate_name: "",
  institution: "",
  issued_on_date: "",
  expiration_date: "",
};

interface ICertDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  options?: {
    appendFormKey?: string;
  };
}

export default function CustomCertificationDetails({
  form,
  options,
}: ICertDetails) {
  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: "certifications",
    keyName: "id",
  });

  const addCert = () => {
    append({
      id: ulid(),
      ...empty_cert_val,
    });
  };

  useEventListener({
    eventKey: options?.appendFormKey,
    listener: addCert,
  });

  return (
    <FormField
      name="Certifications"
      control={form.control}
      render={() => {
        return (
          <FormItem>
            {fields.map((field, index: any) => {
              const prefix = `certifications.${index}`;
              const issued_on_date = form.watch(`${prefix}.issued_on_date`);

              return (
                <Fragment key={field.id}>
                  {fields?.length > 1 && (
                    <BasicFormHeader
                      label="Certifications"
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
                      name={`${prefix}.certificate_name`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormInput
                            fieldConfig={{
                              id: `${prefix}.certificate_name`,
                              formType: "radio",
                              name: `${prefix}.certificate_name`,
                              label: "Certificate",
                              placeholder: "Certificate Title",
                            }}
                            formRenderProps={formProps}
                            form={form}
                          />
                        );
                      }}
                    />
                    <FormField
                      name={`${prefix}.institution`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormInput
                            fieldConfig={{
                              id: `${prefix}.institution`,
                              formType: "radio",
                              name: `${prefix}.institution`,
                              label: "Institution",
                              placeholder: "Institution Name",
                            }}
                            formRenderProps={formProps}
                            form={form}
                          />
                        );
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      name={`${prefix}.issued_on_date`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormDatePicker
                            fieldConfig={{
                              id: `${prefix}.issued_on_date`,
                              name: `${prefix}.issued_on_date`,
                              label: `Issued On`,
                              placeholder: "Select Issue Date",
                              dateMaxDate: new Date(),
                            }}
                            formRenderProps={formProps}
                            form={form}
                          />
                        );
                      }}
                    />
                    <FormField
                      name={`${prefix}.expiration_date`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormDatePicker
                            fieldConfig={{
                              id: `${prefix}.expiration_date`,
                              name: `${prefix}.expiration_date`,
                              label: `Valid Till`,
                              placeholder: "Select Expiration Date",
                              dateMinDate: new Date(issued_on_date),
                            }}
                            formRenderProps={formProps}
                            form={form}
                          />
                        );
                      }}
                    />
                  </div>
                  <Separator dashed />
                </Fragment>
              );
            })}
          </FormItem>
        );
      }}
    />
  );
}
