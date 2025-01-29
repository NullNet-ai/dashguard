"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { api } from "~/trpc/react";

const useTraverseSteppedSaved = (traverseSteps: Record<string, "Stepped">) => {
  const saveTraverse = api.wizard.saveTraverseStepped.useMutation();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // ! TO FINALIZE THE NAMING AND STRUCTURE OF THE PATH
  const path = pathname.split("/");
  let [, , mainEntity, , identifier, step] = path;
  if (process.env.IS_PLAYGROUND) {
    const [, , , , , playgroundIdentifier, playgroundStep] = path
    identifier = playgroundIdentifier
    step = playgroundStep
    mainEntity = "contact";
  }
  useEffect(() => {
    saveTraverse.mutate({
      key: `${mainEntity}:wizard:${identifier}`,
      pathname: searchParams.toString()
        ? pathname + "?" + searchParams.toString()
        : pathname,
      currentStep: +step!,
      traverse: traverseSteps,
    });
    // Debounce steps then save to cache
  }, [traverseSteps]);
};

export default useTraverseSteppedSaved;
