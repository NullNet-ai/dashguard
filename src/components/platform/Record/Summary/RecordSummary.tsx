import React from 'react';
import { api } from '~/trpc/server';
import { headers } from 'next/headers';
import RecordClientWrapper from './RecordClientWrapper';

const RecordSummary = async ({
  image_placeholder,
  header_center_slot,
  is_show_header_tab,
  actions,
  children,
}: any) => {
    const headerList = await headers();
    const pathname = headerList.get('x-pathname') || '';
    const [, , , , identifier] = pathname.split('/');

  // @ts-expect-error - No type yet
  const { first_name, last_name } = await api.contact.fetchContactPhoneEmail({
    code: identifier!,
    pluck_fields: ['id', 'first_name', 'last_name'],
    is_multiple: true,
  });

  const textPlaceholder = `${first_name?.charAt(0) || ''}${last_name?.charAt(0) || ''}`;

  return (
    <div>
      <RecordClientWrapper
        image_placeholder={textPlaceholder ?? image_placeholder}
        header_center_slot={header_center_slot}
        is_show_header_tab={is_show_header_tab}
        actions={actions}
      >
        {children}
      </RecordClientWrapper>
    </div>
  );
};

export default RecordSummary;
