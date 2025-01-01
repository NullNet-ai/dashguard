import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  type UseFormReturn,
} from "react-hook-form";

import CountryName from "./FieldComponent/Country";
import CityName from "./FieldComponent/City";
import StateName from "./FieldComponent/State";
import PostalName from "./FieldComponent/PostalCode";
import AddressLineOne from "./FieldComponent/AddressLineOne";
import AddressLineTwo from "./FieldComponent/AddressLineTwo";
import { type IField } from "../FormBuilder/types";
import { formatAddress } from "../../../server/utils/addresses";

interface AddressFormProps {
  isLoading: boolean;
  form: UseFormReturn<Record<string, any>, any, undefined>;
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  formKey: string;
}
interface IAddressDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  formKey: string;
  fieldConfig: IField;
}

const AddressDetails = ({ form, formKey,fieldConfig }: IAddressDetails) => {
  const address_details = form.getValues("details");
  const address = formatAddress(address_details);

  useEffect(() => {
    form.setValue("details.address", address);
  }, [address]);

  return (
    <div className="space-y-4 py-7 pt-4">
      <CountryName form={form} formKey={formKey} fieldConfig={fieldConfig} />
      <AddressLineOne form={form} formKey={formKey} fieldConfig={fieldConfig} />
      <AddressLineTwo form={form} formKey={formKey} fieldConfig={fieldConfig}/>
      <div className="flex w-full flex-grow flex-row gap-2">
        <CityName form={form} formKey={formKey} fieldConfig={fieldConfig} />
        <StateName form={form} formKey={formKey} fieldConfig={fieldConfig}/>
        <PostalName form={form} formKey={formKey} fieldConfig={fieldConfig}/>
      </div>
    </div>
  );
};

export default function AddressForm(
  props: React.PropsWithChildren<AddressFormProps>,
) {
  const { isLoading, form, formKey,fieldConfig } = props;

  if (isLoading) {
    return (
      <div className="grid">
        <div className="flex h-52 items-center justify-center">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </div>
    );
  }

  return <AddressDetails form={form} formKey={formKey} fieldConfig={fieldConfig} />;
}
