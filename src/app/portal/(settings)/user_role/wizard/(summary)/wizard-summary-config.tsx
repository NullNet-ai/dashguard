import StepOneBasicDetails from "./_1";
import ConfirmationSummary from "./_2";

const roleWizardSummary = () => {
  return {
    one: StepOneBasicDetails,
    two: ConfirmationSummary,
  };
};

export default roleWizardSummary;
