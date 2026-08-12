'use client';

import { CheckIcon } from '@heroicons/react/20/solid';
import React, { useContext, useEffect, useState } from 'react';

import { WizardContext } from '~/components/platform/Wizard/Provider';
import { api } from '~/trpc/react';

import CustomConfirmationDetails from '../_custom/Confirmation';
import CustomSuccessfulConnectionDetails from '../_custom/SuccessfulConnection';
import { type IFormProps } from '../types';
import { usePathname } from 'next/navigation';

const Confirmation = (_: IFormProps) => {
  const { actions } = useContext(WizardContext);
  const [loading, setLoading] = useState(true);

  const pathName = usePathname();
  const [, , , , identifier] = pathName.split('/');

  const fetchDeviceInfo = api.device.fetchDeviceInfo.useQuery({
    code: identifier!,
  });

  useEffect(() => {
    actions?.setCallback({
      customizeWizardButtonSave: {
        label: 'Finish',
        icon: <CheckIcon className="h-6 w-4 text-secondary" />,
        disableDropdown: true,
        disabled: loading,
        dropdownOptions: [],
      },
    });
  }, [loading]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await fetchDeviceInfo.refetch();
      
      // @ts-expect-error - No type yet
      const { is_device_online = false } = data || {};

      if (is_device_online) {
        setLoading(false);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchDeviceInfo]);

  return (
    <>
      {loading ? (
        <CustomConfirmationDetails />
      ) : (
        <CustomSuccessfulConnectionDetails />
      )}
    </>
  );
};

export default Confirmation;
