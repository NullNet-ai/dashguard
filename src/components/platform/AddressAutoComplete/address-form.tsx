import React from "react";
import { Loader2 } from "lucide-react";
import { ControllerFieldState, ControllerRenderProps, type UseFormReturn } from "react-hook-form";

import CountryName from "./FieldComponent/Country";
import CityName from "./FieldComponent/City";
import StateName from "./FieldComponent/State";
import PostalName from "./FieldComponent/PostalCode";
import AddressLineOne from "./FieldComponent/AddressLineOne";
import AddressLineTwo from "./FieldComponent/AddressLineTwo";
import { type IField } from "../FormBuilder/type";

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
}

const AddressDetails = ({ form,formKey }: IAddressDetails) => {
  return (
    <div className="space-y-4 py-7">
      <CountryName form={form} formKey={formKey}/>
      <AddressLineOne form={form} formKey={formKey}/>
      <AddressLineTwo form={form} formKey={formKey}/>
      <div className="flex w-full flex-grow flex-row gap-2">
        <CityName form={form} formKey={formKey}/>
        <StateName form={form} formKey={formKey}/>
        <PostalName form={form} formKey={formKey}/>
      </div>
    </div>
  );
};

export default function AddressForm(
  props: React.PropsWithChildren<AddressFormProps>,
) {
  const { isLoading, form,formKey } = props;

  if (isLoading) {
    return (
      <div className="grid">
        <div className="flex h-52 items-center justify-center">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </div>
    );
  }

  return <AddressDetails form={form} formKey={formKey} />;
}
