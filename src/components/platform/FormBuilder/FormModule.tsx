import { type UseFormReturn } from "react-hook-form";
import { type Option } from "~/components/ui/multi-select";

import type {
  ICheckboxOptions,
  IRadioOptions,
  ISelectOptions,
  OptionType,
  IFilterGridConfig,
} from "./type";
import { Fragment } from "react";
import RenderFormType from "./RenderFormType";
import { FormField } from "~/components/ui/form";
import FormAddress from "./FormType/FormAddress";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { IField, TFormSchema } from "../EnhancedFormBuilder/types";
import FormInputGridWrapper from "../EnhancedFormBuilder/components/custom/FormFilter/FormInputGridWrapper";
export default function FormModule({
  fields,
  form,
  subConfig,
  formKey,
  gridConfig,
  onSelectFieldFilterGrid,
  formSchema
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
  formKey: string;
  gridConfig?: IFilterGridConfig;
  formSchema: TFormSchema;
  onSelectFieldFilterGrid?: (data: z.infer<TFormSchema>) => Promise<void>;
}) {
  return (
    <Fragment>
      {fields.map((_field, index) => {
        switch (_field.formType) {
          case "address-input":
            // AddressInput is a custom form type that has other fields inside it
            // So we need to wrap each of them in a FormField rather than just rendering the component
            return (
              <FormAddress key={_field.id + index} form={form} formKey={formKey} />
            );
          default:
            return (
              <div key={_field.id}>
                <FormField
                  disabled={_field.disabled}
                  key={_field.id}
                  control={form.control}
                  name={_field.name}
                  render={(formProps) =>
                    _field.withGridFilter ? (
                      <FormInputGridWrapper
                        fieldConfig={_field!}
                        gridConfig={gridConfig!}
                        form={form}
                        formSchema={formSchema}
                        onSelectFieldFilterGrid={onSelectFieldFilterGrid}
                      >
                        {RenderFormType(_field, formProps, form, formKey, {
                          checkboxOptions: subConfig?.checkboxOptions,
                          multiSelectOptions: subConfig?.multiSelectOptions,
                          multiSelectOnSearch: subConfig?.multiSelectOnSearch,
                          radioOptions: subConfig?.radioOptions,
                          selectOptions: subConfig?.selectOptions,
                          currencyInputOptions: subConfig?.currencyInputOptions,
                        })}
                      </FormInputGridWrapper>
                    ) : (
                      RenderFormType(_field, formProps, form, formKey, {
                        checkboxOptions: subConfig?.checkboxOptions,
                        multiSelectOptions: subConfig?.multiSelectOptions,
                        multiSelectOnSearch: subConfig?.multiSelectOnSearch,
                        radioOptions: subConfig?.radioOptions,
                        selectOptions: subConfig?.selectOptions,
                        currencyInputOptions: subConfig?.currencyInputOptions,
                      })
                    )
                  }
                />
              </div>
            );
        }
      })}
    </Fragment>
  );
}
