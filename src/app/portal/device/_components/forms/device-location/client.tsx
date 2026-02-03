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

const FormSchema = z.object({
  address_city: z.string().min(1, 'City is required'),
  address_country: z.string().min(1, 'Country is required'),
});

export default function DeviceLocation({ params, defaultValues }: IFormProps) {
  const toast = useToast();
  const utils = api.useUtils();

  const updateDeviceCategory = api.device.updateDeviceCategory.useMutation();

  const [countryCitiesData, setCountryCitiesData] = useState<
    Record<string, { code?: string; cities?: string[] }> | null
  >(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const res = await fetch('/countries.json', {
          cache: 'force-cache',
        });

        if (!res.ok) throw new Error('Failed to fetch countries and cities');

        const data = (await res.json()) as Record<
          string,
          { code?: string; cities?: string[] }
        >;

        if (isActive) setCountryCitiesData(data);
      } catch (_error) {
        if (isActive) setCountryCitiesData({});
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [toast]);

  const addressCountryOptions = useMemo((): ISelectOptions[] => {
    if (!countryCitiesData) return [];

    return Object.keys(countryCitiesData)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .map((countryName) => ({
        label: countryName,
        value: countryName,
      }));
  }, [countryCitiesData]);

  const buildCityOptionsForCountryName = useCallback(
    (countryName: string | undefined | null): ISelectOptions[] => {
      if (!countryName) return [];
      if (!countryCitiesData) return [];

      const cities = countryCitiesData[countryName]?.cities ?? [];

      return Array.from(new Set(cities))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .map((cityName) => ({ label: cityName, value: cityName }));
    },
    [countryCitiesData],
  );

  const [addressCityOptions, setAddressCityOptions] = useState<ISelectOptions[]>(
    [],
  );
  const [isAddressCityDisabled, setIsAddressCityDisabled] = useState<boolean>(
    () => !defaultValues?.address_country,
  );
  const lastCountryNameRef = useRef<string | null>(
    defaultValues?.address_country ?? null,
  );

  useEffect(() => {
    const countryName = defaultValues?.address_country;

    setIsAddressCityDisabled(!countryName);
    setAddressCityOptions(buildCityOptionsForCountryName(countryName));
  }, [
    buildCityOptionsForCountryName,
    defaultValues?.address_country,
  ]);

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    console.log("🚀 ~ handleSave ~ data:", data)
    console.log("🚀 ~ handleSave ~ countryCitiesData:", countryCitiesData)
    try {
      await updateDeviceCategory.mutateAsync({
        id: params.id,
        ...data,
        address_country_code:
          countryCitiesData?.[data.address_country]?.code ?? undefined,
      });
      await utils.device.getAccountSetUpDetailsByDeviceCode.invalidate();
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

          if (form && previousCountryName !== countryName) {
            form.setValue('address_city', '', {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
          }

          setIsAddressCityDisabled(!countryName);
          setAddressCityOptions(buildCityOptionsForCountryName(countryName));
        },
        fieldStyle: {
          gridColumn: '1 / span 1',
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
          gridColumn: '2 / span 1',
          gridRow: '1 / span 1',
        },
      },
    ];
  }, [
    buildCityOptionsForCountryName,
    isAddressCityDisabled,
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
        address_city: addressCityOptions,
      }}
      multiSelectOptions={{}}
    />
  );
}
