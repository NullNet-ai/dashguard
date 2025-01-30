import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface UseTabPersistenceOptions {
  code: string;
  prefix?: string;
  onPathChange?: (path: string) => void;
}

export function useTabPersistence({
  code,
  prefix = "tab-path",
  onPathChange,
}: UseTabPersistenceOptions) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const currentPath = pathname + "?" + searchParams.toString();

  useEffect(() => {
    const storageKey = `${prefix}-${code}`;

    if (isFirstRender) {
      const savedPath = localStorage.getItem(storageKey);
      if (savedPath) {
        router.push(savedPath);
        localStorage.removeItem(storageKey);
      }
      setIsFirstRender(false);
    } else {
      localStorage.setItem(storageKey, currentPath);
      onPathChange?.(currentPath);
    }
  }, [
    pathname,
    searchParams,
    isFirstRender,
    code,
    prefix,
    onPathChange,
    router,
    currentPath,
  ]);

  return {
    currentPath,
    isFirstRender,
  };
}
