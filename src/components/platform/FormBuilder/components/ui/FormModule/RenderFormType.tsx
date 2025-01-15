/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type ReactElement } from "react";
import {
  Form,
  type ControllerFieldState,
  type ControllerRenderProps,
  type UseFormReturn,
} from "react-hook-form";

import { Input } from "~/components/ui/input";

import FormAddress from "../../../FormType/FormAddress";
import FormCheckbox from "../../../FormType/FormCheckbox";
import FormDatePicker from "../../../FormType/FormDate";
import FormDateRange from "../../../FormType/FormDateRange";
import FormEmailInput from "../../../FormType/FormEmailInput";
import FormInput from "../../../FormType/FormInput";
import FormTextInputs from "../../../FormType/FormInputs";
import FormLabelValueInput from "../../../FormType/FormLabelValueInput";
import FormMultiSelect from "../../../FormType/FormMultiSelect";
import FormPhoneInput from "../../../FormType/FormPhoneInput";
import FormRadio from "../../../FormType/FormRadio";
import FormSelect from "../../../FormType/FormSelect";
import FormTextArea from "../../../FormType/FormTextArea";
import {
  type ICheckboxOptions,
  type IRadioOptions,
  type ISelectOptions,
  type IField,
} from "../../../types";
import FormFileUpload from "../../../FormType/FormFileUpload";
import FormSlider from "../../../FormType/FormSlider";
import { type Option } from "~/components/ui/multi-select";
import FormRichTextEditor from "../../../FormType/FormRichTextEditor";
import FormNumberInput from "../../../FormType/FormNumberInput";
import FormPassword from "../../../FormType/FormPassword";
import FormCurrencyInput from "../../../FormType/FormCurrencyInput";
import FormSmartDate from "../../../FormType/FormSmartDate";
import FormInputGrid from "../../../FormType/FormInputGrid";
import React from "react";
import FormTimePicker from "../../../FormType/FormTimePicker";
import FormDraggable from "../../../FormType/FormDraggable";
import FormMultiField from "../../../FormType/FormMultiField";
import FormSwitch from "../../../FormType/FormSwitch";

export default function RenderFormType(
  fieldConfig: IField,
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  },
  form: UseFormReturn<Record<string, any>, any, undefined>,
  formKey: string,
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
          formKey={formKey}
        />
      );
    case "input-grid":
      return (
        <FormInputGrid
          formKey={formKey}
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
          formKey={formKey}
        />
      );
    case "select":
      return (
        <FormSelect
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          selectOptions={subConfig?.selectOptions}
          form={form}
          formKey={formKey}
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
          formKey={formKey}
        />
      );
    case "radio":
      return (
        <FormRadio
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          radioOptions={subConfig?.radioOptions}
          form={form}
          formKey={formKey}
        />
      );
    case "checkbox":
      return (
        <FormCheckbox
          form={form}
          formRenderProps={formRenderProps}
          checkboxOptions={subConfig?.checkboxOptions}
          fieldConfig={fieldConfig}
          formKey={formKey}
        />
      );
    case "date":
      return (
        <FormDatePicker
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "date-range":
      return (
        <FormDateRange
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "smart-date":
      return (
        <FormSmartDate
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "phone-input":
      return (
        <FormPhoneInput
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "email-input":
      return (
        <FormEmailInput
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "inputs":
      return (
        <FormTextInputs
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "input-label-value":
      return (
        <FormLabelValueInput
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "address-input":
      return (
        <FormAddress
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "file":
      return (
        <FormFileUpload
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "slider":
      return (
        <FormSlider
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "rich-text-editor":
      return (
        <FormRichTextEditor
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "number-input":
      return (
        <FormNumberInput
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "password":
      return (
        <FormPassword
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "currency-input":
      return (
        <FormCurrencyInput
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
          currencyInputOptions={subConfig?.currencyInputOptions}
        />
      );
    case "time-picker":
      return (
        <FormTimePicker
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "draggable":
      return (
        <FormDraggable
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "multi-field":
      return (
        <FormMultiField
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    case "switch":
      return (
        <FormSwitch
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
          form={form}
          formKey={formKey}
        />
      );
    default:
      return <Input />;
  }
}
