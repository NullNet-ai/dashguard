import BasicDetailsSummary from "./_1";
import ContactDetailsSummary from "./_2";
import CategoryDetailsSummary from "./_3";
import ContactOrganizationSummary from "./_4";
import ConfirmationSummary from "./_5";

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
            <BasicDetailsSummary
              form_key={"ContactsOne"}
              identifier={identifier!}
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
          label: "Contact Details",
          component: (
            <ContactDetailsSummary
              form_key={"contact_details"}
              identifier={identifier!}
              main_entity={mainEntity!}
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
    four: {
      label: "Step 4",
      required: false,
      components: [
        {
          label: "Organization",
          component: (
            <ContactOrganizationSummary
              form_key={""}
              identifier={identifier!}
              main_entity={mainEntity!}
            />
          ),
        },
      ],
    },
    five: {
      label: "Step 5",
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

export default contactWizardSummary;
