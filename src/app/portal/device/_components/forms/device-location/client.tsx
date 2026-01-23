'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import {
  type IField,
  type IHandleSubmit,
  type ISelectOptions,
} from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { api } from "~/trpc/react";
import countryCityStateJson from 'countrycitystatejson';

const countryInfos = countryCityStateJson.getCountries() as Array<{
  name?: string;
  shortName: string;
}>;

const addressCountryOptions = countryInfos
  .filter((country) => !!country.name)
  .map((country) => ({
    label: country.name as string,
    value: country.name as string,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const FormSchema = z.object({
  address_city: z.string().min(1, 'City is required'),
  address_state: z.string().min(1, 'State is required'),
  address_country: z.string().min(1, 'Country is required'),
});

export default function DeviceLocation({ params, defaultValues }: IFormProps) {
  console.log("🚀 ~ DeviceLocation ~ defaultValues:", defaultValues)
  const toast = useToast();

  const updateDeviceCategory = api.device.updateDeviceCategory.useMutation();

  const countryNameToShortName = useMemo(() => {
    const map = new Map<string, string>();
    for (const countryInfo of countryInfos) {
      if (countryInfo?.name && countryInfo?.shortName) {
        map.set(countryInfo.name, countryInfo.shortName);
      }
    }
    return map;
  }, []);

  const buildStateOptionsForCountryName = useCallback(
    (countryName: string | undefined | null): ISelectOptions[] => {
      if (!countryName) return [];

      const shortName = countryNameToShortName.get(countryName);
      if (!shortName) return [];

      const states = countryCityStateJson.getStatesByShort(shortName) ?? [];

      return states
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .map((stateName) => ({
          label: stateName,
          value: stateName,
        }));
    },
    [countryNameToShortName],
  );

  const buildCityOptionsForCountryAndState = useCallback(
    (
      countryName: string | undefined | null,
      stateName: string | undefined | null,
    ): ISelectOptions[] => {
      if (!countryName || !stateName) return [];

      const shortName = countryNameToShortName.get(countryName);
      if (!shortName) return [];

      const cities = countryCityStateJson.getCities(shortName, stateName) ?? [];

      return cities
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .map((cityName) => ({
          label: cityName,
          value: cityName,
        }));
    },
    [countryNameToShortName],
  );

  const [addressStateOptions, setAddressStateOptions] = useState<ISelectOptions[]>(
    () => buildStateOptionsForCountryName(defaultValues?.address_country),
  );
  const [isAddressStateDisabled, setIsAddressStateDisabled] = useState<boolean>(
    () => !defaultValues?.address_country,
  );

  const [addressCityOptions, setAddressCityOptions] = useState<ISelectOptions[]>(
    () =>
      buildCityOptionsForCountryAndState(
        defaultValues?.address_country,
        defaultValues?.address_state,
      ),
  );
  const [isAddressCityDisabled, setIsAddressCityDisabled] = useState<boolean>(
    () => !defaultValues?.address_country || !defaultValues?.address_state,
  );
  const lastCountryNameRef = useRef<string | null>(
    defaultValues?.address_country ?? null,
  );
  const lastStateNameRef = useRef<string | null>(
    defaultValues?.address_state ?? null,
  );

  useEffect(() => {
    const countryName = defaultValues?.address_country;
    const stateName = defaultValues?.address_state;

    setIsAddressStateDisabled(!countryName);
    setAddressStateOptions(buildStateOptionsForCountryName(countryName));

    setIsAddressCityDisabled(!countryName || !stateName);
    setAddressCityOptions(buildCityOptionsForCountryAndState(countryName, stateName));
  }, [
    buildCityOptionsForCountryAndState,
    buildStateOptionsForCountryName,
    defaultValues?.address_country,
    defaultValues?.address_state,
  ]);

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      await updateDeviceCategory.mutateAsync({
        id: params.id,
        ...data,
        address_country_code: countryNameToShortName.get(data.address_country),
      });
    } catch (error) {
      toast.error('Failed to update device location');
    }
  };

  const fields = useMemo((): IField[] => {
    return [
      {
        id: 'address_country',
        formType: 'select',
        name: 'address_country',
        label: 'Country',
        description: 'Field Description',
        placeholder: 'Enter value...',
        fieldClassName: '',
        readonly: false,
        required: true,
        selectSearchable: true,
        selectOnChange: (
          countryName: string,
          form?: UseFormReturn<Record<string, any>>,
        ) => {
          const previousCountryName = lastCountryNameRef.current;
          lastCountryNameRef.current = countryName;

          setIsAddressStateDisabled(!countryName);
          setAddressStateOptions(buildStateOptionsForCountryName(countryName));

          const currentStateName =
            form?.getValues('address_state') ?? lastStateNameRef.current ?? '';

          const shouldResetDependentFields =
            !!form && previousCountryName !== countryName;

          if (shouldResetDependentFields) {
            lastStateNameRef.current = null;
            form.setValue('address_state', '', {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
            form.setValue('address_city', '', {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
            setIsAddressCityDisabled(true);
            setAddressCityOptions([]);
            return;
          }

          setIsAddressCityDisabled(!countryName || !currentStateName);
          setAddressCityOptions(
            buildCityOptionsForCountryAndState(countryName, currentStateName),
          );
        },
        fieldStyle: {
          gridColumn: '1 / span 1',
          gridRow: '1 / span 1',
        },
      },
      {
        id: 'address_state',
        formType: 'select',
        name: 'address_state',
        label: 'State',
        description: 'Field Description',
        placeholder: 'Enter value...',
        fieldClassName: '',
        readonly: false,
        required: true,
        disabled: isAddressStateDisabled,
        selectSearchable: true,
        selectOnChange: (
          stateName: string,
          form?: UseFormReturn<Record<string, any>>,
        ) => {
          const previousStateName = lastStateNameRef.current;
          lastStateNameRef.current = stateName;

          const currentCountryName =
            form?.getValues('address_country') ??
            lastCountryNameRef.current ??
            '';

          setIsAddressCityDisabled(!currentCountryName || !stateName);
          setAddressCityOptions(
            buildCityOptionsForCountryAndState(currentCountryName, stateName),
          );

          if (form && previousStateName !== stateName) {
            form.setValue('address_city', '', {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
          }
        },
        fieldStyle: {
          gridColumn: '2 / span 1',
          gridRow: '1 / span 1',
        },
      },
      {
        id: 'address_city',
        formType: 'select',
        name: 'address_city',
        label: 'City',
        description: 'Field Description',
        placeholder: 'Enter value...',
        fieldClassName: '',
        readonly: false,
        required: true,
        disabled: isAddressCityDisabled,
        selectSearchable: true,
        fieldStyle: {
          gridColumn: '1 / span 1',
          gridRow: '2 / span 1',
        },
      },
    ];
  }, [
    buildCityOptionsForCountryAndState,
    buildStateOptionsForCountryName,
    isAddressCityDisabled,
    isAddressStateDisabled,
  ]);

  return (
    <FormBuilder
      customDesign={{
        formClassName: '!grid-cols-2',
      }}
      myParent={params.shell_type}
      formProps={params}
      formLabel="Device Location"
      handleSubmit={handleSave}
      formKey="deviceLocationForm"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={fields}
      checkboxOptions={{}}
      radioOptions={{
      }}
      selectOptions={{
        address_country: addressCountryOptions,
        address_state: addressStateOptions,
        address_city: addressCityOptions,
      }}
      multiSelectOptions={{}}
    />
  );
}
