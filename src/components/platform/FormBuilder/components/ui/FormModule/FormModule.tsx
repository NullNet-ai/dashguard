import { Field, type UseFormReturn } from "react-hook-form";
import { type Option } from "~/components/ui/multi-select";

import type {
  ICheckboxOptions,
  IRadioOptions,
  ISelectOptions,
  OptionType,
  IFilterGridConfig,
} from "../../../types";
import { Fragment, useContext } from "react";
import RenderFormType from "./RenderFormType";
import { FormField } from "~/components/ui/form";
import FormAddress from "../../../FormType/FormAddress";
import { type z } from "zod";
import { type IField, type TFormSchema } from "../../../types";
import FormInputGridWrapper from "../../custom/FormFilter/FormInputGridWrapper";
import { WizardContext } from "../../../../Wizard/Provider";
import { formatFormTestID } from "~/lib/utils";

export default function FormModule({
  fields,
  form,
  subConfig,
  formKey,
  gridConfig,
  onSelectFieldFilterGrid,
  formSchema,
  myParent,
  fieldConfig,
}: {
  fields: IField[];
  form: UseFormReturn<Record<string, any>, any, undefined>;
  subConfig?: {
    selectOptions?: Record<string, ISelectOptions[]>;
    multiSelectOptions?: Record<string, Option[]>;
    radioOptions?: Record<string, IRadioOptions[]>;
    checkboxOptions?: Record<string, ICheckboxOptions[]>;
    multiSelectOnSearch?: Record<string, (search: string) => Promise<Option[]>>;
    currencyInputOptions?: Record<string, Option[]>;
  };
  fieldConfig?: Field;
  formKey: string;
  gridConfig?: IFilterGridConfig;
  formSchema: TFormSchema;
  onSelectFieldFilterGrid?: (data: z.infer<TFormSchema>) => Promise<void>;
  myParent?: "record" | "wizard";
}) {
  const { state } = useContext(WizardContext);
  const { entityName } = state ?? {};
  const formattedFormKey = formatFormTestID(
    (entityName ?? "no-entity") +
      " " +
      (myParent ?? "no-parent") +
      " " +
      formKey,
  );
  return (
    <Fragment>
      {fields.map((_field, index) => {
        switch (_field.formType) {
          case "address-input":
            // AddressInput is a custom form type that has other fields inside it
            // So we need to wrap each of them in a FormField rather than just rendering the component
            return (
              <FormAddress
                key={_field.id + index}
                form={form}
                formKey={formattedFormKey}
                fieldConfig={fieldConfig || _field}
              />
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
