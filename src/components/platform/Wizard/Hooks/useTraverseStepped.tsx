import { useEffect } from "react";
import numberToWords from "../Utils/steptoWords";

const useTraverseStepped = (
  currentStep: number,
  setTraverseStep: (
    value: React.SetStateAction<Record<string, "Stepped">>,
  ) => void,
) => {
  useEffect(() => {
    // Every current step should be marked as Stepped
    setTraverseStep((prev) => ({
      ...prev,
      [numberToWords(currentStep)]: "Stepped",
    }));
  }, [currentStep]);
};

export default useTraverseStepped;
