'use server';
import { redirect } from 'next/navigation';
import { api } from '~/trpc/server';

export const createDraftDevice = async ({ entity }: { entity: string }) => {
  const register = await api.auth.draftDevice({});

  if (!register.success || !register?.data?.[0]?.code)
    throw new Error('Device Registration failed');

  const code = register?.data?.[0]?.code;

  redirect(`/portal/${entity}/wizard/${code}/1`);
};
