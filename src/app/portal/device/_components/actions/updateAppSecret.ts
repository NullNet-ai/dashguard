'use server';
import { api } from '~/trpc/server';

export const updateAppSecret = async ({
    app_id,
    account_id,
    app_secret,
    device_id
}: {
    app_id: string;
    app_secret : string
    account_id : string
    device_id : string
}) => {

  const updatePassword = await api.auth.resetDeviceAppSecret({
    id : account_id,
    account_secret : app_secret,
    account_id : app_id,
    device_id
  });

  return updatePassword

};
