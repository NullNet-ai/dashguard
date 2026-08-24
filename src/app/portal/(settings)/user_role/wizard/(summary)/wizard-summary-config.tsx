import StepOneBasicDetails from './_1'
import ConfirmationSummary from './_2'

// WP-839: the Category Details step is removed and Confirmation is renumbered
// from step 3 to step 2, so the summary panel keys shift with it.
const roleWizardSummary = () => {
  return {
    one: StepOneBasicDetails,
    two: ConfirmationSummary,
  }
}

export default roleWizardSummary
