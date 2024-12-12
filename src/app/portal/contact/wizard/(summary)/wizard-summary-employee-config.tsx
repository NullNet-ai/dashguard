import StepOneBasicDetails from "../(summary)/_1";
import StepTwoCategory from "./_2";
import WizardSummaryStepThreeEmployee from "./_3/wizardSummaryStepThreeApplicant";

const contactWizardSummaryEmployee = ({
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
            <WizardSummaryStepThreeEmployee
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

export default contactWizardSummaryEmployee;
