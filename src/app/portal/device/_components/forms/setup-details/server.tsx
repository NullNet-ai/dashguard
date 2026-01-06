import { headers } from 'next/headers';
import SetupDetails from './client';

const FormServerFetch = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , , , identifier] = pathname.split('/');

  return (
    // @ts-expect-error - No type yet
    <SetupDetails
      identifier={identifier!}
    />
  );
};

export default FormServerFetch;
