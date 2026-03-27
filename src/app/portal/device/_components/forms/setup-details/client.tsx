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

interface StepProps {
  number: number;
  title: string;
  isLast?: boolean;
  color?: 'amber' | 'blue' | 'green' | 'slate' | 'purple';
  children: React.ReactNode;
}

type StepData = {
  title: string;
  color: NonNullable<StepProps['color']>;
  jsx: React.ReactNode;
};

const Step = ({ number, title, isLast = false, children, color = 'slate' }: StepProps) => {
  const { badgeClasses, lineClasses } = React.useMemo(() => {
    switch (color) {
      case 'amber':
        return { badgeClasses: 'bg-amber-50 text-slate-700 ring-amber-300/50', lineClasses: 'bg-amber-300/30 grayscale-' };
      case 'blue':
        return { badgeClasses: 'bg-blue-50 text-slate-700 ring-blue-300/50', lineClasses: 'bg-blue-300/30' };
      case 'green':
        return { badgeClasses: 'bg-emerald-50 text-slate-700 ring-emerald-300/50', lineClasses: 'bg-emerald-300/30' };
      case 'purple':
        return { badgeClasses: 'bg-violet-50 text-slate-700 ring-violet-300/50', lineClasses: 'bg-violet-300/30' };
      case 'slate':
      default:
        return { badgeClasses: 'bg-slate-50 text-slate-700 ring-slate-300/50', lineClasses: 'bg-slate-300/30' };
    }
  }, [color]);

  return (
    <div className="flex items-stretch gap-4">
      <div className="flex flex-col items-center self-stretch">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1 ring-inset ${badgeClasses}`}>
          {number}
        </div>
        <div className={`my-1 w-[2px] flex-1 ${lineClasses}`} style={{ filter: 'grayscale(40%)' }} />
      </div>
      <div className="flex-1 pb-6">
        <div className="mb-2 pt-1 text-sm font-semibold text-slate-900">{title}</div>
        {children}
      </div>
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

  const steps = React.useMemo<StepData[]>(
    () => [
      {
        title: 'Download the package',
        color: 'amber',
        jsx: (
          <>
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
          </>
        ),
      },
      { title: 'Install the package', color: 'blue', jsx: <CodeRow variant="blue" value="pkg add wallguard.pkg" /> },
      {
        title: 'Start the WallGuard Agent',
        color: 'green',
        jsx: (
          <CodeRow
            variant="green"
            value={`wallguard-cli start --control-channel-url=${controlChannelUrl} --platform=pfsense`}
          />
        ),
      },
      {
        title: 'Verify the installation',
        color: 'slate',
        jsx: (
          <>
            <CodeRow variant="slate" value="wallguard-cli version" />
            {/* <div className="text-xs text-slate-500">
              Example value of control_channel_url: wallguard-proxy.nullnet.dnaqa.net:50051
            </div> */}
          </>
        ),
      },
      { title: 'Complete the setup', color: 'purple', jsx: <CodeRow variant="purple" value={`wallguard-cli join ${joinCode}`} /> },
    ],
    [wallguardDownloadUrl, controlChannelUrl, joinCode]
  );

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-1 gap-4',
      }}
      defaultValues={{}}
      fields={[]}
      customRender={() => (
        <div className="space-y-4">
            {/* <div className="text-base font-semibold text-slate-900">
              Download and install the WallGuard Package on pfSense
            </div> */}
          <div className="text-sm text-slate-600">
            Follow these steps to install and set up the WallGuard agent on your pfSense system.
          </div>

          <div>
            {steps.map((s, idx) => (
              <Step key={s.title} number={idx + 1} title={s.title} color={s.color} isLast={idx === steps.length - 1}>
                {s.jsx}
              </Step>
            ))}
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