import { useEffect } from "react";
import numberToWords from "../Utils/steptoWords";

const useTraverseStepped = (
  currentStep: number | null,
  setTraverseStep: (
    value: React.SetStateAction<Record<string, "Stepped">>,
  ) => void,
) => {
  useEffect(() => {
    if (!currentStep) return;
    // Every current step should be marked as Stepped
    setTraverseStep((prev) => ({
      ...prev,
      [numberToWords(currentStep)]: "Stepped",
    }));
  }, [currentStep]);
};

export default useTraverseStepped;
