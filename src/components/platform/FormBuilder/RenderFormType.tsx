/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type ReactElement } from "react";
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  type UseFormReturn,
} from "react-hook-form";

import { Input } from "~/components/ui/input";

import FormAddress from "./FormType/FormAddress";
import FormCheckbox from "./FormType/FormCheckbox";
import FormDatePicker from "./FormType/FormDate";
import FormDateRange from "./FormType/FormDateRange";
import FormEmailInput from "./FormType/FormEmailInput";
import FormInput from "./FormType/FormInput";
import FormTextInputs from "./FormType/FormInputs";
import FormLabelValueInput from "./FormType/FormLabelValueInput";
import FormMultiSelect from "./FormType/FormMultiSelect";
import FormPhoneInput from "./FormType/FormPhoneInput";
import FormRadio from "./FormType/FormRadio";
import FormSelect from "./FormType/FormSelect";
import FormTextArea from "./FormType/FormTextArea";
import {
  type ICheckboxOptions,
  type IRadioOptions,
  type ISelectOptions,
  type IField,
} from "./type";
import FormFileUpload from "./FormType/FormFileUpload";
import FormSlider from "./FormType/FormSlider";
import { type Option } from "~/components/ui/multi-select";
import FormRichTextEditor from "./FormType/FormRichTextEditor";
import FormNumberInput from "./FormType/FormNumberInput";
import FormPassword from "./FormType/FormPassword";
import FormCurrencyInput from "./FormType/FormCurrencyInput";
import FormSmartDate from "./FormType/FormSmartDate";
import FormInputGrid from "./FormType/FormInputGrid";

export default function RenderFormType(
  fieldConfig: IField,
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  },
  form: UseFormReturn<Record<string, any>, any, undefined>,
  subConfig: {
    selectOptions?: Record<string, ISelectOptions[]>;
    multiSelectOptions?: Record<string, Option[]>;
    radioOptions?: Record<string, IRadioOptions[]>;
    checkboxOptions?: Record<string, ICheckboxOptions[]>;
    currencyInputOptions?: Record<string, Option[]>;
    multiSelectOnSearch?: Record<string, (search: string) => Promise<Option[]>>;
  },
): ReactElement {
  switch (fieldConfig?.formType) {
    case "input":
      return (
        <FormInput
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
        />
      );
    case "input-grid":
      return (
        <FormInputGrid
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
        />
      );
    case "textarea":
      return (
        <FormTextArea
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
        />
      );
    case "select":
      return (
        <FormSelect
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          selectOptions={subConfig?.selectOptions}
          form={form}
        />
      );
    case "multi-select":
      return (
        <FormMultiSelect
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          multiselectOptions={subConfig?.multiSelectOptions}
          multiSelectOnSearch={subConfig?.multiSelectOnSearch}
          form={form}
        />
      );
    case "radio":
      return (
        <FormRadio
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          radioOptions={subConfig?.radioOptions}
          form={form}
        />
      );
    case "checkbox":
      return (
        <FormCheckbox
          form={form}
          checkboxOptions={subConfig?.checkboxOptions}
          fieldConfig={fieldConfig}
        />
      );
    case "date":
      return (
        <FormDatePicker
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
        />
      );
    case "date-range":
      return (
        <FormDateRange
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
        />
      );
    case "smart-date":
      return (
        <FormSmartDate
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
        />
      );
    case "phone-input":
      return (
        <FormPhoneInput
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
        />
      );
    case "email-input":
      return (
        <FormEmailInput
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
        />
      );
    case "inputs":
      return (
        <FormTextInputs
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
        />
      );
    case "input-label-value":
      return (
        <FormLabelValueInput
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
        />
      );
    case "file":
      return (
        <FormFileUpload
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
        />
      );
    case "slider":
      return (
        <FormSlider
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
        />
      );
    case "rich-text-editor":
      return (
        <FormRichTextEditor
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
        />
      );
    case "number-input":
      return (
        <FormNumberInput
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
        />
      );
    case "password":
      return (
        <FormPassword
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
        />
      );
    case "currency-input":
      return (
        <FormCurrencyInput
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          currencyInputOptions={subConfig?.currencyInputOptions}
        />
      );
    default:
      return <Input />;
  }
}
