import RecordContactDetails from "../../../../../_components/forms/record-contact-details/server";
import { ConfirmationDetails } from "../../../../../_components/forms";

const FormContainer = async () => (
  <div className="space-y-2">
    <RecordContactDetails />
    <ConfirmationDetails />
  </div>
);
export default FormContainer;
