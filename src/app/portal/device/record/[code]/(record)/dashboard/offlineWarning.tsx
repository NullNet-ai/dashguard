'use client';

import { Alert, AlertContent } from '~/components/ui/alert';

export default function OfflineWarning({ isOnline }: { isOnline?: boolean | null }) {
  if (isOnline) return null;

  return (
    <Alert variant="warning" dismissible className="mb-2">
      <AlertContent>
        The device is Offline. Data transmission unavailable.
      </AlertContent>
    </Alert>
  );
}

