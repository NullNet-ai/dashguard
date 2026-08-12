'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { api } from '~/trpc/react';
import numberToWords from '../Utils/steptoWords';
import { isNumber } from 'lodash';

const useTraverseSteppedSaved = (
  traverseSteps: Record<string, 'Stepped'>,
  setTraverseStep: (
    value: React.SetStateAction<Record<string, 'Stepped'>>,
  ) => void,
) => {
  const saveTraverse = api.wizard.saveTraverseStepped.useMutation();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // ! TO FINALIZE THE NAMING AND STRUCTURE OF THE PATH
  const path = pathname.split('/');
  const [, , mainEntity, application, identifier, step] = path;

  useEffect(() => {
    if (application !== 'wizard') return;
    if (!identifier) return;
    const traverse = {
      ...traverseSteps,
      [numberToWords(+step!)]: 'Stepped',
    } as Record<string, 'Stepped'>;

    if (isNumber(Number(step))) {
      saveTraverse.mutate({
        key: `${mainEntity}:wizard:${identifier}`,
        pathname: searchParams.toString()
          ? pathname + '?' + searchParams.toString()
          : pathname,
        currentStep: +step!,
        traverse: traverse,
      });
      setTraverseStep(traverse);
    }

    // Debounce steps then save to cache
  }, [step]);
};

export default useTraverseSteppedSaved;
