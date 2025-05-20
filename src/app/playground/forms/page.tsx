"use client";

import { useState } from "react";
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
import GroupTabView2 from "./_dummy-controls/multifield-view";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export default function PlatformPlayGround() {
  // Change the default value from "all" to "select"
  const [selectedComponent, setSelectedComponent] = useState<string>("select");
  
  // Define all components with their display names and component references
  const componentMap = {
    all: { label: "All Components", component: null },
    button: { label: "Button", component: ButtonPlayGround },
    input: { label: "Text Input", component: InputDetails },
    textarea: { label: "Text Area", component: TextAreaDetails },
    number: { label: "Number Input", component: NumberInputDetails },
    password: { label: "Password", component: PasswordDetails },
    phone: { label: "Phone Input", component: PhoneInputDetails },
    multifield: { label: "Multi Field", component: MultiFieldForm },
    grouptab: { label: "Group Tab", component: GroupTabView2 },
    timepicker: { label: "Time Picker", component: TimePickerDetails },
    smartdate: { label: "Smart Date", component: SmartDateDetails },
    radio: { label: "Radio", component: RadioDetails },
    checkbox: { label: "Checkbox", component: CheckboxDetails },
    select: { label: "Select", component: SelectDetails },
    multiselect: { label: "Multi Select", component: MultiSelectDetails },
    email: { label: "Email Input", component: EmailInputDetails },
    amount: { label: "Amount Field", component: AmountDetails },
    address: { label: "Address", component: AddressDetails },
    richtext: { label: "Rich Text Editor", component: RichTextEditorDetails },
    file: { label: "File Upload", component: FileDetails },
    slider: { label: "Slider", component: SliderDetails },
    inputsgrid: { label: "Inputs Grid", component: InputsGrid },
  };

  // Create a sorted array of components for the dropdown
  const componentOptions = Object.entries(componentMap).map(([key, value]) => ({
    value: key,
    label: value.label
  })).sort((a, b) => a.label.localeCompare(b.label));
  
  // Move "All Components" to the top
  const allComponentOption = componentOptions.find(option => option.value === "all");
  if (allComponentOption) {
    componentOptions.splice(componentOptions.indexOf(allComponentOption), 1);
    componentOptions.unshift(allComponentOption);
  }

  // Group components by category for "All Components" view
  const componentCategories = {
    basic: ["input", "textarea", "number", "password", "phone"],
    multi: ["multifield", "grouptab"],
    datetime: ["timepicker", "smartdate"],
    choices: ["radio", "checkbox", "select", "multiselect"],
    specialized: ["email", "amount"],
    complex: ["address", "richtext", "file"],
    other: ["slider", "inputsgrid"],
    buttons: ["button"],
  };

  // Render a specific component
  const renderComponent = (key: string) => {
    const Component = componentMap[key as keyof typeof componentMap]?.component;
    return Component ? <Component /> : null;
  };

  return (
    <>
      <div className="p-5 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Form Components</h1>
          <div className="w-64">
            <Select value={selectedComponent} onValueChange={setSelectedComponent}>
              <SelectTrigger>
                <SelectValue placeholder="Select component" />
              </SelectTrigger>
              <SelectContent>
                {componentOptions.map((component) => (
                  <SelectItem key={component.value} value={component.value}>
                    {component.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedComponent !== "all" ? (
          <div className="mt-6">
            <h2 className="mb-4 text-xl font-bold">{componentMap[selectedComponent as keyof typeof componentMap]?.label}</h2>
            {renderComponent(selectedComponent)}
          </div>
        ) : (
          <div className="space-y-20">
            <section>
              <h2 className="mb-4 text-xl font-bold">Buttons</h2>
              <ButtonPlayGround />
            </section>
            
            <Separator />

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

            <Separator />

            <section>
              <h2 className="mb-4 text-xl font-bold">Multi Field</h2>
              <div className="grid gap-4">
                <MultiFieldForm />
              </div>
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
                <MultiSelectDetails />
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
              </div>
            </section>
          </div>
        )}
      </div>
      <Toaster />
    </>
  );
}
