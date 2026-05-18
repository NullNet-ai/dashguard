import { headers } from 'next/headers';
import { api } from '~/trpc/server';
import AccountDetails from './client';

const FormServerFetch = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , , application, identifier] = pathname.split('/');

  const [accountDetails, options] = await Promise.all([
    api.account.fetchAccountDetails({
      contact_code: identifier!,
    }),
    api.account.fetchOrganizationRolesOptions({
      contact_code: identifier!,
    }),
  ]);

  const { contact, account } = accountDetails ?? {};

  return (
    <div className="space-y-2">
      <AccountDetails
        defaultValues={{ ...account, contact_id: contact?.id }}
        selectOptions={{
          role_id: options?.user_role,
        }}
        params={{
          id: contact?.id,
          shell_type: application! as 'record' | 'wizard',
        }}
      />
    </div>
  );
};

export default FormServerFetch;
