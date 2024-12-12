import StepOneBasicDetails from "../(summary)/_1";
import StepTwoCategory from "./_2";
import WizardSummaryStepThreeApplicant from "./_3/wizardSummaryStepThreeEmployee";

const contactWizardSummaryApplicant = ({
  identifier,
  mainEntity,
}: {
  identifier: string;
  mainEntity: string;
}) => {
  return {
    one: {
      label: "Step 1",
      required: false,
      components: [
        {
          label: "Basic Details",
          component: (
            <StepOneBasicDetails
              form_key={"ContactsOne"}
              identifier={identifier!}
            />
          ),
        },
      ],
    },
    two: {
      label: "Step 2",
      required: false,
      components: [
        {
          label: "Category Details",
          component: (
            <StepTwoCategory
              form_key={"ContactCategoryDetails"}
              identifier={identifier!}
              main_entity={mainEntity!}
            />
          ),
        },
      ],
    },
    three: {
      label: "Step 3",
      required: true,
      components: [
        {
          component: (
            <WizardSummaryStepThreeApplicant
              form_key={"ContactsThree"}
              identifier={identifier!}
              main_entity={mainEntity!}
            />
          ),
          label: "Basic Details 2",
        },
      ],
    },
  };
};

export default contactWizardSummaryApplicant;
