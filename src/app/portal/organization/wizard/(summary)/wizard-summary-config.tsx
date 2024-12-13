import OrganizationSummary from "./_1";
import ConfirmationSummary from "./_2";

const organizationWizardSummary = ({
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
          label: "Organization Details",
          component: (
            <OrganizationSummary
              form_key={"ContactsOne"}
              identifier={identifier!}
              main_entity={mainEntity!}
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

export default organizationWizardSummary;
