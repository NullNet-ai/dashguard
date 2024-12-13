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
    one: {
      label: "Step 1",
      required: false,
      components: [
        {
          label: "Basic Details",
          component: (
            <StepOneBasicDetails
              main_entity={mainEntity!}
              form_key={"UserRolesBasicDetails"}
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
          label: "Confirmation",
          component: <ConfirmationSummary />,
        },
      ],
    },
  };
};

export default roleWizardSummary;
