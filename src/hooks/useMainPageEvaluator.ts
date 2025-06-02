'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export function useMainPageEvaluator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const [, , main_entity, applications] = pathname.split('/');

    if (!main_entity) return;

    const lastVisitedKey = `last_visited_url:${main_entity}`;

    const lastVisitedUrl = localStorage.getItem(lastVisitedKey) || '';
    const [, , , applicationsLocal] = lastVisitedUrl?.split('/');

    // Redirect logic
    if (!applications && !applicationsLocal) {
      router.push(`/portal/${main_entity}/grid`);
      return;
    }

    if (lastVisitedUrl && lastVisitedUrl) {
      router.push(lastVisitedUrl);
    }
  }, [pathname, searchParams, router]);
}
