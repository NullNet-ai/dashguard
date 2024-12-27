"use client";

import { XCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";
import { Button } from "~/components/ui/button";
import Image from "next/image";

const ErrorContainer = ({
  error,
  reset,
}: {
  error: Error & { digest?: string; statusCode?: number };
  reset: () => void;
}) => {
  const router = useRouter();
  
  useEffect(() => {
    console.error(error);
  }, [error]);

  const clearError = () => {
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
          <h2 className="mt-2 text-sm font-bold">Something Went Wrong!</h2>
          <div className="mt-3">
            <Button
              onClick={clearError}
              className="border border-primary text-primary"
              size={"xs"}
              variant={"outline"}
            >
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
};

export default ErrorContainer;
