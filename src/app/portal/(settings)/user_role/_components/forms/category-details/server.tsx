import { headers } from 'next/headers';
import React from 'react';

import { api } from '~/trpc/server';

import CategoryDetails from './client';

const StepOneOrganizationForm = async () => {
  const headerList = headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, application, identifier] = pathname.split('/');

  const pluck_fields = ['id', 'code', 'categories', 'entity'];

  const fetched_role_data = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields,
  });

  const {
    categories,
    entity,
    id: user_role_id,
  } = fetched_role_data?.data || {};

  const default_values = {
    entity: entity ?? '',
    categories: categories[0] ?? '',
  };

  return (
    <div className="space-y-2">
      <CategoryDetails
        defaultValues={default_values}
        params={{
          id: user_role_id!,
          shell_type: application! as 'record' | 'wizard',
          entity: main_entity,
        }}
        selectOptions={{
          categories: [
            { label: 'User', value: 'User' },
            { label: 'Device', value: 'Device' },
          ],
          entity: [
            { label: 'Contact', value: 'Contact' },
            { label: 'Device', value: 'Device' },
          ],
        }}
      />
    </div>
  );
};

export default StepOneOrganizationForm;
