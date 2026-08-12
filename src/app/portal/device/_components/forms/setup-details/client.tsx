'use client';

import React, { useEffect } from 'react';
import { CircleCheck, Copy } from 'lucide-react';
import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
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
   variant?: 'amber' | 'blue' | 'green' | 'slate' | 'purple' | 'rose' | 'teal' | 'orange' | 'indigo' | 'cyan';
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
      case 'rose':
        return 'border-rose-200 bg-rose-50 text-rose-900';
      case 'teal':
        return 'border-teal-200 bg-teal-50 text-teal-900';
      case 'orange':
        return 'border-orange-200 bg-orange-50 text-orange-900';
      case 'indigo':
        return 'border-indigo-200 bg-indigo-50 text-indigo-900';
      case 'cyan':
        return 'border-cyan-200 bg-cyan-50 text-cyan-900';
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
    <div className={`flex items-center justify-between gap-3 rounded-md border px-3 ${styles}`}>
      <pre className="m-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all text-sm leading-5">
        <code>{value}</code>
      </pre>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              disabled={!value}
              className="shrink-0 size-7 my-1"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            Copy to clipboard
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

interface StepProps {
  number: number;
  title: string;
  isLast?: boolean;
  color?: 'amber' | 'blue' | 'green' | 'slate' | 'purple' | 'rose' | 'teal' | 'orange' | 'indigo' | 'cyan';
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
        return { badgeClasses: 'bg-amber-200 text-slate-700 ring-amber-300/50', lineClasses: 'bg-amber-300/30 grayscale-' };
      case 'blue':
        return { badgeClasses: 'bg-blue-200 text-slate-700 ring-blue-300/50', lineClasses: 'bg-blue-300/30' };
      case 'green':
        return { badgeClasses: 'bg-emerald-200 text-slate-700 ring-emerald-300/50', lineClasses: 'bg-emerald-300/30' };
      case 'purple':
        return { badgeClasses: 'bg-violet-200 text-slate-700 ring-violet-300/50', lineClasses: 'bg-violet-300/30' };
      case 'rose':
        return { badgeClasses: 'bg-rose-200 text-slate-700 ring-rose-300/50', lineClasses: 'bg-rose-300/30' };
      case 'teal':
        return { badgeClasses: 'bg-teal-200 text-slate-700 ring-teal-300/50', lineClasses: 'bg-teal-300/30' };
      case 'orange':
        return { badgeClasses: 'bg-orange-200 text-slate-700 ring-orange-300/50', lineClasses: 'bg-orange-300/30' };
      case 'indigo':
        return { badgeClasses: 'bg-indigo-200 text-slate-700 ring-indigo-300/50', lineClasses: 'bg-indigo-300/30' };
      case 'cyan':
        return { badgeClasses: 'bg-cyan-200 text-slate-700 ring-cyan-300/50', lineClasses: 'bg-cyan-300/30' };
      case 'slate':
      default:
        return { badgeClasses: 'bg-slate-200 text-slate-700 ring-slate-300/50', lineClasses: 'bg-slate-300/30' };
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
      <div className="flex-1 pb-4">
        <div className="mb-2 pt-1 text-sm font-semibold text-slate-900">{title}</div>
        {children}
      </div>
    </div>
  );
};

function getSteps(
  deviceType: string,
  downloadCommand: string,
  controlChannelUrl: string,
  joinCode: string,
  versionStr: string,
): StepData[] {
  const type = deviceType.toLowerCase();

  if (type === 'linux') {
    return [
      {
        title: 'Download the package',
        color: 'amber',
        jsx: <CodeRow variant="amber" value={downloadCommand} />,
      },
      {
        title: 'Install the package',
        color: 'blue',
        jsx: (
          <CodeRow
            variant="blue"
            value={`sudo apt install ./wallguard_${versionStr}_amd64.deb`}
          />
        ),
      },
      {
        title: 'Start the WallGuard Agent',
        color: 'green',
        jsx: (
          <CodeRow
            variant="green"
            value={`sudo wallguard-cli start --control-channel-url=${controlChannelUrl} --platform=generic`}
          />
        ),
      },
      {
        title: 'Verify the installation',
        color: 'teal',
        jsx: <CodeRow variant="teal" value="sudo wallguard-cli version" />,
      },
      {
        title: 'Complete the setup',
        color: 'purple',
        jsx: (
          <CodeRow
            variant="purple"
            value={`sudo wallguard-cli join ${joinCode}`}
          />
        ),
      },
    ];
  }

  if (type === 'redhat') {
    return [
      {
        title: 'Download the package',
        color: 'amber',
        jsx: <CodeRow variant="amber" value={downloadCommand} />,
      },
      {
        title: 'Install the package',
        color: 'blue',
        jsx: (
          <CodeRow
            variant="blue"
            value={`sudo dnf install ./wallguard-${versionStr}-1.x86_64.rpm`}
          />
        ),
      },
      {
        title: 'Start the WallGuard Agent',
        color: 'green',
        jsx: (
          <CodeRow
            variant="green"
            value={`sudo wallguard-cli start --control-channel-url=${controlChannelUrl} --platform=generic`}
          />
        ),
      },
      {
        title: 'Verify the installation',
        color: 'teal',
        jsx: <CodeRow variant="teal" value="sudo wallguard-cli version" />,
      },
      {
        title: 'Complete the setup',
        color: 'purple',
        jsx: (
          <CodeRow
            variant="purple"
            value={`sudo wallguard-cli join ${joinCode}`}
          />
        ),
      },
    ];
  }

  if (type === 'windows') {
    return [
      {
        title: 'Download NPCAP (Powershell)',
        color: 'amber',
        jsx: (
          <CodeRow
            variant="amber"
            value={`Invoke-WebRequest -Uri "https://npcap.com/dist/npcap-1.80.exe" -OutFile "C:\\Users\\$env:USERNAME\\Downloads\\npcap-installer.exe" -UseBasicParsing`}
          />
        ),
      },
      {
        title: 'Install NPCAP (Powershell)',
        color: 'orange',
        jsx: (
          <CodeRow
            variant="orange"
            value={`Start-Process "C:\\Users\\$env:USERNAME\\Downloads\\npcap-installer.exe" -Wait`}
          />
        ),
      },
      {
        title: 'Download VC Runtime (Powershell)',
        color: 'rose',
        jsx: (
          <CodeRow
            variant="rose"
            value={`Invoke-WebRequest -Uri "https://aka.ms/vs/17/release/vc_redist.x64.exe" -OutFile "C:\\Users\\$env:USERNAME\\Downloads\\vc_redist.x64.exe" -UseBasicParsing`}
          />
        ),
      },
      {
        title: 'Install VC Runtime (Powershell)',
        color: 'indigo',
        jsx: (
          <CodeRow
            variant="indigo"
            value={`Start-Process "C:\\Users\\$env:USERNAME\\Downloads\\vc_redist.x64.exe" -ArgumentList "/install /quiet /norestart" -Wait`}
          />
        ),
      },
      {
        title: 'Download the package (Powershell)',
        color: 'cyan',
        jsx: <CodeRow variant="cyan" value={downloadCommand} />,
      },
      {
        title: 'Install the package (Powershell)',
        color: 'blue',
        jsx: (
          <CodeRow
            variant="blue"
            value={`Start-Process msiexec.exe -ArgumentList "/i \`"$env:USERPROFILE\\Downloads\\wallguard-${versionStr}-x86_64.msi\`"" -Wait`}
          />
        ),
      },
      {
        title: 'Start the WallGuard Agent (CMD [Run as Administrator])',
        color: 'green',
        jsx: (
          <CodeRow
            variant="green"
            value={`wallguard-cli start --control-channel-url=${controlChannelUrl} --platform=generic`}
          />
        ),
      },
      {
        title: 'Verify the installation (CMD [Run as Administrator])',
        color: 'teal',
        jsx: <CodeRow variant="teal" value="wallguard-cli version" />,
      },
      {
        title: 'Complete the setup (CMD [Run as Administrator])',
        color: 'purple',
        jsx: (
          <CodeRow variant="purple" value={`wallguard-cli join ${joinCode}`} />
        ),
      },
    ];
  }

  if (type === 'mac os') {
    return [
      {
        title: 'Download and run the install script',
        color: 'amber',
        jsx: <CodeRow variant="amber" value={downloadCommand} />,
      },
      {
        title: 'Start the WallGuard Agent',
        color: 'green',
        jsx: (
          <CodeRow
            variant="green"
            value={`sudo wallguard-cli start --control-channel-url=${controlChannelUrl} --platform=generic`}
          />
        ),
      },
      {
        title: 'Verify the installation',
        color: 'teal',
        jsx: <CodeRow variant="teal" value="sudo wallguard-cli version" />,
      },
      {
        title: 'Complete the setup',
        color: 'purple',
        jsx: (
          <CodeRow
            variant="purple"
            value={`sudo wallguard-cli join ${joinCode}`}
          />
        ),
      },
    ];
  }

  return [
    {
      title: 'Download the package',
      color: 'amber',
      jsx: <CodeRow variant="amber" value={downloadCommand} />,
    },
    {
      title: 'Install the package',
      color: 'blue',
      jsx: (
        <CodeRow variant="blue" value={`pkg add wallguard-${versionStr}.pkg`} />
      ),
    },
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
      color: 'teal',
      jsx: <CodeRow variant="teal" value="wallguard-cli version" />,
    },
    {
      title: 'Complete the setup',
      color: 'purple',
      jsx: (
        <CodeRow variant="purple" value={`wallguard-cli join ${joinCode}`} />
      ),
    },
  ];
}

function getDeviceTypeText(deviceType: string): {
  subtitle: string;
  shellHint: string;
} {
  switch (deviceType.toLowerCase()) {
    case 'linux':
      return {
        subtitle:
          'Follow these steps to install and set up the WallGuard agent on your Linux system.',
        shellHint: 'Run these commands in your Linux terminal',
      };
    case 'redhat':
      return {
        subtitle:
          'Follow these steps to install and set up the WallGuard agent on your RedHat/CentOS system.',
        shellHint: 'Run these commands in your RedHat/CentOS terminal',
      };
    case 'windows':
      return {
        subtitle:
          'Follow these steps to install and set up the WallGuard agent on your Windows system.',
        shellHint:
          'Run these commands in PowerShell (and CMD as Administrator for step 7)',
      };
    case 'mac os':
      return {
        subtitle:
          'Follow these steps to install and set up the WallGuard agent on your macOS system.',
        shellHint: 'Run these commands in your macOS Terminal',
      };
    default:
      return {
        subtitle:
          'Follow these steps to install and set up the WallGuard agent on your pfSense system.',
        shellHint: 'Run these commands in your pfSense SSH shell',
      };
  }
}

const SetupDetails: React.FC<{ identifier: string; remoteAccessUrl?: string }> = ({
  identifier,
  remoteAccessUrl,
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
  const versionStr = version?.latest_version ?? '';
  // @ts-expect-error - No type yet
  const deviceType = (device?.device_type?.trim() ?? '') as string;
  let packageName: string;
  if (deviceType.toLowerCase() === 'pfsense') {
    packageName = `wallguard-${versionStr}.pkg`;
  } else if (deviceType.toLowerCase() === 'linux') {
    packageName = `wallguard_${versionStr}_amd64.deb`;
  } else if (deviceType.toLowerCase() === 'redhat') {
    packageName = `wallguard-${versionStr}-1.x86_64.rpm`;
  } else if (deviceType.toLowerCase() === 'windows') {
    packageName = `wallguard-${versionStr}-x86_64.msi`;
  } else {
    packageName = versionStr ? `wallguard-${versionStr}.pkg` : '';
  }
  const wallguardDownloadUrl =
    versionStr && packageName
      ? `https://github.com/NullNet-ai/wallguard/releases/download/v${versionStr}/${packageName}`
      : '';
  const isWindows = deviceType.toLowerCase() === 'windows';
  const isPfSense = deviceType.toLowerCase() === 'pfsense';
  const downloadCommand = isWindows
    ? `Invoke-WebRequest -Uri ${wallguardDownloadUrl} -OutFile "$env:USERPROFILE\\Downloads\\wallguard-${versionStr}-x86_64.msi" -UseBasicParsing`
    : isPfSense
      ? `fetch -o ${packageName} '${wallguardDownloadUrl}'`
      : `curl -fsSL -o ${packageName} '${wallguardDownloadUrl}'`;
  const controlChannelUrl = toControlChannelUrl(remoteAccessUrl);
  const { subtitle, shellHint } = getDeviceTypeText(deviceType);

  const steps = React.useMemo<StepData[]>(
    () =>
      getSteps(
        deviceType,
        downloadCommand,
        controlChannelUrl,
        joinCode,
        versionStr,
      ),
    [deviceType, downloadCommand, controlChannelUrl, joinCode, versionStr],
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
          <div className="">
            <div className="text-sm text-slate-600">{subtitle}</div>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              {shellHint}
              <CircleCheck size={13} fill='#7FCEAB' className='text-white'/>
            </div>
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