
# Form Integration Documentation

## Overview

This documentation outlines the integration of the `BasicDetails` component within the wizard application. The `BasicDetails` component leverages the `FormBuilder` to create a dynamic form and integrates seamlessly with the wizard flow.

## Table of Contents

1. [Component Structure](#component-structure)
2. [Form Schema](#form-schema)
3. [Handling Form Submission](#handling-form-submission)
4. [Dynamic Component Rendering](#dynamic-component-rendering)

---

## Wizard hooks

1. [useRegisterWizardHandler](#component-structure)
2. [..soon]

---

## Hooks

```tsx
useRegisterWizardHandler("form", "BasicDetails");
```

### Hooks description

### 1. `useRegisterWizardHandler`

This hook is used to register a wizard form handler in the context of a multi-step wizard application.

#### Parameters

- **`applicationKey`**:
  - A string representing the type of application or form being registered. The initial implementation uses `"form"` as the default application key, which denotes standard form submissions. Future enhancements may include additional types, such as `"custom"` or others, to accommodate various form behaviors and requirements within the wizard context.
  
- **`formKey`**:
  - A string that uniquely identifies the specific form being registered within the wizard. This is essential for tracking the form's state and handling validation properly.

#### Purpose

This hook allows each form within the wizard to register its handler, ensuring that the form's save operations are properly managed and validated. It is crucial for integrating with the asynchronous nature of form submissions, particularly to handle success and error states effectively.

By utilizing this hook, forms can be dynamically registered and managed, ensuring that the overall wizard flow adheres to validation rules and can prevent navigation to subsequent steps if any form encounters errors.

## Component Structure

The `BasicDetails` component is structured as follows:

## Note

``` tsx
**Ensure that you utilize Promise.resolve() and Promise.reject() for each API call within the form handler. This is crucial for properly executing the registered form for each step in the wizard. If any form encounters an error during validation or submission, the wizard navigation will be halted, preventing progression to the next step.

Incorporate both resolve and reject within your save flow structure when using the useRegisterWizardHandler. This guarantees that any form errors are handled appropriately, and the user remains on the current step until all validations are successfully passed.**
```

```tsx
"use client";

import { z } from "zod";
import { FormBuilder }  from "~/components/platform/FormBuilder";

import { IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { Contact } from "~/auto-generated";
import { useState } from "react";
import { INewProps } from "../(wizard)/wizard/types";
import useRegisterWizardHandler from "~/components/platform/Wizard/Hooks/useRegisterWizardHandler";

const FormSchema = Contact.ZodSchema;

export default function BasicDetails({ params }: INewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async ({
    data,
    form,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    // Implementation for saving data goes here
    try {
      setIsSubmitting(true);
      // Here, you would handle your save logic (e.g., API call)
      await saveContact(data);
      return Promise.resolve(); // Resolve if successful
    } catch (error) {
      return Promise.reject(new Error("Failed to save contact.")); // Reject if error occurs
    } finally {
      setIsSubmitting(false);
    }
  };

  useRegisterWizardHandler("form", "BasicDetails"); // Registering the form handler

  return (
    <FormBuilder
      formProps={params}
      formLabel="Basic Details"
      handleSubmit={handleSave}
      formKey="BasicDetails"
      formSchema={FormSchema}
      fields={[
        {
          id: "first_name",
          formType: "input",
          placeholder: "First Name",
          name: "first_name",
          label: "First Name",
        },
        {
          id: "last_name",
          formType: "input",
          placeholder: "Last Name",
          name: "last_name",
          label: "Last Name",
        },
      ]}
    />
  );
}
```

## Form Schema

The `FormSchema` is defined using Zod, ensuring that the data conforms to the expected structure before submission. The `Contact.ZodSchema` defines the validation rules for the form fields.

## Handling Form Submission

The `handleSave` function is responsible for processing the form submission. It accepts the form data and performs the necessary operations, such as saving the data or invoking an API call.

### Note

When the "Next" button is clicked, each form will be validated and saved before moving to the next form.

## Dynamic Component Rendering

The `BasicDetails` component is designed to be rendered dynamically within the wizard based on the current step. The wizard routes are structured to expect components with the following type:

```ts
export interface INewProps {
    children?: React.ReactNode;
    params: { steps: string; identifier: string };
}
```

This interface allows for passing dynamic parameters into the component, enabling tailored functionality based on the current step in the wizard.

---

## Conclusion

The integration of the `BasicDetails` component into the wizard application enhances the user experience by providing a structured form flow that is validated at each step. This modular approach allows for easy addition of new components as needed.
