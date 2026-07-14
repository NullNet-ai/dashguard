import { headers } from 'next/headers';

import { api } from '~/trpc/server';

import SystemClient from './client';

const System = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, application, identifier] = pathname.split('/');
  const fetched_device = await api.record.getByCode({
    id: identifier!,
    pluck_fields: ['id', 'code', 'status', 'is_device_online'],
    main_entity: main_entity!,
  });

  const defaultValues = fetched_device?.data;

  return (
    <SystemClient
      defaultValues={defaultValues ?? {}}
      params={{
        id: defaultValues?.id! ?? '',
        shell_type: application! as 'record' | 'wizard',
        entity: main_entity,
      }}
    />
  );
};

export default System;
