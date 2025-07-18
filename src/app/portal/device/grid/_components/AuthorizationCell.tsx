'use client';

import { CheckCircle, XCircle } from 'lucide-react';

type AuthorizationCellProps = {
  authorized: boolean;
};

export default function AuthorizationCell({
  authorized,
}: AuthorizationCellProps) {
  return (
    <span className="flex items-center gap-2 text-sm font-medium">
      {authorized ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-600" />
          Authorized
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 text-red-600" />
          Unauthorized
        </>
      )}
    </span>
  );
}
