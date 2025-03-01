/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type UseFormReturn,
} from "react-hook-form";
import AddressAutoComplete from "~/components/platform/AddressAutoComplete";

interface IProps {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  fieldConfig?: any;
  formKey: string;
  formRenderProps?: any;
}

export default function FormAddress({
  form,
  fieldConfig,
  formKey,
  formRenderProps,
}: IProps) {
  return (
    <AddressAutoComplete
      dialogTitle="Enter Address"
      form={form}
      fieldConfig={fieldConfig}
      formKey={formKey}
      formRenderProps={formRenderProps}
    />
  );
}
