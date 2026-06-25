'use client';

import { useMemo, useState } from 'react';
import { CheckIcon, CopyIcon, PlusIcon, TerminalIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { createDraftDevice } from '../actions/createDeviceDraft';
import { useToast } from '~/context/ToastProvider';

type StepColor = 'amber' | 'green' | 'blue' | 'slate' | 'purple';

const InstallStep = ({
  number,
  title,
  color = 'slate',
  isLast = false,
  children,
}: {
  number: number;
  title: string;
  color?: StepColor;
  isLast?: boolean;
  children: React.ReactNode;
}) => {
  const { badgeClasses, lineClasses } = useMemo(() => {
    switch (color) {
      case 'amber':
        return {
          badgeClasses: 'bg-amber-200 text-slate-700 ring-amber-300/50',
          lineClasses: 'bg-amber-300/30',
        };
      case 'green':
        return {
          badgeClasses: 'bg-emerald-200 text-slate-700 ring-emerald-300/50',
          lineClasses: 'bg-emerald-300/30',
        };
      case 'blue':
        return {
          badgeClasses: 'bg-blue-200 text-slate-700 ring-blue-300/50',
          lineClasses: 'bg-blue-300/30',
        };
      case 'purple':
        return {
          badgeClasses: 'bg-purple-200 text-slate-700 ring-purple-300/50',
          lineClasses: 'bg-purple-300/30',
        };
      default:
        return {
          badgeClasses: 'bg-slate-200 text-slate-700 ring-slate-300/50',
          lineClasses: 'bg-slate-300/30',
        };
    }
  }, [color]);

  return (
    <div className="flex items-stretch gap-4">
      <div className="flex flex-col items-center self-stretch">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1 ring-inset ${badgeClasses}`}
        >
          {number}
        </div>
        {!isLast && (
          <div
            className={`my-1 w-[2px] flex-1 ${lineClasses}`}
            style={{ filter: 'grayscale(40%)' }}
          />
        )}
      </div>
      <div className="flex-1 pb-4">
        <div className="mb-2 pt-1 text-sm font-semibold text-slate-900">
          {title}
        </div>
        {children}
      </div>
    </div>
  );
};

const CodeSnippet = ({
  value,
  variant = 'slate',
  snippetKey,
  copiedKey,
  onCopy,
}: {
  value: string;
  variant?: StepColor;
  snippetKey: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}) => {
  const colorClasses = useMemo(() => {
    switch (variant) {
      case 'amber':
        return 'border-amber-200 bg-amber-50 text-amber-900';
      case 'green':
        return 'border-emerald-200 bg-emerald-50 text-emerald-900';
      case 'blue':
        return 'border-blue-200 bg-blue-50 text-blue-900';
      case 'purple':
        return 'border-purple-200 bg-purple-50 text-purple-900';
      default:
        return 'border-slate-200 bg-slate-50 text-slate-900';
    }
  }, [variant]);

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-md border px-3 ${colorClasses}`}
    >
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
              className="my-1 size-7 shrink-0"
              disabled={!value}
              onClick={() => onCopy(value, snippetKey)}
            >
              {copiedKey === snippetKey ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Copy to clipboard</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

function formatTtl(seconds: number): string {
  if (seconds % 3600 === 0) {
    const h = seconds / 3600;
    return `${h} hour${h !== 1 ? 's' : ''}`;
  }
  if (seconds % 60 === 0) return `${seconds / 60} minutes`;
  return `${seconds} seconds`;
}

const CustomCreateButton = ({ entity }: { entity: string }) => {
  const toast = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [installUrl, setInstallUrl] = useState('');
  const [windowsUrl, setWindowsUrl] = useState('');
  const [freebsdUrl, setFreebsdUrl] = useState('');
  const [expiresIn, setExpiresIn] = useState<number>(7200);
  const [loadingInstall, setLoadingInstall] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCreate = async () => {
    try {
      await createDraftDevice({ entity });
    } catch (error: any) {
      console.error('Failed to create draft record:', error);
      if (error.message === 'Device Role not found') {
        toast.error(
          'Device Role not found. Please create a device role first.',
        );
      }
    }
  };

  const handleGetInstallCommand = async () => {
    setLoadingInstall(true);
    try {
      const res = await fetch('/api/scripts/create-device/token', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to generate install token');
      const data = await res.json();
      setInstallUrl(data.url);
      setWindowsUrl(data.windowsUrl);
      setFreebsdUrl(data.freebsdUrl);
      setExpiresIn(data.expiresIn);
      setDialogOpen(true);
    } catch {
      toast.error('Failed to generate install command');
    } finally {
      setLoadingInstall(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const freebsdCmd = `fetch -qo - '${freebsdUrl}' | sh`;
  const linuxCmd = `sudo bash -c "$(curl -fsSL '${installUrl}')"`;
  const winCmd = `Set-ExecutionPolicy Bypass -Scope Process -Force; irm '${windowsUrl}' | iex`;
  const macosCmd = `sudo bash -c "$(curl -fsSL '${installUrl}')"`;

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        iconPlacement="left"
        Icon={TerminalIcon}
        loading={loadingInstall}
        onClick={handleGetInstallCommand}
      >
        Install Device
      </Button>

      <Button
        data-test-id="device-grid-create-button"
        iconPlacement="left"
        Icon={PlusIcon}
        onClick={handleCreate}
      >
        New
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-5/6 bg-white md:w-3/6">
          <DialogHeader>
            <DialogTitle>Install Device (Experimental)</DialogTitle>
            <DialogDescription>
              Automatically creates a Device Record, then installs and runs the
              Wallguard Agent on the target server. Run the command below on the
              server you want to register. The link expires in{' '}
              {formatTtl(expiresIn)}.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="freebsd">
            <TabsList className="w-full">
              <TabsTrigger value="freebsd" className="flex-1">
                FreeBSD
              </TabsTrigger>
              <TabsTrigger value="linux" className="flex-1">
                Linux
              </TabsTrigger>
              <TabsTrigger value="windows" className="flex-1">
                Windows
              </TabsTrigger>
              <TabsTrigger value="macos" className="flex-1">
                macOS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="freebsd" className="mt-3">
              <InstallStep
                number={1}
                title="Run the installer"
                color="amber"
                isLast
              >
                <p className="mb-2 text-xs text-muted-foreground">
                  Run from the pfSense CLI as root. Automatically installs bash
                  and required tools.
                </p>
                <CodeSnippet
                  value={freebsdCmd}
                  variant="amber"
                  snippetKey="freebsd"
                  copiedKey={copiedKey}
                  onCopy={handleCopy}
                />
              </InstallStep>
            </TabsContent>

            <TabsContent value="linux" className="mt-3">
              <InstallStep
                number={1}
                title="Run the installer"
                color="green"
                isLast
              >
                <p className="mb-2 text-xs text-muted-foreground">
                  Run on the target Linux server with sudo.
                </p>
                <CodeSnippet
                  value={linuxCmd}
                  variant="green"
                  snippetKey="linux"
                  copiedKey={copiedKey}
                  onCopy={handleCopy}
                />
              </InstallStep>
            </TabsContent>

            <TabsContent value="windows" className="mt-3">
              <InstallStep
                number={1}
                title="Run the installer"
                color="blue"
                isLast
              >
                <p className="mb-2 text-xs text-muted-foreground">
                  Open PowerShell as Administrator — search
                  &ldquo;PowerShell&rdquo;, right-click &rarr; Run as
                  Administrator — then paste and run:
                </p>
                <CodeSnippet
                  value={winCmd}
                  variant="blue"
                  snippetKey="windows"
                  copiedKey={copiedKey}
                  onCopy={handleCopy}
                />
              </InstallStep>
            </TabsContent>

            <TabsContent value="macos" className="mt-3">
              <InstallStep
                number={1}
                title="Run the installer"
                color="purple"
                isLast
              >
                <p className="mb-2 text-xs text-muted-foreground">
                  Open Terminal and run as sudo. Homebrew must be installed for
                  dependency auto-install.
                </p>
                <CodeSnippet
                  value={macosCmd}
                  variant="purple"
                  snippetKey="macos"
                  copiedKey={copiedKey}
                  onCopy={handleCopy}
                />
              </InstallStep>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomCreateButton;
