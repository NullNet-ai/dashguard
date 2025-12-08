import { api } from '~/trpc/server';
import { headers } from 'next/headers';
import OrganizationDetails from './client';
import { EOperator } from '@dna-platform/common-orm';
import { EStatus } from '~/server/api/types';

const FormServerFetch = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, application, identifier] = pathname.split('/');

  const [contact, organizations] = await Promise.all([
    api.record.getByCode({
      main_entity: main_entity!,
      id: identifier!,
      pluck_fields: ['id'],
    }),
    api.grid.items({
      entity: 'organization',
      pluck: ['id', 'name'],
      limit: 100,
      advance_filters: [
        {
          type: 'criteria',
          field: 'status',
          operator: EOperator.EQUAL,
          values: [EStatus.ACTIVE],
        },
        {
          type: 'operator',
          operator: EOperator.AND,
        },
        {
          type: 'criteria',
          field: 'categories',
          operator: EOperator.CONTAINS,
          parse_as: 'text',
          values: ['Department'],
        },
      ],
    }),
  ]);

  const departmentOptions = organizations.items?.map(({ id, name }) => ({
    value: id,
    label: name,
  }));

  const fetch_def_val = await api.organizationContact.fetchOrganizations({
    contact_id: contact?.data?.id!,
  });
  const default_values = fetch_def_val?.data?.organizations?.length
    ? { organizations: fetch_def_val?.data?.organizations }
    : {};

  return (
    <div className="space-y-2">
      <OrganizationDetails
        defaultValues={default_values}
        multiSelectOptions={{ organizations: departmentOptions }}
        params={{
          id: contact?.data?.id!,
          shell_type: application! as 'record' | 'wizard',
        }}
      />
    </div>
  );
};

export default FormServerFetch;
