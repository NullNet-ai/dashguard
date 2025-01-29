import StepOneBasicDetails from "./_1";
import ConfirmationSummary from "./_2";

const roleWizardSummary = ({
  identifier,
  mainEntity,
}: {
  identifier: string;
  mainEntity: string;
}) => {
  return {
    one: StepOneBasicDetails,
    two: ConfirmationSummary,
  };
};

export default roleWizardSummary;
