'use client';

import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useToast } from '~/context/ToastProvider';

/**
 * Module-level listener wired up by {@link TempPasswordDialogHost} on mount.
 * `showTempPassword` invokes it to open the dialog and resolves the returned
 * promise once the admin dismisses it.
 */
let listener: ((password: string, resolve: () => void) => void) | null = null;

/**
 * Opens the temporary-password dialog with the given password and resolves once
 * the admin acknowledges it (clicks Done / closes the dialog). Callable from
 * anywhere (e.g. wizard callbacks) as long as {@link TempPasswordDialogHost} is
 * mounted in the tree.
 */
export function showTempPassword(password: string): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!listener) {
      // Host not mounted — nothing to display. Resolve immediately so callers
      // don't hang.
      resolve();
      return;
    }
    listener(password, resolve);
  });
}

/**
 * The dialog body: shows the temporary password with a copy-to-clipboard
 * button. Exported so it can be reused by ResetPasswordAction.
 */
export function TempPasswordDialogContent({ password }: { password: string }) {
  const toast = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    toast.success('Temporary password copied to clipboard');
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Temporary Password</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        Shown only once. Share it with the user securely.
      </p>
      <div className="flex items-center gap-2">
        <Input readOnly value={password} className="font-mono" />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleCopy}
          aria-label="Copy temporary password"
        >
          <Copy className="size-4" />
        </Button>
      </div>
    </>
  );
}

/**
 * Host component that mounts once (e.g. in the wizard layout) and renders the
 * temporary-password dialog on demand. It registers the module-level listener
 * so {@link showTempPassword} can drive it imperatively.
 */
export function TempPasswordDialogHost() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [resolver, setResolver] = useState<(() => void) | null>(null);

  useEffect(() => {
    listener = (pw, resolve) => {
      setPassword(pw);
      setResolver(() => resolve);
      setOpen(true);
    };
    return () => {
      listener = null;
    };
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && resolver) {
      resolver();
      setResolver(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <TempPasswordDialogContent password={password} />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
