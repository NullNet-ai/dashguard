import BasicDetailsSummary from "./_1";
import BasicDetailsSummaryTwo from "./_2";

const WizardSummaryComponent = ({
  identifier,
  mainEntity,
}: {
  identifier: string;
  mainEntity: string;
}) => {
  return {
    one: {
      label: "Step 1",
      required: true,
      components: [
        {
          label: "Record Details",
          component: (
            <BasicDetailsSummary
              form_key={"BasicDetails"}
              identifier={identifier!}
              entity={mainEntity!}
            />
          ),
        },
      ],
    },
    two: {
      label: "Step 2",
      required: true,
      components: [
        {
          label: "Record Details",
          component: (
            <BasicDetailsSummaryTwo
              form_key={"BasicDetailsTwo"}
              identifier={identifier!}
              entity={mainEntity!}
            />
          ),
        },
      ],
    },
  };
};

export default WizardSummaryComponent;
