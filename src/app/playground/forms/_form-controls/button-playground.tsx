'use client'
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { 
  ButtonGroup, 
  ButtonGroupItem, 
  CheckboxItem,
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
  ChevronDownIcon
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
            { label: "Option 1", onClick: () => alert("Option 1") },
            { label: "Option 2", onClick: () => alert("Option 2") },
            { label: "Option 3", onClick: () => alert("Option 3") },
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

// Add new configuration for button groups
const BUTTON_GROUP_EXAMPLES = [
  {
    title: "Basic",
    items: [
      { label: "Years", active: true },
      { label: "Months", active: false },
      { label: "Days", active: false },
    ]
  },
  {
    title: "Icon Only",
    items: [
      { Icon: ChevronLeftIcon, "aria-label": "Previous" },
      { Icon: ChevronRightIcon, "aria-label": "Next" },
    ]
  },
  {
    title: "With Stat",
    items: [
      { Icon: BookmarkIcon, label: "Bookmark", stat: "2k" }
    ]
  },
  {
    title: "With Dropdown",
    items: [
      { label: "Save Changes", dropdown: true }
    ]
  },
  {
    title: "With Checkmark",
    items: [
      { label: "Selected option", checkbox: true }
    ]
  },
  {
    title: "With Checkmark & Dropdown",
    items: [
      { label: "Unread messages", checkbox: true, dropdown: true }
    ]
  }
];

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
            variant={activeTab === "Years"? "default" : "secondary"}
          >
            Years
          </ButtonGroupItem>
          <ButtonGroupItem 
            active={activeTab === "Months"} 
            onClick={() => setActiveTab("Months")}
            variant={activeTab === "Months"? "default" : "secondary"}
          >
            Months
          </ButtonGroupItem>
          <ButtonGroupItem 
            active={activeTab === "Days"} 
            onClick={() => setActiveTab("Days")}
            variant={activeTab === "Days"? "default" : "secondary"}
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
            <BookmarkIcon className="h-4 w-4 mr-2" />
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
              { label: "Option 1", onClick: () => alert("Option 1") },
              { label: "Option 2", onClick: () => alert("Option 2") },
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
              { label: "Option 1", onClick: () => alert("Option 1") },
              { label: "Option 2", onClick: () => alert("Option 2") },
            ]}
          >
            Unread messages
          </DropdownItem>
        </ButtonGroup>
      </div>
    </Section>
  );
};

// Add these imports at the top of the file
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Switch } from "~/components/ui/switch";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

// Add this new section component for CustomItem examples
const CustomItemsSection = () => {
  const [radioValue, setRadioValue] = useState("option1");
  const [switchValue, setSwitchValue] = useState(false);
  
  return (
    <Section title="Custom Button Group Items" columns={3}>
      <div className="flex flex-col space-y-4">
        <Label>With Radio Group</Label>
        <ButtonGroup>
          <ButtonGroupItem>
            Filter By
          </ButtonGroupItem>
          <CustomItem>
            <RadioGroup 
              value={radioValue} 
              onValueChange={setRadioValue}
              className="flex flex-row gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option1" id="option1" />
                <label htmlFor="option1" className="text-sm">Option 1</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option2" id="option2" />
                <label htmlFor="option2" className="text-sm">Option 2</label>
              </div>
            </RadioGroup>
          </CustomItem>
        </ButtonGroup>
      </div>
      
      <div className="flex flex-col space-y-4">
        <Label>With Toggle Switch</Label>
        <ButtonGroup>
          <ButtonGroupItem>
            Theme
          </ButtonGroupItem>
          <CustomItem className="p-2 flex items-center">
            <Switch
              checked={switchValue}
              onCheckedChange={setSwitchValue}
              leftIcon={<SunIcon className="h-3 w-3" />}
              rightIcon={<MoonIcon className="h-3 w-3" />}
              size="sm"
            />
          </CustomItem>
        </ButtonGroup>
      </div>
      
      
    </Section>
  );
};

// Main Component - update to include the new section
const ButtonPlayground = () => (
  <div className="min-h-screen p-8">
    <div className="flex flex-col">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
        Button Playground
      </h1>
      
      <ButtonGroupSection />
      <CustomItemsSection />
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