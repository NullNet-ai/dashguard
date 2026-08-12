import { headers } from 'next/headers';
import SetupDetails from './client';

const FormServerFetch = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , , , identifier] = pathname.split('/');

  return (
    <SetupDetails
      identifier={identifier!}
      remoteAccessUrl={process.env.REMOTE_ACCESS_URL}
    />
  );
};

export default FormServerFetch;
