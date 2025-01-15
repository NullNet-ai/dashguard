import React from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  HomeIcon,
  TrashIcon,
  PlusIcon,
  EnvelopeIcon,
  DocumentPlusIcon,
  CogIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "~/components/ui/badge";

const ButtonPlayground = () => {
  // Define button variants and sizes to showcase
  const variants = [
    { variant: "default", label: "Default" },
    { variant: "destructive", label: "Destructive/Danger" },
    { variant: "secondary", label: "Secondary" },
    { variant: "outline", label: "Outline" },
    {variant: "soft", label: "Soft"},
    { variant: "ghost", label: "Ghost" },
    { variant: "link", label: "Link" },
    
  ];

  const sizes = [
    { size: "sm", label: "Small Button Size" },
    { size: "md", label: "Medium Button Size" },
    { size: "lg", label: "Large Button Size" },
  ];

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
          Button Playground
        </h1>

        {/* Variants Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-700">
            Button Variants
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {variants.map(({ variant, label }) => (
              <div key={variant} className="flex flex-col space-y-2">
                <Label>{label}</Label>
                <Button
                  variant={variant as any}
                  className="justify-center"
                >
                  Button
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Sizes Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-700">
            Button Sizes
          </h2>
          <div className="flex justify-evenly items-center">
            {sizes.map(({ size, label }) => (
              <div key={size} className="flex flex-col space-y-2 items-center">
                <Label>{label}</Label>
                <Button
                  key={size}
                  size={size as any}
                  variant="default"
                  className="justify-center"
                >
                  Button
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Icons Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-700">
            Buttons with Icons
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="flex flex-col space-y-2">
              <Label>Home Navigation Button with Left Icon</Label>
              <Button Icon={HomeIcon} iconPlacement="left">
                Button
              </Button>
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Create Item Button with Right Icon</Label>
              <Button Icon={PlusIcon} iconPlacement="right">
                Button
              </Button>
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Document Creation Outline Button</Label>
              <Button Icon={DocumentPlusIcon} variant="outline">
                Button
              </Button>
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Destructive Delete Button with Left Icon</Label>
              <Button Icon={TrashIcon} variant="destructive" iconPlacement="left">
                Button
              </Button>
            </div>
          </div>
        </section>

        {/* Loading States */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-gray-700">
            Loading States
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="flex flex-col space-y-2">
              <Label>Loading State Button Left</Label>
              <Button loading variant="default" iconPlacement="left">
                Button
              </Button>
            
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Loading State Button Right</Label>
              <Button loading variant="default" iconPlacement="right">
                Button
              </Button>
            
            </div>
          </div>
        </section>

         {/* Circular Buttons Section */}
         <section className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-700">
            Circular Buttons
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="flex flex-col space-y-2 items-center">
              <Label>Default Circular Button</Label>
              <Button 
                variant="default" 
                size="icon" 
                className="rounded-full"
              >
                <PlusIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Outline Circular Button</Label>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
              >
                <CogIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Destructive Circular Button</Label>
              <Button 
                variant="destructive" 
                size="icon" 
                className="rounded-full"
              >
                <TrashIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Ghost Circular Button</Label>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
              >
                <StarIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Secondary Circular Button</Label>
              <Button 
                variant="secondary" 
                size="icon" 
                className="rounded-full"
              >
                <EnvelopeIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Loading Circular Button</Label>
              <Button 
                variant="default" 
                size="icon" 
                className="rounded-full"
                loading
                />
            </div>
          </div>
        </section>


         {/* Badges/Pills Section */}
         <section className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-700">
            Badges / Pills
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="flex flex-col space-y-2 items-center">
              <Label>Default Badge</Label>
              <Badge variant="default">Default</Badge>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Secondary Badge</Label>
              <Badge variant="secondary">Secondary</Badge>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Success Badge</Label>
              <Badge variant="success">Success</Badge>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Destructive Badge</Label>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Outline Badge</Label>
              <Badge variant="outline">Outline</Badge>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Primary Badge</Label>
              <Badge variant="primary">Primary</Badge>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Badges with Icons</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="success">
                  <StarIcon className="mr-1 h-3 w-3" /> Success
                </Badge>
                <Badge variant="destructive">
                  <TrashIcon className="mr-1 h-3 w-3" /> Danger
                </Badge>
              </div>
            </div>
          </div>
        </section>


        {/* Disabled Buttons Section */}
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-700">
            Disabled Buttons
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {variants.map(({ variant, label }) => (
              <div key={variant} className="flex flex-col space-y-2">
                <Label>{label} Disabled Button</Label>
                <Button
                  variant={variant as any}
                  disabled
                  className="justify-center"
                >
                  Disabled
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Disabled Badges Section */}
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-700">
            Disabled Badges
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="flex flex-col space-y-2 items-center">
              <Label>Default Disabled Badge</Label>
              <Badge variant="default" className="opacity-50 cursor-not-allowed">
                Disabled
              </Badge>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Secondary Disabled Badge</Label>
              <Badge variant="secondary" className="opacity-50 cursor-not-allowed">
                Disabled
              </Badge>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Success Disabled Badge</Label>
              <Badge variant="success" className="opacity-50 cursor-not-allowed">
                Disabled
              </Badge>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Destructive Disabled Badge</Label>
              <Badge variant="destructive" className="opacity-50 cursor-not-allowed">
                Disabled
              </Badge>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Outline Disabled Badge</Label>
              <Badge variant="outline" className="opacity-50 cursor-not-allowed">
                Disabled
              </Badge>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Primary Disabled Badge</Label>
              <Badge variant="primary" className="opacity-50 cursor-not-allowed">
                Disabled
              </Badge>
            </div>
            <div className="flex flex-col space-y-2 items-center">
              <Label>Disabled Badges with Icons</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="success" className="opacity-50 cursor-not-allowed">
                  <StarIcon className="mr-1 h-3 w-3" /> Disabled
                </Badge>
                <Badge variant="destructive" className="opacity-50 cursor-not-allowed">
                  <TrashIcon className="mr-1 h-3 w-3" /> Disabled
                </Badge>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ButtonPlayground;