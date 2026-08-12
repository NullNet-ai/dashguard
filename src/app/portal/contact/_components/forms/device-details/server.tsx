import { api } from '~/trpc/server';
import { headers } from 'next/headers';
import ContactDevicesGrid from './client';

const FormServerFetch = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, application, identifier] = pathname.split('/');

  const contact = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ['id'],
  });

  return (
    <div className="space-y-2 w-[24] h-[24]">
      <ContactDevicesGrid contact_id={contact?.data?.id!} />
    </div>
  );
};

export default FormServerFetch;
