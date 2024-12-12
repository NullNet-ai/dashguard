import { isEqual } from "lodash";
import { useEffect, useRef } from "react";

const useDeepCompareEffect = (
  callback: React.EffectCallback,
  dependencies: unknown[],
) => {
  const currentDependenciesRef = useRef<unknown[]>([]);
  const previousDependenciesRef = useRef<unknown[]>([]);

  if (!isEqual(currentDependenciesRef.current, dependencies)) {
    previousDependenciesRef.current = currentDependenciesRef.current;
    currentDependenciesRef.current = dependencies;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, [currentDependenciesRef.current]);
};

export default useDeepCompareEffect;
