import React from "react";
import { Loader2 } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";

import CountryName from "./FieldComponent/Country";
import CityName from "./FieldComponent/City";
import StateName from "./FieldComponent/State";
import PostalName from "./FieldComponent/PostalCode";
import AddressLineOne from "./FieldComponent/AddressLineOne";
import AddressLineTwo from "./FieldComponent/AddressLineTwo";

interface AddressFormProps {
  isLoading: boolean;
  form: UseFormReturn<Record<string, any>, any, undefined>;
}
interface IAddressDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
}

const AddressDetails = ({ form }: IAddressDetails) => {
  return (
    <div className="space-y-4 py-7">
      <CountryName form={form} />
      <AddressLineOne form={form} />
      <AddressLineTwo form={form} />
      <div className="flex w-full flex-grow flex-row gap-2">
        <CityName form={form} />
        <StateName form={form} />
        <PostalName form={form} />
      </div>
    </div>
  );
};

export default function AddressForm(
  props: React.PropsWithChildren<AddressFormProps>,
) {
  const { isLoading, form } = props;

  if (isLoading) {
    return (
      <div className="grid">
        <div className="flex h-52 items-center justify-center">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </div>
    );
  }

  return <AddressDetails form={form} />;
}
