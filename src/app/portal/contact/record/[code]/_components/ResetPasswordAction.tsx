'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { TempPasswordDialogContent } from '~/components/platform/TempPasswordDialog';
import { api } from '~/trpc/react';

interface ResetPasswordActionProps {
  contact_code: string;
}

export default function ResetPasswordAction({
  contact_code,
}: ResetPasswordActionProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [wasCreated, setWasCreated] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetPassword = api.auth.adminResetAccountPassword.useMutation();
  const { data: wizardSummary } = api.account.fetchWizardSummary.useQuery(
    { contact_code },
    { enabled: confirmOpen },
  );

  useEffect(() => {
    const handleResetPassword = () => {
      setConfirmOpen(true);
    };
    window.addEventListener('contact:reset-password', handleResetPassword);
    return () => {
      window.removeEventListener('contact:reset-password', handleResetPassword);
    };
  }, []);

  const handleConfirm = async () => {
    const accountOrgId = (wizardSummary as any)?.id;
    if (!accountOrgId) {
      toast.error('No account found for this contact');
      setConfirmOpen(false);
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword.mutateAsync({
        account_organization_id: accountOrgId,
      });
      setConfirmOpen(false);
      setWasCreated(Boolean(result?.created));
      setTempPassword(result?.temp_password ?? null);
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Step 1: confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="w-5/6 bg-white md:w-3/6">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              This will invalidate the user&apos;s current password and generate
              a temporary one.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="py-2">
            <Button
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
              variant="ghost"
              className="mr-2"
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm} loading={loading} className="mr-2">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step 2: temporary password */}
      <Dialog
        open={tempPassword !== null}
        onOpenChange={(open) => {
          if (!open) {
            setTempPassword(null);
            setWasCreated(false);
          }
        }}
      >
        <DialogContent className="w-5/6 bg-white md:w-3/6">
          {tempPassword !== null && (
            <>
              <TempPasswordDialogContent password={tempPassword} />
              {wasCreated && (
                <p className="text-sm text-muted-foreground">
                  (Account was created)
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
