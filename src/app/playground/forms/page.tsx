import TimePickerDetails from "./_form-controls/time-picker";
import { Toaster } from "~/components/ui/sonner";
import SmartDateDetails from "./_form-controls/smart-date";
import InputDetails from "./_form-controls/textfield";
import MultiSelectDetails from "./_form-controls/multi-select";
import CheckboxDetails from "./_form-controls/checkbox";
import RadioDetails from "./_form-controls/radio";
import RichTextEditorDetails from "./_form-controls/rich-text-editor";
import NumberInputDetails from "./_form-controls/number-input";
import PasswordDetails from "./_form-controls/password";
import TextAreaDetails from "./_form-controls/textarea";
import EmailInputDetails from "./_form-controls/email-input";
import PhoneInputDetails from "./_form-controls/phone-input";
import AmountDetails from "./_form-controls/amount-field";
import ButtonPlayGround from "./_form-controls/button-playground";
import { Separator } from "~/components/ui/separator";
import AddressDetails from "./_form-controls/address";
import InputsGrid from "./_form-controls/inputs-grid";
import SelectDetails from "./_form-controls/select-details";
import FileDetails from "./_form-controls/file";
import SliderDetails from "./_form-controls/slider";
import MultiFieldForm from "./_form-controls/multifield";
import GroupTabView2 from "./_dummy-controls/multifield-view-2";

export default function PlatformPlayGround() {
  return (
    <>
      <ButtonPlayGround />
      <Separator className="my-6" />
      <div className="space-y-20 p-5">

        <section>
          <h2 className="mb-4 text-xl font-bold">Basic Inputs</h2>
          <div className="grid gap-4">
            <InputDetails />
            <TextAreaDetails />
            <NumberInputDetails />
            <PasswordDetails />
            <PhoneInputDetails />
          </div>
        </section>


      <section>
          <h2 className="mb-4 text-xl font-bold">Multi Field</h2>
          <div className="grid gap-4">
          <MultiFieldForm />

          
           
          </div>
          <Separator />
         <div className="mt-4">
         <h2 className="mb-4 text-xl font-bold">Group Tabs</h2>
          <div>
            <GroupTabView2 />
          </div>
         </div>
        </section>



        <Separator />

        <section>
          <h2 className="mb-4 text-xl font-bold">Date and Time</h2>
          <div className="grid gap-4">
            <TimePickerDetails />
            <SmartDateDetails />
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="mb-4 text-xl font-bold">Choices and Selections</h2>
          <div className="grid gap-4">
            <RadioDetails />
            <CheckboxDetails />
            <SelectDetails />
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="mb-4 text-xl font-bold">Specialized Inputs</h2>
          <div className="grid gap-4">
            <EmailInputDetails />
            <AmountDetails />
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="mb-4 text-xl font-bold">Complex Inputs</h2>
          <div className="grid gap-4">
            <AddressDetails />
            <RichTextEditorDetails />
            <FileDetails />
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="mb-4 text-xl font-bold">Other Inputs</h2>
          <div className="grid gap-4">
            <SliderDetails />
            <InputsGrid />
            <MultiSelectDetails />
          </div>
        </section>

        <Toaster />
      </div>
    </>
  );
}
