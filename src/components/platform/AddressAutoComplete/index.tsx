"use client";

import { Fragment, useState } from "react";

import { ControllerFieldState, ControllerRenderProps, type UseFormReturn } from "react-hook-form";
import { AddressAutoCompleteInput } from "./address-autocomplete-input";
import AddressForm from "./address-form";
import { api } from "~/trpc/react";
import { IField } from "../FormBuilder/type";
import CountryToCities from "./countriesToCities.json";
import States from "./states.json";

export interface AddressType {
  address: string;
  latitude: number;
  longitude: number;
  place_id: string;
  street_number: string;
  street: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_code: string;
  postal_code: string;
}

interface AddressAutoCompleteProps {
  dialogTitle: string;
  form: UseFormReturn<Record<string, any>, any, undefined>;
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  formKey: string;
}

export default function AddressAutoComplete(props: AddressAutoCompleteProps) {
  const { form } = props;
  // const googleAutoComplete = api.google.place.useMutation();
  const googleAutoComplete = api.google.getAddressDetails.useMutation();
  const [isLoading, setIsLoading] = useState(false);
  const address = form.getValues("details");
  const handleSelectAddress = async (address: {
    name: string;
    description: string;
    place_id: string;
    id: string;
    provider: string;
  }) => {
    if (!address) return;
    setIsLoading(true);
    const response = await googleAutoComplete.mutateAsync({
      address: address,
    });
    setIsLoading(false);
    [
      "address",
      "address_line_one",
      "address_line_two",
      "latitude",
      "longitude",
      "place_id",
      "street_number",
      "street",
      "region",
      "region_code",
      "country_code",
      "postal_code",
      // "state",
      // "city",
      // "country",
    ].forEach((key) => {
      const data = response.data[key as keyof AddressType];
      form.setValue(`details.${key}`, data);
    });

    const country = response.data.country;
    const state = response.data.state;
    const city = response.data.city;
    const foundCountry = (CountryToCities as Record<string, string[]>)?.[
      country
    ];
    const foundState = States?.find((_state) => _state.name === state);
    const foundCity = foundCountry?.find((_city: string) => city === city);
    form.setValue("details.country", country);
    form.setValue("details.state", foundState ? foundState?.name : "");
    form.setValue("details.city", foundCity ? foundCity : "");

    return response;
  };

  return (
    <Fragment>
      <AddressAutoCompleteInput
        handleSelectAddress={handleSelectAddress}
        form={form}
        formKey={props.formKey}
        fieldConfig={props.fieldConfig}
        formRenderProps={props.formRenderProps}
      />
      {address?.place_id ? (
        <div className="items-center">
          <AddressForm
            isLoading={isLoading}
            form={form}
            formKey={props.formKey}
            fieldConfig={props.fieldConfig}
            formRenderProps={props.formRenderProps}
          />
        </div>
      ) : null}
    </Fragment>
  );
}
