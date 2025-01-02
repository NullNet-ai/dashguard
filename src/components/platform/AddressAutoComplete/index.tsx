"use client";

import { Fragment, useState } from "react";

import type {
  ControllerFieldState,
  ControllerRenderProps,
  UseFormReturn,
} from "react-hook-form";
import { AddressAutoCompleteInput } from "./address-autocomplete-input";
import AddressForm from "./address-form";
import { api } from "~/trpc/react";
import type { IField } from "../FormBuilder/types";
import CountryToCities from "./countriesToCities.json";
import States from "./states.json";
import { deburr } from "lodash";

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
  const { form, fieldConfig, formKey, formRenderProps } = props;
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
    form.setValue("details", {});
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

    const country = deburr(response.data.country);
    const state = deburr(response.data.state);
    const city = deburr(response.data.city);

    const cities = (CountryToCities as Record<string, string[]>)?.[country];
    const countries = Object.keys(CountryToCities ?? {});

    const foundCountry = countries?.find((_country) => _country === country);
    const foundState = States?.find(
      (_state) => _state.name === state && _state.country_name === country,
    );
    const foundCity = cities?.find((_city: string) => _city === city);

    form.setValue("details.country", foundCountry || "");
    form.setValue("details.state", foundState ? foundState?.name : "");
    form.setValue("details.city", foundCity ? foundCity : "");

    return response;
  };

  return (
    <Fragment>
      <div className="flex flex-col">
        <AddressAutoCompleteInput
          handleSelectAddress={handleSelectAddress}
          form={form}
          formKey={formKey}
          fieldConfig={fieldConfig}
          formRenderProps={formRenderProps}
        />
        {address?.place_id ? (
          <div className="items-center">
            <AddressForm
              isLoading={isLoading}
              form={form}
              formKey={formKey}
              fieldConfig={fieldConfig}
              formRenderProps={formRenderProps}
            />
          </div>
        ) : null}
      </div>
    </Fragment>
  );
}
