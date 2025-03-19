'use client'
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupItem,
  CheckboxItem,
  RadioItem,
  RadioGroupButton,
  SwitchItem,
  DropdownItem,
  CustomItem
} from "~/components/ui/button-group";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { ButtonWithDropdown } from '~/components/platform/ButtonWithDropdown';
import { formatAndCapitalize } from '~/lib/utils';
import {
  HomeIcon, TrashIcon, PlusIcon, EnvelopeIcon,
  DocumentPlusIcon, CogIcon, StarIcon,
  ChevronLeftIcon, ChevronRightIcon, BookmarkIcon,
  CalendarIcon, CalendarDaysIcon,
  BellIcon,
  BellSlashIcon,
} from "@heroicons/react/24/outline";

// Configuration arrays
const BUTTON_VARIANTS = [
  { variant: "default", label: "Default" },
  { variant: "destructive", label: "Destructive/Danger" },
  { variant: "secondary", label: "Secondary" },
  { variant: "outline", label: "Outline" },
  { variant: "soft", label: "Soft" },
  { variant: "ghost", label: "Ghost" },
  { variant: "link", label: "Link" },
];

const BUTTON_SIZES = [
  { size: "sm", label: "Small Button Size" },
  { size: "md", label: "Medium Button Size" },
  { size: "lg", label: "Large Button Size" },
];

const ICON_BUTTONS = [
  {
    label: "Home Navigation Button with Left Icon",
    Icon: HomeIcon,
    iconPlacement: "left",
    className: "w-28 justify-center"
  },
  {
    label: "Create Item Button with Right Icon",
    Icon: PlusIcon,
    iconPlacement: "right",
    className: "w-28 justify-center"
  },
  {
    label: "Document Creation Outline Button",
    Icon: DocumentPlusIcon,
    variant: "outline",
    className: "w-28 justify-center"
  },
  {
    label: "Destructive Delete Button with Left Icon",
    Icon: TrashIcon,
    variant: "destructive",
    iconPlacement: "left",
    className: "w-28 justify-center"
  }
];

const CIRCULAR_BUTTONS = [
  { label: "Default", variant: "default", Icon: PlusIcon },
  { label: "Outline", variant: "outline", Icon: CogIcon },
  { label: "Destructive", variant: "destructive", Icon: TrashIcon },
  { label: "Ghost", variant: "ghost", Icon: StarIcon },
  { label: "Secondary", variant: "secondary", Icon: EnvelopeIcon },
  { label: "Loading", variant: "default", loading: true }
];

const BADGE_VARIANTS = [
  { variant: "default", label: "Default" },
  { variant: "secondary", label: "Secondary" },
  { variant: "success", label: "Success" },
  { variant: "destructive", label: "Destructive" },
  { variant: "outline", label: "Outline" },
  { variant: "primary", label: "Primary" }
];

// Reusable Section Component
const Section = ({ title, children, columns = 7 }: {
  title: string;
  children: React.ReactNode;
  columns?: number;
}) => (
  <section className="mb-12">
    <h2 className="mb-6 text-2xl font-semibold text-gray-700">{title}</h2>
    <div className={`grid grid-cols-2 gap-4 md:grid-cols-${columns}`}>
      {children}
    </div>
  </section>
);

// Variants Section Component
const VariantsSection = () => (
  <Section title="Button Variants" columns={7}>
    {BUTTON_VARIANTS.map(({ variant, label }) => (
      <div key={variant} className="flex flex-col space-y-2">
        <Label>{label}</Label>
        <Button variant={variant as any} className="justify-center w-fit">
          Button
        </Button>
      </div>
    ))}
  </Section>
);

// Sizes Section Component
const SizesSection = () => (
  <Section title="Button Sizes" columns={3}>
    {BUTTON_SIZES.map(({ size, label }) => (
      <div key={size} className="flex flex-col space-y-2 items-start">
        <Label>{label}</Label>
        <Button size={size as any} variant="default" className="justify-center w-fit">
          Button
        </Button>
      </div>
    ))}
  </Section>
);

// Icon Buttons Section Component
const IconButtonsSection = () => (
  <Section title="Buttons with Icons" columns={4}>
    {ICON_BUTTONS.map((config, index) => (
      <div key={index} className="flex flex-col space-y-2">
        <Label>{config.label}</Label>
        {/* @ts-expect-error will fix it later*/}
        <Button {...config}>
          Button
        </Button>
      </div>
    ))}
  </Section>
);

// Dropdown Buttons Section Component
const DropdownSection = () => (
  <Section title="Buttons with Dropdown" columns={7}>
    {BUTTON_VARIANTS.map(({ variant }) => (
      <div key={variant} className="flex flex-col space-y-2">
        <Label>{formatAndCapitalize(variant)} Dropdown Button</Label>
        <ButtonWithDropdown
          dropdownOptions={[
            { label: "Option 1", onClick: () => null },
            { label: "Option 2", onClick: () => null },
            { label: "Option 3", onClick: () => null },
          ]}
          buttonVariant={variant as any}
          buttonClassName="justify-center w-fit"
          buttonLabel="Dropdown Button"
        />
      </div>
    ))}
  </Section>
);

// Loading States Section Component
const LoadingStatesSection = () => (
  <Section title="Loading States" columns={4}>
    <div className="flex flex-col space-y-2">
      <Label>Loading State Button Left</Label>
      <Button loading className="w-28" variant="default" iconPlacement="left">
        Button
      </Button>
    </div>
    <div className="flex flex-col space-y-2">
      <Label>Loading State Button Right</Label>
      <Button loading className="w-28" variant="default" iconPlacement="right">
        Button
      </Button>
    </div>
  </Section>
);

// Circular Buttons Section Component
const CircularButtonsSection = () => (
  <Section title="Circular Buttons" columns={6}>
    {CIRCULAR_BUTTONS.map(({ label, variant, Icon, loading }, index) => (
      <div key={index} className="flex flex-col space-y-2">
        <Label>{label}</Label>
        <Button
          variant={variant as any}
          size="icon"
          className="rounded-full"
          loading={loading}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </Button>
      </div>
    ))}
  </Section>
);

// Badges Section Component
const BadgesSection = () => (
  <Section title="Badges / Pills" columns={7}>
    {BADGE_VARIANTS.map(({ variant, label }) => (
      <div key={variant} className="flex flex-col space-y-2 items-center">
        <Label>{label} Badge</Label>
        <Badge variant={variant as any}>
          {variant === "success" && <StarIcon className="mr-1 h-3 w-3" />}
          {variant === "destructive" && <TrashIcon className="mr-1 h-3 w-3" />}
          {label}
        </Badge>
      </div>
    ))}
  </Section>
);

// Disabled Components Section Component
const DisabledSection = () => (
  <>
    <Section title="Disabled Buttons" columns={7}>
      {BUTTON_VARIANTS.map(({ variant, label }) => (
        <div key={variant} className="flex flex-col space-y-2">
          <Label>{label}</Label>
          <Button variant={variant as any} disabled className="justify-center">
            Disabled
          </Button>
        </div>
      ))}
    </Section>

    <Section title="Disabled Badges" columns={7}>
      {BADGE_VARIANTS.map(({ variant, label }) => (
        <div key={variant} className="flex flex-col space-y-2 items-center">
          <Label>{label}</Label>
          <Badge
            variant={variant as any}
            className="opacity-50 cursor-not-allowed"
          >
            {variant === "success" && <StarIcon className="mr-1 h-3 w-3" />}
            {variant === "destructive" && <TrashIcon className="mr-1 h-3 w-3" />}
            Disabled
          </Badge>
        </div>
      ))}
    </Section>
  </>
);


// Button Group Section Component
const ButtonGroupSection = () => {
  const [activeTab, setActiveTab] = useState("Years");
  const [isChecked, setIsChecked] = useState(false);
  const [isComboChecked, setIsComboChecked] = useState(false);

  return (
    <Section title="Button Group" columns={5}>
      <div className="flex flex-col space-y-4">
        <Label>Basic</Label>
        <ButtonGroup>
          <ButtonGroupItem
            active={activeTab === "Years"}
            onClick={() => setActiveTab("Years")}
            variant={activeTab === "Years" ? "default" : "secondary"}
          >
            Years
          </ButtonGroupItem>
          <ButtonGroupItem
            active={activeTab === "Months"}
            onClick={() => setActiveTab("Months")}
            variant={activeTab === "Months" ? "default" : "secondary"}
          >
            Months
          </ButtonGroupItem>
          <ButtonGroupItem
            active={activeTab === "Days"}
            onClick={() => setActiveTab("Days")}
            variant={activeTab === "Days" ? "default" : "secondary"}
          >
            Days
          </ButtonGroupItem>
        </ButtonGroup>
      </div>

      <div className="flex flex-col space-y-4">
        <Label>Icon Only</Label>
        <ButtonGroup>
          <ButtonGroupItem Icon={ChevronLeftIcon} aria-label="Previous" />
          <ButtonGroupItem Icon={ChevronRightIcon} aria-label="Next" />
        </ButtonGroup>
      </div>

      <div className="flex flex-col space-y-4">
        <Label>With Stat</Label>
        <ButtonGroup>
          <ButtonGroupItem>
            <BookmarkIcon className="h-4 w-4 " />
            Bookmark
          </ButtonGroupItem>
          <CustomItem>
            <span className="rounded-full  px-1.5 py-0.5 text-xs">
              2k
            </span>
          </CustomItem>
        </ButtonGroup>
      </div>

      <div className="flex flex-col space-y-4">
        <Label>With Dropdown</Label>
        <ButtonGroup>
          <ButtonGroupItem>
            Save Changes
          </ButtonGroupItem>
          <DropdownItem
            dropdownOptions={[
              { label: "Option 1", onClick: () => null },
              { label: "Option 2", onClick: () => null },
            ]}
          >
          </DropdownItem>
        </ButtonGroup>
      </div>

      <div className="flex flex-col space-y-4">
        <Label>With Checkmark</Label>
        <CheckboxItem
          isChecked={isChecked}
          onCheckChange={setIsChecked}
        >
          Click to select
        </CheckboxItem>
      </div>

      <div className="flex flex-col space-y-4">
        <Label>With Checkmark & Dropdown</Label>
        <ButtonGroup>
          <CheckboxItem
            isChecked={isComboChecked}
            onCheckChange={setIsComboChecked}
          >
          </CheckboxItem>
          <DropdownItem
            dropdownOptions={[
              { label: "Option 1", onClick: () => null },
              { label: "Option 2", onClick: () => null },
            ]}
          >
            Unread messages
          </DropdownItem>
        </ButtonGroup>
      </div>
    </Section>
  );
};


// Add this new section component for RadioItem examples
const RadioButtonsSection = () => {
  const [selectedOption, setSelectedOption] = useState("option1");

  return (
    <Section title="Radio Button Groups" columns={3}>
      <div className="flex flex-col space-y-4">
        <Label>Radio Button Group</Label>
        <RadioGroupButton value={selectedOption} onValueChange={setSelectedOption}>
          <RadioItem value="option1">
            Option 1
          </RadioItem>
          <RadioItem value="option2">
            Option 2
          </RadioItem>
          <RadioItem value="option3">
            Option 3
          </RadioItem>
        </RadioGroupButton>
      </div>

      <div className="flex flex-col space-y-4">
        <Label>Radio with Icons</Label>
        <RadioGroupButton defaultValue="daily">
          <RadioItem value="daily">
            <CalendarDaysIcon className="h-4 w-4 " />
            Daily
          </RadioItem>
          <RadioItem value="weekly">
            <CalendarIcon className="h-4 w-4 " />
            Weekly
          </RadioItem>
          <RadioItem value="monthly">
            <CalendarDaysIcon className="h-4 w-4 " />
            Monthly
          </RadioItem>
        </RadioGroupButton>
      </div>

    </Section>
  );
};

// Add this new section component for SwitchItem examples
const SwitchButtonsSection = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(false);

  return (
    <Section title="Switch Button Groups" columns={3}>
      <div className="flex flex-col space-y-4">
        <Label>Basic Switch</Label>
        <SwitchItem
          isChecked={darkMode}
          onCheckedChange={setDarkMode}
        >
          Dark Mode
        </SwitchItem>
      </div>

      <div className="flex flex-col space-y-4">
        <Label>Switch with Icons</Label>
        <SwitchItem
          isChecked={notifications}
          onCheckedChange={setNotifications}
          leftIcon={<BellIcon className="h-3 w-3" />}
          rightIcon={<BellSlashIcon className="h-3 w-3" />}
        >
          Notifications
        </SwitchItem>
      </div>

      <div className="flex flex-col space-y-4">
        <Label>Switch in Button Group</Label>
        <ButtonGroup>
          <ButtonGroupItem>
            Auto Save
          </ButtonGroupItem>
          <SwitchItem
            isChecked={autoSave}
            onCheckedChange={setAutoSave}
            size="sm"
          />
        </ButtonGroup>
      </div>
    </Section>
  );
};

// Add this new section component for CheckboxItem examples
const CheckboxButtonsSection = () => {
  const [option1, setOption1] = useState(false);
  const [option2, setOption2] = useState(true);
  const [option3, setOption3] = useState(false);

  return (
    <Section title="Checkbox Button Groups" columns={3}>
      <div className="flex flex-col space-y-4">
        <Label>Basic Checkbox</Label>
        <CheckboxItem
          isChecked={option1}
          onCheckChange={setOption1}
        >
          Select Option
        </CheckboxItem>
      </div>

      <div className="flex flex-col space-y-4">
        <Label>Checkbox with Icon</Label>
        <CheckboxItem
          isChecked={option2}
          onCheckChange={setOption2}
        >
          <StarIcon className="h-4 w-4" />
          Featured Item
        </CheckboxItem>
      </div>

      <div className="flex flex-col space-y-4">
        <Label>Checkbox in Button Group</Label>
        <ButtonGroup>
          <CheckboxItem
            isChecked={option3}
            onCheckChange={setOption3}
          >
            Select
          </CheckboxItem>
          <ButtonGroupItem>
            View Details
          </ButtonGroupItem>
        </ButtonGroup>
      </div>
    </Section>
  );
};

// Add this new section component for DropdownItem examples
const DropdownButtonsSection = () => {
  return (
    <Section title="Dropdown Button Groups" columns={3}>
      <div className="flex flex-col space-y-4">
        <Label>Basic Dropdown</Label>
        <DropdownItem
          dropdownOptions={[
            { label: "Edit", onClick: () => null },
            { label: "Duplicate", onClick: () => null },
            { label: "Delete", onClick: () => null },
          ]}
        >
          Actions
        </DropdownItem>
      </div>

      <div className="flex flex-col space-y-4">
        <Label>Dropdown with Icon</Label>
        <DropdownItem
          dropdownOptions={[
            { label: "Last 7 days", onClick: () => null },
            { label: "Last 30 days", onClick: () => null },
            { label: "Last 90 days", onClick: () => null },
          ]}
        >
          <CalendarIcon className="h-4 w-4 " />
          Time Period
        </DropdownItem>
      </div>

      <div className="flex flex-col space-y-4">
        <Label>Dropdown in Button Group</Label>
        <ButtonGroup>
          <ButtonGroupItem>
            Filter Results
          </ButtonGroupItem>
          <DropdownItem
            dropdownOptions={[
              { label: "Name (A-Z)", onClick: () => null },
              { label: "Date (Newest)", onClick: () => null },
              { label: "Price (Low-High)", onClick: () => null },
            ]}
          />
        </ButtonGroup>
      </div>
    </Section>
  );
};

// Main Component - update to include the new sections
const ButtonPlayground = () => (
  <div className="min-h-screen p-8">
    <div className="flex flex-col">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
        Button Playground
      </h1>

      <ButtonGroupSection />
      <CheckboxButtonsSection />
      <DropdownButtonsSection />
      <RadioButtonsSection />
      <SwitchButtonsSection />
      <VariantsSection />
      <SizesSection />
      <IconButtonsSection />
      <DropdownSection />
      <LoadingStatesSection />
      <CircularButtonsSection />
      <BadgesSection />
      <DisabledSection />
    </div>
  </div>
);

export default ButtonPlayground;