"use client";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";
import { Button } from "~/components/ui/button";
import Image from "next/image";

export default function ErrorPage(props: {
  error: Error & { digest?: string; statusCode?: number; message: string };
  reset: () => void;
}) {
  const { error } = props;
  switch (error.message?.toUpperCase()) {
    case "UNAUTHORIZED":
      return <UnAuthorized />;
    default:
      return <DefaultError {...props} />;
  }
}

function DefaultError({
  error,
  reset,
}: {
  error: Error & { digest?: string; statusCode?: number };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const clearError = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

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
}

function UnAuthorized() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <TriangleAlertIcon className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-6xl font-bold tracking-tight text-foreground">
          401
        </h1>
        <p className="mt-4 text-muted-foreground">
          Oops, you don't have permission to access this page. Please check your
          credentials and try again.
        </p>
        <div className="mt-6">
          <a
            href="/login"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <ChevronLeftIcon className="mr-2 h-4 w-4" />
            Login
          </a>
        </div>
      </div>
    </div>
  );
}

// @ts-expect-error - Required for the icon to work
function TriangleAlertIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
