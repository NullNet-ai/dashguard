import { headers } from 'next/headers';
import { api } from '~/trpc/server';
import SetupDetails from './client';

const defaultMarkdownTemplate = `
### Not Found
No instructions have been found.

You installation code:
\`\${INSTALLATION_KEY}\`
`;

const FormServerFetch = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , , , identifier] = pathname.split('/');

  const device = await api.device.fetchDeviceInfo({ code: identifier! });

  let installationCode = await api.device.fetchInstallationCodeByDeviceId({
    device_id: device!.id,
  });

  if (installationCode === null) {
    installationCode = await api.device.createInstallationCode({
      device_id: device!.id,
      device_code: device!.code,
    });
  }

  const instructions = await api.device.fetchSetupInstructions({
    device_category: device?.device_category,
    device_type: device?.device_type,
  });

  // const server_url  = process.env.SERVER_URL

  return (
    <SetupDetails
      installationKey={installationCode?.code}
      markdownTemplate={instructions?.markdown ?? defaultMarkdownTemplate}
    />
  );
};

export default FormServerFetch;
