import { type UseFormReturn } from "react-hook-form";
import { type Option } from "~/components/ui/multi-select";

import type {
  ICheckboxOptions,
  IRadioOptions,
  ISelectOptions,
  IField,
  OptionType,
} from "./type";
import { Fragment } from "react";
import RenderFormType from "./RenderFormType";
import { FormField } from "~/components/ui/form";
import FormAddress from "./FormType/FormAddress";
export default function FormModule({
  fields,
  form,
  subConfig,
}: {
  fields: IField[];
  form: UseFormReturn<Record<string, any>, any, undefined>;
  subConfig?: {
    selectOptions?: Record<string, ISelectOptions[]>;
    multiSelectOptions?: Record<string, Option[]>;
    radioOptions?: Record<string, IRadioOptions[]>;
    checkboxOptions?: Record<string, ICheckboxOptions[]>;
    multiSelectOnSearch?: Record<string, (search: string) => Promise<Option[]>>;
    currencyInputOptions?: Record<string, OptionType[]>;
  };
}) {
  return (
    <Fragment>
      {fields.map((_field, index) => {
        switch (_field.formType) {
          case "address-input":
            // AddressInput is a custom form type that has other fields inside it
            // So we need to wrap each of them in a FormField rather than just rendering the component
            return <FormAddress key={_field.id + index} form={form} />;
          default:
            return (
              <div key={_field.id}>
                <FormField
                  disabled={_field.disabled}
                  key={_field.id}
                  control={form.control}
                  name={_field.name}
                  render={(formProps) =>
                    RenderFormType(_field, formProps, form, {
                      checkboxOptions: subConfig?.checkboxOptions,
                      multiSelectOptions: subConfig?.multiSelectOptions,
                      multiSelectOnSearch: subConfig?.multiSelectOnSearch,
                      radioOptions: subConfig?.radioOptions,
                      selectOptions: subConfig?.selectOptions,
                      currencyInputOptions: subConfig?.currencyInputOptions,
                    })
                  }
                />
              </div>
            );
        }
      })}
    </Fragment>
  );
}
