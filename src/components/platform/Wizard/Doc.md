# Let's create a markdown file named Doc.md with the content provided by the user

markdown_content = """

## Wizard Application Documentation

## Overview

This documentation describes the structure and setup of a wizard-based application in a Next.js environment, specifically focusing on dynamic components and multi-step forms.

## Table of Contents

1. [Layout Overview](#layout-overview)
2. [Dynamic Page Setup](#dynamic-page-setup)
3. [Components](#components)
4. [Wizard Configuration](#wizard-configuration)
5. [How to Add a New Step](#how-to-add-a-new-step)

---

## Layout Overview

The `WizardLayout` component wraps around the entire wizard flow. It manages the wizard state and passes key configuration options to the `Wizard` component.

### Layout.tsx

```tsx
import React from "react";
import Wizard from "~/components/platform/Wizard";

type Props = {
  children?: React.ReactNode;
  params: { steps: string; identifier: string };
};

const WizardLayout = ({ params, children }: Props) => {
  return (
    <Wizard
      config={{
        currentStep: +params?.steps, // The current step in the wizard
        entityIdentifier: params?.identifier, // Entity identifier (e.g., contact, location)
        totalSteps: 3, // Total number of steps in the wizard
        enableAutoCreate: false, // Determines if auto-creation is enabled
      }}
    >
      <div>{children}</div>
    </Wizard>
  );
};

export default WizardLayout;
```

### Key Configuration Options

- **currentStep**: Defines the current active step in the wizard.
- **entityIdentifier**: Identifier for the entity (e.g., contact, location) being managed in the wizard.
- **totalSteps**: Total number of steps in the wizard process.
- **enableAutoCreate**: Boolean that determines if the wizard should automatically create the entity.

---

## Dynamic Page Setup

Each step in the wizard dynamically loads a component based on the step number, making the application flexible for multiple forms and pages.

### Page.tsx

```tsx
import * as COMPONENTS from "../../_component";
import { INewProps } from "../../types";

const NotAvailable = () => (
  <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
    <div className="text-center">
      <p className="text-base font-semibold text-indigo-600">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        Component not available
      </h1>
      <p className="mt-6 text-base leading-7 text-gray-600">
        Sorry, we couldn’t find the component you’re looking for.
      </p>
    </div>
  </main>
);

export default function Page({ params }: INewProps) {
  const wizardComponent = ["ContactContainer", "BasicContainer"];
  const Components =
    COMPONENTS?.[wizardComponent[+params.steps - 1]] ?? NotAvailable;

  return <Components params={params} />;
}
```

### Key Logic

- **wizardComponent Array**: Contains the components to be dynamically loaded for each step in the wizard.
- **Dynamic Component Resolution**: Based on the current step (`params.steps`), the respective component is loaded.
- **Fallback**: If the component for a given step doesn’t exist, a `404`-like `NotAvailable` component is rendered.

---

## Components

The application dynamically imports the required components for each wizard step. For example:

- **ContactContainer**: Handles contact-related forms or data.
- **BasicContainer**: A basic form for generic use cases.

These components are imported via dynamic imports to ensure that only the required component is loaded for the given step.

---

## Wizard Configuration

### Wizard Configuration Object

In `Layout.tsx`, the `Wizard` component is passed a configuration object:

```tsx
config={{
  currentStep: +params?.steps,          // Current step number
  entityIdentifier: params?.identifier, // Unique identifier for the entity
  totalSteps: 3,                        // Total number of steps
  enableAutoCreate: false               // Whether to auto-create an entity
}}
```

- **currentStep**: Controls the current step being rendered.
- **entityIdentifier**: Tracks which entity (e.g., contact, location) is being processed in the wizard.
- **totalSteps**: Specifies how many steps exist in total for the wizard.
- **enableAutoCreate**: Enables or disables automatic creation of entities during the wizard flow.

---

## Directory Structure

Here is the directory structure for the wizard application:

``` ts
Wizard Route : http://localhost/<entity>/<new>/<_id>/<1 , 2 , 3>
e.g = http://localhost/contact/wizard/123fdsrer23nu3g43/1
```

```bash
(wizard)
  └── new
      ├── _component         # Contains the individual step components
      └── [identifier]       # Dynamic routing for entity identifiers
          └── [steps]        # Dynamic routing for step numbers
              ├── layout.tsx  # Layout file for the wizard
              └── page.tsx    # Page file for dynamically loading components
```

---

## How to Add a New Step

To add a new step to the wizard:

1. **Create a New Component**:
   Create a new component (e.g., `NewStepComponent`) in the `components/_component` folder that will be used for the new step.

   ```tsx
   const NewStepComponent = ({ params }) => {
     return <div>This is the new step!</div>;
   };
   ```

2. **Update the Component List**:
   Add the new component to the `wizardComponent` array in `Page.tsx`:

   ```tsx
   const wizardComponent = [
     "ContactContainer",
     "BasicContainer",
     "NewStepComponent"  // Add the new component here
   ];
   ```

3. **Adjust the Total Steps**:
   Update the `totalSteps` configuration in `Layout.tsx`:

   ```tsx
   <Wizard
     config={{
       currentStep: +params?.steps,
       entityIdentifier: params?.identifier,
       totalSteps: 4,  // Increase total steps to include the new step
       enableAutoCreate: false,
     }}
   >
   ```

4. **Ensure Routing**:
   Make sure the routing logic in Next.js properly passes the step number to the wizard. Each step corresponds to a dynamic route.

---

## Conclusion

This structure allows the application to handle multi-step wizards dynamically by importing the necessary component based on the step number. It is modular, scalable, and easily extendable for more steps or features.
"""
