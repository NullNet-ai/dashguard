import { Fragment } from 'react';
import RecordSummary from '~/components/platform/Record/Summary/RecordSummary';
import BasicRecordContent from './components/basic_content';
import { headers } from 'next/headers';
import NotFound from '~/app/not-found';
export default function Page() {
  const headerList = headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, , identifier] = pathname.split('/');

  if (!main_entity || !identifier) {
    return NotFound();
  }

  return (
    <Fragment>
      <RecordSummary />
      <BasicRecordContent
        form_key={main_entity}
        identifier={identifier}
        main_entity={main_entity}
      />
    </Fragment>
  );
}
