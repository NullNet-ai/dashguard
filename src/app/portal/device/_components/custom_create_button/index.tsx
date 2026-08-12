'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckIcon, CopyIcon, PlusIcon, TerminalIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Loader } from '~/components/ui/loader';
import { createDraftDevice } from '../actions/createDeviceDraft';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';

const InstallStep = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex-1 pb-4">
      <div className="mb-2 pt-1 text-sm font-semibold text-slate-900">
        {title}
      </div>
      {children}
    </div>
  );
};

const CodeSnippet = ({
  value,
  snippetKey,
  copiedKey,
  loadingKey,
  onCopy,
}: {
  value: string;
  snippetKey: string;
  copiedKey: string | null;
  loadingKey: string | null;
  onCopy: (text: string, key: string) => void;
}) => {
  const colorClasses = 'border-slate-200 bg-slate-50 text-slate-900';

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
              {loadingKey === snippetKey ? (
                <Loader size="sm" variant="spinner" className="h-4 w-4" />
              ) : copiedKey === snippetKey ? (
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

const CustomCreateButton = ({
  entity,
  onFetchRecords,
}: {
  entity: string;
  onFetchRecords?: () => void;
}) => {
  const toast = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [installUrl, setInstallUrl] = useState('');
  const [windowsUrl, setWindowsUrl] = useState('');
  const [freebsdUrl, setFreebsdUrl] = useState('');
  const [expiresIn, setExpiresIn] = useState<number>(7200);
  const [loadingInstall, setLoadingInstall] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [installStarted, setInstallStarted] = useState(false);
  const [scriptToken, setScriptToken] = useState('');

  const deviceQuery = api.device.fetchDeviceByScriptToken.useQuery(
    { script_token: scriptToken },
    {
      enabled: dialogOpen && !!scriptToken,
      refetchInterval: (query) =>
        query.state.data?.status === 'Active' ? false : 1000,
    },
  );

  const success = deviceQuery.data?.status === 'Active';

  const hasRefreshedRef = useRef(false);

  useEffect(() => {
    if (success && !hasRefreshedRef.current) {
      hasRefreshedRef.current = true;
      onFetchRecords?.();
    }
    if (!success) {
      hasRefreshedRef.current = false;
    }
  }, [success, onFetchRecords]);

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
      setScriptToken(data.token);
      setDialogOpen(true);
    } catch {
      toast.error('Failed to generate install command');
    } finally {
      setLoadingInstall(false);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    setLoadingKey(key);
    setInstallStarted(true);
    try {
      await navigator.clipboard.writeText(text);
      setLoadingKey(null);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setLoadingKey(null);
    }
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
            <DialogTitle>Install Device</DialogTitle>
            <DialogDescription>
              Automatically creates a Device Record, then installs and runs the
              Wallguard Agent on the target server. Run the command below on the
              server you want to register. The link expires in{' '}
              {formatTtl(expiresIn)}.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue="freebsd"
            onValueChange={() => {
              setCopiedKey(null);
              setLoadingKey(null);
              setInstallStarted(false);
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="freebsd" className="flex-1">
                FreeBSD
              </TabsTrigger>
              <TabsTrigger value="linux" className="flex-1">
                Linux
              </TabsTrigger>
              <TabsTrigger value="redhat" className="flex-1">
                RedHat/CentOS
              </TabsTrigger>
              <TabsTrigger value="windows" className="flex-1">
                Windows
              </TabsTrigger>
              <TabsTrigger value="macos" className="flex-1">
                macOS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="freebsd" className="mt-3">
              <InstallStep title="Run the installer">
                <p className="mb-2 text-xs text-muted-foreground">
                  Run from the pfSense CLI as root. No additional dependencies
                  required.
                </p>
                <CodeSnippet
                  value={freebsdCmd}
                  snippetKey="freebsd"
                  copiedKey={copiedKey}
                  loadingKey={loadingKey}
                  onCopy={handleCopy}
                />
              </InstallStep>
            </TabsContent>

            <TabsContent value="linux" className="mt-3">
              <InstallStep title="Run the installer">
                <p className="mb-2 text-xs text-muted-foreground">
                  Run on the target Linux server with sudo.
                </p>
                <CodeSnippet
                  value={linuxCmd}
                  snippetKey="linux"
                  copiedKey={copiedKey}
                  loadingKey={loadingKey}
                  onCopy={handleCopy}
                />
              </InstallStep>
            </TabsContent>

            <TabsContent value="redhat" className="mt-3">
              <InstallStep title="Run the installer">
                <p className="mb-2 text-xs text-muted-foreground">
                  Run on the target RedHat/CentOS server with sudo.
                </p>
                <CodeSnippet
                  value={linuxCmd}
                  snippetKey="redhat"
                  copiedKey={copiedKey}
                  loadingKey={loadingKey}
                  onCopy={handleCopy}
                />
              </InstallStep>
            </TabsContent>

            <TabsContent value="windows" className="mt-3">
              <InstallStep title="Run the installer">
                <p className="mb-2 text-xs text-muted-foreground">
                  Open PowerShell as Administrator — search
                  &ldquo;PowerShell&rdquo;, right-click &rarr; Run as
                  Administrator — then paste and run:
                </p>
                <CodeSnippet
                  value={winCmd}
                  snippetKey="windows"
                  copiedKey={copiedKey}
                  loadingKey={loadingKey}
                  onCopy={handleCopy}
                />
              </InstallStep>
            </TabsContent>

            <TabsContent value="macos" className="mt-3">
              <InstallStep title="Run the installer">
                <p className="mb-2 text-xs text-muted-foreground">
                  Open Terminal and run as sudo. Homebrew must be installed for
                  dependency auto-install.
                </p>
                <CodeSnippet
                  value={macosCmd}
                  snippetKey="macos"
                  copiedKey={copiedKey}
                  loadingKey={loadingKey}
                  onCopy={handleCopy}
                />
              </InstallStep>
            </TabsContent>
          </Tabs>

          {(installStarted || success) && (
            <div className="flex flex-col items-center justify-center gap-3 py-4">
              {success ? (
                <>
                  <CheckIcon className="h-8 w-8 text-emerald-600" />
                  <p className="text-center font-semibold">
                    Device installed successfully!
                  </p>
                </>
              ) : (
                <>
                  <Loader variant="circularShadow" size="lg" />
                  <p className="text-center text-sm text-muted-foreground">
                    Waiting for installation to complete…
                  </p>
                </>
              )}
            </div>
          )}

          {success && (
            <DialogFooter className="pt-4">
              <Button onClick={handleGetInstallCommand}>
                Install Device Again
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomCreateButton;
