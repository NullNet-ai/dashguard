"use client";

import { Button } from "~/components/ui/button";
import Image from "next/image";
import React, { startTransition } from "react";
import { useRouter } from "next/navigation";

export default function ErrorPage({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string; statusCode?: number }; 
  reset: () => void;
}) {
  const router = useRouter();
  
  function clearError() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
      <div className="flex justify-center p-4 py-6">
        <div className="flex flex-col items-center">
          <Image
            src="/something-wrong.svg"
            alt="Error"
            width={100}
            height={120}
          />
          <h2 className="text-sm font-bold mt-2">Something Went Wrong!</h2>
          <div className="mt-3">
            <Button onClick={clearError} className="border border-primary text-primary" size={'xs'} variant={'outline'}>Try again</Button>
          </div>
        </div>
    </div>
    );
}