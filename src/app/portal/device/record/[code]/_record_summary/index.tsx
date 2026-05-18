import { Fragment } from 'react';
import RecordSummary from '~/components/platform/Record/Summary/RecordSummary';
import { headers } from 'next/headers';
import NotFound from '~/app/not-found';
import RecordShellSummary from './_1';
export default async function Page() {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, , identifier] = pathname.split('/');

  if (!main_entity || !identifier) {
    return NotFound();
  }

  return (
    <Fragment>
      <RecordSummary />
      <RecordShellSummary
        form_key={"device_basic_details"}
        identifier={identifier!}
        main_entity={main_entity!}
      />
    </Fragment>
  );
}
