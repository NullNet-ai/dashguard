import { useMemo } from 'react';
import type { IState } from '~/components/platform/Wizard/type';

const useDynamicWidth = (open: unknown, state: IState | undefined , className: unknown) => {
  const calcWidth = useMemo(() => {
    if (className) return className;
    if (open && state?.isSummaryOpen) return 'w-full';
    if (!open && state?.isSummaryOpen) return 'w-auto';
    if (open && !state?.isSummaryOpen) return 'w-[calc(100vw-369px)]';
    return '';
  }, [open, state?.isSummaryOpen, className]);

  const containerWidth = useMemo(() => {
    if (className) return className;
    if (open && state?.isSummaryOpen) return 'lg:w-[calc(100vw-592px)]';
    if (!open && state?.isSummaryOpen) return 'w-auto';
    if (open && !state?.isSummaryOpen) return 'w-[calc(100vw-369px)]';
    return '';
  }, [open, state?.isSummaryOpen, className]);

  return { calcWidth, containerWidth } as {
    calcWidth: string;
    containerWidth: string;
  };
};

export default useDynamicWidth;
