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

export default function PlatformPlayGround() {
  return (
    <>
      <ButtonPlayGround />
      <Separator className="my-6" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FileDetails/>
        <InputsGrid />
        <AddressDetails />
        <MultiSelectDetails />
        <AmountDetails />
        <SmartDateDetails />
        <TextAreaDetails />
        <PasswordDetails />
        <RadioDetails />
        <NumberInputDetails />
        <PhoneInputDetails />
        <EmailInputDetails />
        <InputDetails />
        <AmountDetails />
        <CheckboxDetails />
        <RichTextEditorDetails />
        <SelectDetails />
        {/* <DateRangeDetails />
        <FileDetails />
        <InputsDetails />
        <InputLabelValueDetails />
        <SliderDetails /> */}
        <Toaster />
      </div>
    </>
  );
}
