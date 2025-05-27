"use client";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from '~/trpc/react';

export default function ErrorPage(props: {
  error: Error & { digest?: string; statusCode?: number; message: string };
  reset: () => void;
}) {
  const { error } = props;
  const router = useRouter();
  const apiAuth = api.auth.logout.useMutation();

  useEffect(() => {
    const handleError = async () => {
      try {
        await apiAuth.mutateAsync();
      } finally {
        Cookies.remove('token');
        sessionStorage.setItem('sessionExpired', 'true');
        localStorage.removeItem('errorRetryCount');
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.endsWith('entity-last-paths')) {
            localStorage.removeItem(key);
            i--;
          }
        }
        
        router.replace('/login');
      }
    };

    handleError();
  }, [error]);

  // Show loading state while redirecting
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center">
      <div className="animate-pulse text-sm text-muted-foreground">
        Redirecting to login...
      </div>
    </div>
  );
}