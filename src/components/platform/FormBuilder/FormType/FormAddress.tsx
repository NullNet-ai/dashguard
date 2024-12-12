/* eslint-disable @typescript-eslint/no-explicit-any */
import { type UseFormReturn } from "react-hook-form";
import AddressAutoComplete from "~/components/platform/AddressAutoComplete";

interface IProps {
  form: UseFormReturn<Record<string, any>, any, undefined>;
}

export default function FormAddress({ form }: IProps) {
  return <AddressAutoComplete dialogTitle="Enter Address" form={form} />;
}
