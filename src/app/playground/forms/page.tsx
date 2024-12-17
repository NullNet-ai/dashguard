"use client";

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
import { Toaster } from "~/components/ui/sonner";
import SmartDateDetails from "./_form-controls/smart-date";
import AmountDetails from "./_form-controls/amount-field";
import ButtonPlayGround from "./_form-controls/button-playground";
import { Separator } from "~/components/ui/separator";
import AddressDetails from "./_form-controls/address";
import InputsGrid from "./_form-controls/inputs-grid";
import SelectDetails from "./_form-controls/select-details";
import FileDetails from "./_form-controls/file";
import SliderDetails from "./_form-controls/slider";

export default function PlatformPlayGround() {
  return (
    <>
      <ButtonPlayGround />
      <Separator className="my-6" />
      <div className="space-y-20 p-5">
        <section>
          <h2 className="text-xl font-bold mb-4">Basic Inputs</h2>
          <div className="grid gap-4">
        <TextAreaDetails />
        <NumberInputDetails />
        <PasswordDetails />
        <PhoneInputDetails />
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-xl font-bold mb-4">Date and Time</h2>
          <div className="grid gap-4">
        <SmartDateDetails />
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-xl font-bold mb-4">Choices and Selections</h2>
          <div className="grid gap-4">
        <RadioDetails />
        <CheckboxDetails />
        <SelectDetails />
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-xl font-bold mb-4">Specialized Inputs</h2>
          <div className="grid gap-4">
        <EmailInputDetails />
        <AmountDetails />
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-xl font-bold mb-4">Complex Inputs</h2>
          <div className="grid gap-4">
        <AddressDetails />
        <RichTextEditorDetails />
        <FileDetails />
          </div>
        </section>

        {/* <Separator />

        <section>
          <h2 className="text-xl font-bold mb-4">Other Inputs</h2>
          <div className="grid gap-4">
        <SliderDetails />
        <InputsGrid />
        <MultiSelectDetails />
          </div>
        </section> */}

        <Toaster />
      </div>
    </>

  );
}
