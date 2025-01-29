import { useEffect } from "react";
import { api } from "~/trpc/react";

const usePrefetchWizardTraverse = (
  key: string,
  setTraverseStep: (
    value: React.SetStateAction<Record<string, "Stepped">>,
  ) => void,
) => {
  const traverseSet = api.wizard.getTraverseStepped.useMutation();

  useEffect(() => {
    if (!key) return;

    const [, , step] = key.split(":");
    if (!step) return;
    traverseSet.mutateAsync(key).then((data) => {
      if (!data?.traverse) return;
      setTraverseStep(data?.traverse);
    });
  }, [key]);
};

export default usePrefetchWizardTraverse;
