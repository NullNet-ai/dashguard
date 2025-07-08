import React from 'react';
import { Alert, AlertContent } from '~/components/ui/alert';

export default function CustomSuccessfulConnectionDetails() {
  return (
    <div className="flex flex-col gap-2">
      <Alert className="pb-2" dismissible={true} variant="success">
        <AlertContent className="">Device connected successfully!</AlertContent>
      </Alert>
    </div>
  );
}
