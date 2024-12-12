import StepOneBasicDetails from "./_1";
import CategoryDetailsSummary from "./_3";

const contactWizardSummary = ({
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
    three: {
      label: "Step 3",
      required: false,
      components: [
        {
          label: "Category Details",
          component: (
            <CategoryDetailsSummary
              form_key={"ContactCategoryDetails"}
              identifier={identifier!}
              main_entity={mainEntity!}
            />
          ),
        },
      ],
    },
  };
};

export default contactWizardSummary;
