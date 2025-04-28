'use server';
import { redirect } from 'next/navigation';
import { api } from '~/trpc/server';
import { EAccountType } from '@dna-platform/common-orm';

export const createDraftDevice = async ({
  entity,
  app_id,
  app_secret,
}: {
  entity: string;
  app_id: string;
  app_secret: string;
}) => {
  // const response = await api.device.createDraftRecord();
  const fetchDeviceRole = await api.user_role.getRoleByName({
    role_name: 'Device',
  });

  if (!fetchDeviceRole.success || !fetchDeviceRole?.data?.[0]) {
    throw new Error('Device Role not found');
  }
  const register = await api.auth.deviceRegisterAccount({
    account: {
      account_id: app_id,
      account_secret: app_secret,
      // is_new_user: z.boolean().optional(),
      // is_invited: z.boolean().optional(),
      role_id: fetchDeviceRole?.data?.[0]?.id || '',
      account_organization_status: 'Inactive',
      account_organization_categories: ['Device'],
      account_type: EAccountType.DEVICE,
      // account_organization_id: z.string().optional(),
      device_categories: ['Device'],
    },
  });

  if (!register.success || !register?.data?.[0]?.device_code) throw new Error('Device Registration failed');

  const code = register?.data?.[0]?.device_code;


  redirect(`/portal/${entity}/wizard/${code}/1`);
};
