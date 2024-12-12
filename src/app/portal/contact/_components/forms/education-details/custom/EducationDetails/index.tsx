import { Fragment, useRef } from "react";
import { useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem } from "~/components/ui/form";
import { useEventListener } from "~/hooks/useEventListener";
import type { IDropdown } from "../../types";
import BasicFormHeader from "~/components/ui/basic-form-header";
import { Separator } from "~/components/ui/separator";
import { ulid } from "ulid";
import FormModule from "~/components/platform/FormBuilder/FormModule";

interface IEducationDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  options?: {
    appendFormKey?: string;
  };
  params?: {
    id: string;
  };
  selectOptions: {
    proficiency_options?: IDropdown[];
    years_of_experience_options?: IDropdown[];
    country_id?: IDropdown[];
    degree_level_id?: IDropdown[];
    notice_period?: IDropdown[];
  };
}

export default function CustomEducationDetails({
  form,
  options,
  selectOptions,
  params,
}: IEducationDetails) {
  const todayRef = useRef(new Date());

  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: "educations",
    keyName: "id",
  });

  const { country_id, degree_level_id } = selectOptions;

  const addEducation = () => {
    append({
      id: ulid(),
      institution: "",
      country_id: "",
      degree: "",
      degree_level_id: "",
      completed_on: new Date().getFullYear().toString(),
      note: "",
      contact_id: params?.id,
    });
  };

  useEventListener({
    eventKey: options?.appendFormKey,
    listener: addEducation,
  });

  return (
    <FormField
      name="Educations"
      control={form.control}
      render={() => {
        return (
          <FormItem>
            {fields.map((field, index: any) => {
              const prefix = `educations.${index}`;
              return (
                <Fragment key={field.id}>
                  {fields?.length > 1 && (
                    <BasicFormHeader
                      label="Education"
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
                          id: `${prefix}.institution`,
                          name: `${prefix}.institution`,
                          label: `Institution`,
                          formType: "input",
                          placeholder: "Institution Name",
                          required: true,
                        },
                        {
                          id: `${prefix}.country_id`,
                          name: `${prefix}.country_id`,
                          label: `Country`,
                          formType: "select",
                          placeholder: "Country Name",
                          required: true,
                        },
                        {
                          id: `${prefix}.degree`,
                          name: `${prefix}.degree`,
                          label: `Degree`,
                          formType: "input",
                          placeholder: "Degree Title",
                          required: true,
                        },
                        {
                          id: `${prefix}.degree_level_id`,
                          name: `${prefix}.degree_level_id`,
                          label: `Degree Level`,
                          formType: "select",
                          placeholder: "Degree Level",
                          required: true,
                        },
                        {
                          id: `${prefix}.completed_on`,
                          name: `${prefix}.completed_on`,
                          label: `Completed On`,
                          formType: "date",
                          placeholder: "Select Completion Date",
                          dateGranularity: "year",
                          dateMaxDate: todayRef.current,
                          dateMinDate: new Date("1900-01-01"),
                          required: true,
                        },
                        {
                          id: `${prefix}.note`,
                          name: `${prefix}.note`,
                          label: `Notes`,
                          formType: "textarea",
                          placeholder: "Add your comment here...",
                        },
                      ]}
                      form={form}
                      subConfig={{
                        selectOptions: {
                          [`${prefix}.country_id`]: country_id || [],
                          [`${prefix}.degree_level_id`]: degree_level_id || [],
                        },
                      }}
                    />
                    {/* <FormField
                      name={`${prefix}.institution`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormInput
                            fieldConfig={{
                              id: `${prefix}.institution`,
                              formType: "input",
                              name: `${prefix}.institution`,
                              label: `Institution`,
                              placeholder: "Institution Name",
                              required: true,
                            }}
                            formRenderProps={formProps}
                            form={form}
                          />
                        );
                      }}
                    />
                    <FormField
                      name={`${prefix}.country_id`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormSelect
                            fieldConfig={{
                              id: `${prefix}.country_id`,
                              formType: "select",
                              name: `${prefix}.country_id`,
                              label: "Country",
                              placeholder: "Country Name",
                              required: true,
                            }}
                            formRenderProps={formProps}
                            form={form}
                            selectOptions={{
                              [`${prefix}.country_id`]: country_id || [],
                            }}
                          />
                        );
                      }}
                    />
                    <FormField
                      name={`${prefix}.degree`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormInput
                            fieldConfig={{
                              id: `${prefix}.degree`,
                              formType: "input",
                              name: `${prefix}.degree`,
                              label: `Degree`,
                              placeholder: "Degree Title",
                              required: true,
                            }}
                            formRenderProps={formProps}
                            form={form}
                          />
                        );
                      }}
                    />
                    <FormField
                      name={`${prefix}.degree_level_id`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormSelect
                            fieldConfig={{
                              id: `${prefix}.degree_level_id`,
                              formType: "select",
                              name: `${prefix}.degree_level_id`,
                              label: "Degree Level",
                              placeholder: "Degree Level",
                              required: true,
                            }}
                            formRenderProps={formProps}
                            form={form}
                            selectOptions={{
                              [`${prefix}.degree_level_id`]:
                                degree_level_id || [],
                            }}
                          />
                        );
                      }}
                    />
                    <FormField
                      name={`${prefix}.completed_on`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormDatePicker
                            fieldConfig={{
                              id: `${prefix}.completed_on`,
                              formType: "date",
                              label: "Completed On",
                              placeholder: "Select Completion Date",
                              required: true,
                              dateGranularity: "year",
                              dateMaxDate: new Date(),
                              ...formProps?.field,
                            }}
                            formRenderProps={formProps}
                            form={form}
                          />
                        );
                      }}
                    />
                    <FormField
                      name={`${prefix}.note`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormTextArea
                            fieldConfig={{
                              id: `${prefix}.note`,
                              formType: "textarea",
                              name: `${prefix}.note`,
                              label: `Notes`,
                              placeholder: "Add your comment here...",
                              required: false,
                            }}
                            formRenderProps={formProps}
                            form={form}
                          />
                        );
                      }}
                    /> */}
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
