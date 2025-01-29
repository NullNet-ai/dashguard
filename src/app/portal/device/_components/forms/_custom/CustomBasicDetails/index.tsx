import { Fragment, useEffect, useMemo, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { type IDropdown } from "~/app/portal/contact/_components/forms/category-details/types";
import FormSelect from "~/components/platform/FormBuilder/FormType/FormSelect";
import { FormField, FormItem } from "~/components/ui/form";
import countriesToCities from "~/components/platform/AddressAutoComplete/countriesToCities.json";
import {
  countryList,
  getStates,
} from "~/components/platform/AddressAutoComplete/countryStates";
import FormInput from "~/components/platform/FormBuilder/FormType/FormInput";

interface BasicDetails {
  defaultValues?: Partial<{
    model: string;
    grouping: string;
    country: string;
    city: string;
    state: string;
    id: string;
  }>;
  form: UseFormReturn<Record<string, any>, any, undefined>;
  options?: {
    appendFormKey?: string;
  };
  selectOptions: {
    model: IDropdown[];
    grouping: IDropdown[];
  };
}
const transformDropdown = (data: string[]) =>
  data?.map((item) => ({ value: item, label: item }));

export default function CustomBasicDetails({
  form,
  selectOptions,
}: BasicDetails) {
  const { control, watch } = form;
  const { model, grouping } = selectOptions;

  const [city_options, setCityOptions] = useState<IDropdown[]>([]);

  const [state_options, setStateOptions] = useState<IDropdown[]>([]);

  const country_options = useMemo(() => {
    return countryList.map((country: string) => ({
      value: country,
      label: country,
    }));
  }, []);

  const selected_country = watch("country") as "China";

  useEffect(() => {
    if (!selected_country) return;
    const cities = countriesToCities?.[selected_country] as string[];
    const city_options = transformDropdown(cities);
    setCityOptions(city_options);

    const states = getStates(selected_country) as string[];
    const state_options = transformDropdown(states);
    setStateOptions(state_options);
  }, [selected_country]);

  return (
    <FormField
      name="Basic Details"
      control={form.control}
      render={() => {
        return (
          <FormItem>
            <Fragment>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <FormField
                  name={`model`}
                  control={control}
                  render={(formProps) => {
                    return (
                      <FormSelect
                        formKey="device_model"
                        fieldConfig={{
                          id: `model`,
                          formType: "select",
                          name: `model`,
                          label: "Model",
                          required: true,
                        }}
                        formRenderProps={formProps}
                        form={form}
                        selectOptions={{
                          model: model,
                        }}
                      />
                    );
                  }}
                />
                <FormField
                  name={`instance_name`}
                  control={control}
                  render={(formProps) => {
                    return (
                      <FormInput
                        formKey="device_instance_name"
                        fieldConfig={{
                          id: `instance_name`,
                          formType: "input",
                          name: `instance_name`,
                          label: "Instance Name",
                          required: true,
                        }}
                        formRenderProps={formProps}
                        form={form}
                      />
                    );
                  }}
                />

                <FormField
                  name={`grouping`}
                  control={control}
                  render={(formProps) => {
                    return (
                      <FormSelect
                        formKey="device_grouping"
                        fieldConfig={{
                          id: `grouping`,
                          formType: "select",
                          name: `grouping`,
                          label: "Grouping",
                        }}
                        formRenderProps={formProps}
                        form={form}
                        selectOptions={{
                          grouping: grouping,
                        }}
                      />
                    );
                  }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                <FormField
                  name={`country`}
                  control={control}
                  render={(formProps) => {
                    return (
                      <FormSelect
                        formKey="device_country"
                        fieldConfig={{
                          id: `country`,
                          formType: "select",
                          name: `country`,
                          label: `Country`,
                        }}
                        formRenderProps={{
                          ...formProps,

                          field: {
                            ...formProps.field,
                            onChange: (value) => {
                              form.setValue("country", value, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                              form.setValue("city", "", {
                                shouldDirty: true,
                              });
                              form.setValue("state", "", {
                                shouldDirty: true,
                              });
                            },
                          },
                        }}
                        form={form}
                        selectOptions={{
                          country: country_options,
                        }}
                      />
                    );
                  }}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  name={`state`}
                  control={control}
                  render={(formProps) => {
                    return (
                      <FormSelect
                        formKey="device_state"
                        fieldConfig={{
                          id: `state`,
                          formType: "select",
                          name: `state`,
                          label: `State/Province`,
                        }}
                        formRenderProps={formProps}
                        form={form}
                        selectOptions={{
                          state: state_options,
                        }}
                      />
                    );
                  }}
                />

                <FormField
                  name={`city`}
                  control={control}
                  render={(formProps) => {
                    return (
                      <FormSelect
                        formKey="device_city"
                        fieldConfig={{
                          id: `city`,
                          formType: "select",
                          name: `city`,
                          label: `City`,
                        }}
                        formRenderProps={formProps}
                        form={form}
                        selectOptions={{
                          city: city_options,
                        }}
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
