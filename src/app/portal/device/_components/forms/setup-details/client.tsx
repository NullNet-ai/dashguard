'use client';

import React, { useEffect } from 'react';
import Markdown from 'react-markdown';
import { api } from '~/trpc/react';

type SetupDetailsProps = {
  installationKey: string;
  markdownTemplate: string;
};

const defaultMarkdownTemplate = `
### Not Found
No instructions have been found.

You installation code:
\`\${INSTALLATION_KEY}\`
`;

const SetupDetails: React.FC<SetupDetailsProps & { identifier: string }> = ({
  identifier,
}) => {

  const [installationKey, setInstallationKey] = React.useState('');
  const [markdownTemplate, setMarkdownTemplate] = React.useState('');
  
  const {
    data: device,
    refetch,
  } = api.device.fetchDeviceInfo.useQuery({ code: identifier! });
  const fetchInstallationCodeByDeviceIdMutation = api.device.fetchInstallationCodeByDeviceId.useMutation();
  const createInstallationCodeMutation = api.device.createInstallationCode.useMutation();
  const fetchSetupInstructionsMutation = api.device.fetchSetupInstructions.useMutation();

  useEffect(() => {
    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const pollUntilDeviceNameAndDeviceType = async () => {
      if (isCancelled) {
        return;
      }

      // @ts-expect-error - No type yet
      const deviceName = device?.device_name?.trim();
      if (deviceName) {
        return;
      }

      // @ts-expect-error - No type yet
      const deviceType = device?.device_type?.trim();
      if (deviceType) {
        return;
      }

      try {
        await refetch();
      } catch {}

      if (isCancelled) {
        return;
      }

      timeoutId = setTimeout(pollUntilDeviceNameAndDeviceType, 1000);
    };

    pollUntilDeviceNameAndDeviceType();

    return () => {
      isCancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  // @ts-expect-error - No type yet
  }, [device?.device_name, device?.device_type]);
  
  useEffect(() => {
    // @ts-expect-error - No type yet
    if (!device?.device_name || !device?.device_type) {
      return;
    }
    const fn = async() => {
      const fetchInstallationCodeByDeviceIdData = await fetchInstallationCodeByDeviceIdMutation.mutateAsync({
        // @ts-expect-error - No type yet
        device_id: device!.id,
      });
      let installationCode = fetchInstallationCodeByDeviceIdData;
      if (installationCode === null) {
        const createInstallationCodeData = await createInstallationCodeMutation.mutateAsync({
          // @ts-expect-error - No type yet
          device_id: device!.id,
          // @ts-expect-error - No type yet
          device_code: device!.code,
        });
        installationCode = createInstallationCodeData;
      }
      const fetchSetupInstructionsData = await fetchSetupInstructionsMutation.mutateAsync({
        // @ts-expect-error - No type yet
        device_category: device?.device_category,
        // @ts-expect-error - No type yet
        device_type: device?.device_type,
      });
      setInstallationKey(installationCode?.token || '');
      setMarkdownTemplate(fetchSetupInstructionsData?.markdown ?? defaultMarkdownTemplate);
    }
    fn();
    // @ts-expect-error - No type yet
  }, [device?.device_name && device?.device_type]);

  const markdown = React.useMemo(
    () => markdownTemplate.replace('${INSTALLATION_KEY}', installationKey),
    [markdownTemplate, installationKey],
  );

  return <Markdown>{markdown}</Markdown>;
};

export default SetupDetails;
