'use client'

import { XCircleIcon } from '@heroicons/react/24/outline'
import React from 'react'

import { Button } from '~/components/ui/button'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string, statusCode?: number }
  reset: () => void
}) {
  function clearError() {
    reset()
  }

  return (
    <div className="rounded-md bg-red-100 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon aria-hidden="true" className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error Details:</h3>
          <p className="text-sm text-red-700">
            {"Message:"}
            {error.message}
          </p>
          {error.statusCode && (
            <p className="text-sm text-red-700">
              {'Status Code: '}
              {error.statusCode}
            </p>
          )}
          {error.digest && (
            <p className="text-sm text-red-700">
              {"Error ID:"}
              {error.digest}
            </p>
          )}
          {/* {error.stack && (
            <p className="text-sm text-red-700">Stack Trace: {error.stack}</p>
          )} */}
          <div className="mt-4">
            <Button onClick={clearError}>Try again</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
