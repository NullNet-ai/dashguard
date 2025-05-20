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
    setTraverseStep((prev) => {
      const updatedSteps = { ...prev };
      // Mark all previous steps including current as "Stepped"
      for (let i = 1; i <= currentStep; i++) {
        updatedSteps[numberToWords(i)] = "Stepped";
      }
      return updatedSteps;
    });
  }, [currentStep]);
};

export default useTraverseStepped;
