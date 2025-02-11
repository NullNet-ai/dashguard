'use client'
import React from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { ButtonWithDropdown } from '~/components/platform/ButtonWithDropdown';
import { formatAndCapitalize } from '~/lib/utils';
import { 
  HomeIcon, TrashIcon, PlusIcon, EnvelopeIcon, 
  DocumentPlusIcon, CogIcon, StarIcon 
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
    iconPlacement: "left" as const,
    className: "w-28 justify-center"
  },
  {
    label: "Create Item Button with Right Icon",
    Icon: PlusIcon,
    iconPlacement: "right" as const,
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

const IconButtonsSection = () => (
  <Section title="Buttons with Icons" columns={4}>
    {ICON_BUTTONS.map((config, index) => (
      <div key={index} className="flex flex-col space-y-2">
        <Label>{config.label}</Label>
        {/* @ts-expect-error Minor typescript error but is working*/}
        <Button {...config}>
          Button
        </Button>
      </div>
    ))}
  </Section>
);

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

const DisabledSection = () => (
  <>
    <Section title="Disabled Buttons" columns={7}>
      {BUTTON_VARIANTS.map(({ variant, label }) => (
        <div key={variant} className="flex flex-col space-y-2">
          <Label>{label}</Label>
          <Button variant={variant as any} disabled className="w-28 justify-center">
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

// Main Component
const ButtonPlayground = () => (
  <div className="min-h-screen p-8">
    <div className="flex flex-col">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
        Button Playground
      </h1>
      
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