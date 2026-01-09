import { Fragment } from 'react';
import RecordSummary from '~/components/platform/Record/Summary/RecordSummary';
import { headers } from 'next/headers';
import NotFound from '~/app/not-found';
import RecordShellSummary from './_1';
import RecordContactBadge from '../_components/RecordContactBadge';
export default async function Page() {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, , identifier] = pathname.split('/');

  if (!main_entity || !identifier) {
    return NotFound();
  }

  return (
    <div className='flex flex-col gap-2 md:pr-0'>
      <RecordSummary>
        <RecordContactBadge 
          form_key={"device_basic_details"}
          identifier={identifier!}
          main_entity={main_entity!}
        />
      </RecordSummary>
      <RecordShellSummary
        form_key={"device_basic_details"}
        identifier={identifier!}
        main_entity={main_entity!}
      />
    </div>
  );
}
