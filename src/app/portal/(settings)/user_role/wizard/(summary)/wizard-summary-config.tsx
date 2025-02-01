import StepOneBasicDetails from './_1'
import StepTwoCategoryDetails from './_2'
import ConfirmationSummary from './_3'

const roleWizardSummary = () => {
  return {
    one: StepOneBasicDetails,
    two: StepTwoCategoryDetails,
    three: ConfirmationSummary,
  }
}

export default roleWizardSummary
