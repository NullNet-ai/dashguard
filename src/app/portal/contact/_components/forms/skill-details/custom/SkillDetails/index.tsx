import { Fragment } from "react";
import { useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import FormInput from "~/components/platform/FormBuilder/FormType/FormInput";
import FormRadio from "~/components/platform/FormBuilder/FormType/FormRadio";
import FormSelect from "~/components/platform/FormBuilder/FormType/FormSelect";
import { FormField, FormItem } from "~/components/ui/form";
import { useEventListener } from "~/hooks/useEventListener";
import type { IDropdown } from "../../types";
import BasicFormHeader from "~/components/ui/basic-form-header";
import { Separator } from "~/components/ui/separator";
import { ulid } from "ulid";

interface ISkillDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  options?: {
    appendFormKey?: string;
  };
  selectOptions: {
    proficiency_options?: IDropdown[];
    years_of_experience_options?: IDropdown[];
    country_id?: IDropdown[];
    degree_level_id?: IDropdown[];
    notice_period?: IDropdown[];
  };
}

export default function CustomSkillDetails({
  form,
  options,
  selectOptions,
}: ISkillDetails) {
  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: "skills",
    keyName: "id",
  });

  const { proficiency_options, years_of_experience_options } = selectOptions;

  const addSkill = () => {
    append({
      id: ulid(),
      proficiency: "",
      skill: "",
      years_of_experience: "",
    });
  };

  useEventListener({
    eventKey: options?.appendFormKey,
    listener: addSkill,
  });

  return (
    <FormField
      name="Skills"
      control={form.control}
      render={() => {
        return (
          <FormItem>
            {fields.map((field, index: any) => {
              const prefix = `skills.${index}`;
              return (
                <Fragment key={field.id}>
                  {fields?.length > 1 && (
                    <BasicFormHeader
                      label="Skills"
                      ellipseOptions={[
                        {
                          id: 1,
                          name: "Remove",
                          onClick: () => remove(index),
                        },
                      ]}
                    />
                  )}
                  <FormField
                    name={`${prefix}.proficiency`}
                    control={control}
                    render={(formProps) => {
                      return (
                        <FormRadio
                          fieldConfig={{
                            id: `${prefix}.proficiency`,
                            formType: "radio",
                            name: `${prefix}.proficiency`,
                            label: "Proficiency",
                          }}
                          formRenderProps={formProps}
                          form={form}
                          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                          radioOptions={{
                            [`${prefix}.proficiency`]: proficiency_options,
                          }}
                        />
                      );
                    }}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      name={`${prefix}.skill`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormInput
                            fieldConfig={{
                              id: `${prefix}.skill`,
                              formType: "input",
                              name: `${prefix}.skill`,
                              label: `Skill`,
                              required: true,
                            }}
                            formRenderProps={formProps}
                            form={form}
                          />
                        );
                      }}
                    />
                    <FormField
                      name={`${prefix}.years_of_experience`}
                      control={control}
                      render={(formProps) => {
                        return (
                          <FormSelect
                            fieldConfig={{
                              id: `${prefix}.years_of_experience`,
                              formType: "select",
                              name: `${prefix}.years_of_experience`,
                              label: "Years of Experience",
                              required: true,
                            }}
                            formRenderProps={formProps}
                            form={form}
                            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                            selectOptions={{
                              [`${prefix}.years_of_experience`]:
                                years_of_experience_options,
                            }}
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
