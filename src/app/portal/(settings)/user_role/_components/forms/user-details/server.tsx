import { headers } from 'next/headers';

import { api } from '~/trpc/server';

import RoleUsersGrid from './client';

const FormServerFetch = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , , , identifier] = pathname.split('/');

  const record_details = await api.user_role.getByCode({
    code: identifier!,
    pluck_fields: ['id', 'role'],
  });

  const user_role_id = record_details?.data?.id as string | undefined;

  if (!user_role_id) return null;

  return (
    <div className="space-y-2">
      <RoleUsersGrid user_role_id={user_role_id} />
    </div>
  );
};

export default FormServerFetch;
