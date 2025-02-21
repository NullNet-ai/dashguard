'use server';
import { redirect } from 'next/navigation';

import { verifySession } from '~/app/login/actions/loginSubmit';
import { EStatus } from '~/server/api/types';
import { api } from '~/trpc/server';
import { handleLoginError } from '~/utils/login-validator';

interface RegisterAccountArgs {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  organization_name?: string;
}

export default async function registerAccount({
  first_name,
  last_name,
  email,
  password,
  organization_name,
}: RegisterAccountArgs) {
  let error = null;
  try {
    /**
     * Registration data
     */
    const organization = {
      name: organization_name,
    };

    const account = {
      first_name,
      last_name,
      email,
      password,
      account_id: email,
      account_secret: password,
      is_new_user: false,
    };

    /**
     * Register account
     */
    const registeredAccountDetails = await api.auth.registerAccount({
      account,
      organization,
    });

    const accountDataError = handleLoginError(registeredAccountDetails);
    if (accountDataError) {
      error = accountDataError;
      return error;
    }

    /**
     * Login using username and password
     */
    await api.auth.login({
      username: email,
      password,
    });

    await verifySession();

    /**
     * Create contact
     */
    await api.form.createDynamicRecord({
      entity: 'contact',
      data: {
        first_name,
        last_name,
        status: 'Draft',
        categories: ['Contact'],
      },
    });

  } catch (err: any) {
    console.error(error);
    error = err;
  } finally {
    if (error as any) {
      return {
        error:
          (error as any)?.message ?? 'Something went wrong please try again',
        type: 'unknown',
      };
    }
    redirect('/portal/dashboard');
  }
}
