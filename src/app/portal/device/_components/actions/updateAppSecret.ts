'use server';
import { api } from '~/trpc/server';

export const updateAppSecret = async ({
    app_id,
    account_id,
    app_secret
}: {
    app_id: string;
    app_secret : string
    account_id : string
}) => {

  const updatePassword = await api.auth.resetDeviceAppSecret({
    id : account_id,
    account_secret : app_secret,
    account_id : app_id
  });

  return updatePassword

};
