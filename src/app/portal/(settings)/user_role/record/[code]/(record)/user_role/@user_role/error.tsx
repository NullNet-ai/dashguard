'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { startTransition, useEffect } from 'react'

import { Button } from '~/components/ui/button'

const ErrorContainer = ({
  error,
  reset,
}: {
  error: Error & { digest?: string, statusCode?: number }
  reset: () => void
}) => {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  const clearError = () => {
    startTransition(() => {
      router.refresh()
      reset()
    })
  }

  return (
    <div className="flex justify-center p-4 py-6">
      <div className="flex flex-col items-center">
        <Image
          alt="Error"
          height={120}
          src="/something-wrong.svg"
          width={100}
        />
        <h2 className="mt-2 text-sm font-bold">Something Went Wrong!</h2>
        <div className="mt-3">
          <Button
            className="border border-primary text-primary"
            size="xs"
            variant="outline"
            onClick={clearError}
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ErrorContainer
