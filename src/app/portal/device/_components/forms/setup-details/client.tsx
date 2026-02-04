'use client';

import React, { useEffect } from 'react';
import { Copy } from 'lucide-react';
import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/react';

const toControlChannelUrl = (remoteAccessUrl?: string) => {
  if (!remoteAccessUrl) return '<control_channel_url>';
  const withoutScheme = remoteAccessUrl
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');
  return `${withoutScheme}:50051`;
};

const CodeRow = ({
  value,
  variant = 'slate',
}: {
  value: string;
  variant?: 'amber' | 'blue' | 'green' | 'slate' | 'purple';
}) => {
  const styles = React.useMemo(() => {
    switch (variant) {
      case 'amber':
        return 'border-amber-200 bg-amber-50 text-amber-900';
      case 'blue':
        return 'border-blue-200 bg-blue-50 text-blue-900';
      case 'green':
        return 'border-emerald-200 bg-emerald-50 text-emerald-900';
      case 'purple':
        return 'border-violet-200 bg-violet-50 text-violet-900';
      case 'slate':
      default:
        return 'border-slate-200 bg-slate-50 text-slate-900';
    }
  }, [variant]);

  const handleCopy = React.useCallback(async () => {
    if (!value) return;
    if (!navigator?.clipboard?.writeText) return;
    await navigator.clipboard.writeText(value);
  }, [value]);

  return (
    <div className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 ${styles}`}>
      <pre className="m-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all text-sm leading-5">
        <code>{value}</code>
      </pre>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        disabled={!value}
        className="shrink-0"
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
};

const SetupDetails: React.FC<{ identifier: string }> = ({
  identifier,
}) => {

  const [installationKey, setInstallationKey] = React.useState('');

  const {
    data: device,
    refetch,
  } = api.device.fetchDeviceInfo.useQuery({ code: identifier! });
  const { data: version } = api.device.fetchLatestVersion.useQuery();
  const fetchInstallationCodeByDeviceIdMutation = api.device.fetchInstallationCodeByDeviceId.useMutation();
  const createInstallationCodeMutation = api.device.createInstallationCode.useMutation();

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
      setInstallationKey(installationCode?.token || '');
    }
    fn();
    // @ts-expect-error - No type yet
  }, [device?.device_name && device?.device_type]);

  const joinCode = installationKey || '<installation-code>';
  const wallguardDownloadUrl = version?.latest_version || '<wallguard_download_url>';
  const controlChannelUrl = toControlChannelUrl(process.env.NEXT_PUBLIC_REMOTE_ACCESS_URL);

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-1 gap-4',
      }}
      defaultValues={{}}
      fields={[]}
      customRender={() => (
        <div className="space-y-4">
          <div className="space-y-1">
            {/* <div className="text-base font-semibold text-slate-900">
              Download and install the WallGuard Package on pfSense
            </div> */}
            <div className="text-sm text-slate-600">
              Follow these steps to install and set up the WallGuard agent on your pfSense system.
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-900">1. Download the package</div>
              <CodeRow
                variant="amber"
                value={`curl -o wallguard.pkg -L ${wallguardDownloadUrl}`}
              />
              {/* <div className="space-y-1 text-xs text-slate-500">
                <div>Make sure the package version points to the latest available WallGuard agent.</div>
                <div className="break-all">
                  Example value of wallguard_download_url: <a
                    href="https://github.com/NullNet-ai/wallguard/releases/download/v0.1.8/wallguard-0.1.8.pkg"
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-700 underline underline-offset-2"
                  >
                    https://github.com/NullNet-ai/wallguard/releases/download/v0.1.8/wallguard-0.1.8.pkg
                  </a>
                </div>
                <div>
                  Download Releases:{' '}
                  <a
                    href="https://github.com/NullNet-ai/wallguard/releases"
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-700 underline underline-offset-2"
                  >
                    https://github.com/NullNet-ai/wallguard/releases
                  </a>
                </div>
              </div> */}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-900">2. Install the package</div>
              <CodeRow variant="blue" value="pkg install wallguard.pkg" />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-900">3. Verify the installation</div>
              <CodeRow variant="green" value="wallguard-cli version" />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-900">4. Start the WallGuard Agent</div>
              <CodeRow
                variant="slate"
                value={`wallguard-cli start --control-channel-url=${controlChannelUrl} --platform=pfsense`}
              />
              {/* <div className="text-xs text-slate-500">
                Example value of control_channel_url: wallguard-proxy.nullnet.dnaqa.net:50051
              </div> */}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-900">5. Complete the setup</div>
              <CodeRow variant="purple" value={`wallguard-cli join ${joinCode}`} />
            </div>
          </div>
        </div>
      )}
      formKey="setup_details"
      formLabel="Setup"
      formSchema={z.object({})}
      handleSubmit={async () => {}}
      properties={{
        hasActions: false,
        isEditable: false,
      }}
      features={{
        enableFormHostViewActions: false,
        enableFormHostLockActions: false,
      }}
    />
  );
};

export default SetupDetails;
