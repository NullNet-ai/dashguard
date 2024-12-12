# Form Builder

Form Builder is a custom typesafety component that automatically builds forms based on the schema provided, powered by [Zod](https://zod.dev/) and [React Hook Form](https://react-hook-form.com/). It makes creating forms with validations and error messages easy.

## Table of Contents

This guide will show you how to use `FormBuilder` component to build your forms. We'll cover the following topics:

- [Form Builder](#form-builder)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Output](#output)
  - [Examples](#examples)
    - [`With All Basic Inputs`](#with-all-basic-inputs)
    - [`With All Choice Inputs`](#with-all-choice-inputs)
    - [`With Multiple Inputs`](#with-multiple-inputs)
    - [`With Async Search and Debounce (Multi-Select Only)`](#with-async-search-and-debounce-multi-select-only)
  - [API References](#api-references)
    - [`Properties`](#properties)
    - [`fields: IField[]`](#fields-ifield)
      - [`fields props`](#fields-props)
    - [`selectOptions:Record<string, ISelectOptions[]>`](#selectoptionsrecordstring-iselectoptions)
    - [`defaultValues: Record<string, any>`](#defaultvalues-recordstring-any)
    - [`checkboxOptions: Record<string, ICheckboxOptions[]>`](#checkboxoptions-recordstring-icheckboxoptions)
    - [`multiSelectOptions: Record<string, Option[]>`](#multiselectoptions-recordstring-option)
    - [`onSearchSelectOption: Record<string, (search: string) => Promise<Option[]>>`](#onsearchselectoption-recordstring-search-string--promiseoption)
    - [`formSchema: z.ZodObject<any, any> | z.ZodEffects<z.ZodObject<any, any>>`](#formschema-zzodobjectany-any--zzodeffectszzodobjectany-any)
    - [`radioOptions: Record<string, IRadioOptions[]>`](#radiooptions-recordstring-iradiooptions)
    - [`handleSubmit: (args: IHandleSubmit) => void`](#handlesubmit-args-ihandlesubmit--void)
    - [`formKey: string`](#formkey-string)
    - [`formLabel: string`](#formlabel-string)
    - [`onFormChange: (form: IOnFormListen) => void`](#onformchange-form-ionformlisten--void)
    - [`isButtonLoading: boolean`](#isbuttonloading-boolean)
    - [`fetching: boolean`](#fetching-boolean)
    - [`customRender: (form: UseFormReturn<{ [x: string]: any }, any, undefined>) => ReactElement<typeof FormField> | ReactElement<typeof FormField>[]`](#customrender-form-useformreturn-x-string-any--any-undefined--reactelementtypeof-formfield--reactelementtypeof-formfield)

## Installation

To get started, create a new Next.js or any React project and then install `@dna-platform/form-builder` and `zod`.

```bash
npm install @dna-platform/form-builder zod
```

## Usage

First, create a schema using Zod. For more details, refer to the [Zod documentation](https://zod.dev/).

Usually, you will be importing an already defined Zod schema from the database team. However, you may also need to create your own Zod schema to override certain aspects, such as custom validation error messages or stricter validations. To achieve this, simply wrap the provided Zod schema from the database team.

Here's a basic example:

```javascript
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").array(),
  age: z.number().min(18, "You must be at least 18 years old"),
});
```

This code uses `Zod` to create a schema that validates an object with `name`, `email`, and `age` fields. It ensures that:

- `name` is a non-empty string,
- `email` is valid,
- `age` is a number and at least 18.

Next, use this schema with the Form Builder component:

```javascript
import { FormBuilder } from "@dna-platform/form-builder";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.array(z.string().email("Invalid email address")),
});

const ExampleForm = () => {
  return (
    <FormBuilder
      formSchema={schema}
      formKey="BasicForm" //your form key
      fields={[
         {
          id: "name",
          label: "Name",
          placeholder: "Name",
          name: "Name",
          required: true,
          formType: "input",
        },
        {
          id: "email",
          label: "Email",
          name: "Email",
          formType: "email-input",
          required: true,
        },
      ]}
      handleSubmit={(data) => {
        console.log("Form data:", data);
      }}
    />
  );
};

export default ExampleForm;
```

The `FormBuilder` component is responsible for rendering the form based on the provided schema and configuration. Here's a breakdown of the `FormBuilder`:

```javascript
<FormBuilder
    formSchema={schema}
```

- **`formSchema`**:  
  This prop is assigned the `schema` created using `Zod`. It defines the validation rules for the form fields, ensuring that the input meets the specified criteria.

```javascript
formKey = "BasicForm";
```

- **`formKey`**:  
  This unique identifier (`BasicForm`) helps manage the form state and data submission. It distinguishes this form from other forms that may exist in the application.

```javascript
  fields={[
       {
          id: "name",
          label: "Name",
          placeholder: "Name",
          name: "Name",
          required: true,
          formType: "input",
        },
        {
          id: "email",
          label: "Email",
          name: "Email",
          formType: "email-input",
          required: true,
        },
   ]}
```

- **`fields`**:  
  An array of field configurations defining each input in the form:
  - Each object represents a form field with properties such as:
    - `id`: A unique identifier for the field.
    - `formType`: Specifies the type of input (e.g., "input" for a text field, "email-input" for an email field).
    - `placeholder`: The placeholder text displayed in the input field.
    - `name`: The name attribute for the input, used in form data submission.
    - `label`: The label displayed alongside the input field.

```javascript
  handleSubmit={(data) => {
    console.log("Form data:", data);
  }}
```

- **`handleSubmit`**:  
  A callback function that gets executed when the form is submitted. The `data` parameter contains the submitted form values, which are logged to the console in this case.

## Output

In a simple dashboard application, the form would look like this:

![Sample Dashboard](/public/sampleForms.png)
At the top, you see the form key `"BasicForm"` followed by the corresponding inputs:

- **`Name`**: A text input for the user's full name.
- **`Email`**: An email input for the user's email address.

The `FormBuilder` component includes a card layout and a submit button, represented by a ✔️ icon. It also features a  icon that can disable the entire form when necessary. Additionally, the `BugIcon` is used for custom debugging, capturing changes and tracking form values. While `BugIcon` provides basic debugging, you can use the more sophisticated `DevTools` from React Hook Form to track states such as dirty or touched.

## Examples

### `With All Basic Inputs`

```tsx
import { FormBuilder } from "@dna-platform/form-builder";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.array(z.string().email("Invalid email address")),
  age: z.string(z.number().min(18, "You must be at least 18 years old")),
  "booking-date": z.string(z.date().refine((date) => date >= new Date(), {
    message: "Booking date must be in the future.",
  })),
  "appointment-date":z.string() z.date().refine((date) => date >= new Date(), {
    message: "Appointment date must be in the future.",
  })),
  file: z.string().url(),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." })
    .max(500, {
      message: "Description must be less than 500 characters.",
    }),
  phone: z
    .array(
      z.object({
        phoneNumber: z
          .string()
          .min(5, "Phone number must be at least 5 characters."),
        isoCode: z.string().optional(),
        countryCode: z.string().optional(),
      }),
    )
    .min(1, "Please add at least one phone number."),
});

const ExampleForm = () => {
  return (
    <FormBuilder
      formSchema={schema}
      formKey="BasicForm" //your form key
      fields={[
        {
          id: "name",
          formType: "input",
          placeholder: "Full Name",
          name: "name",
          label: "Full Name",
        },
        {
          id: "age",
          formType: "input",
          placeholder: "Age",
          name: "age",
          label: "Age",
          type: "number",
        },
        {
          id: "email",
          formType: "email-input",
          placeholder: "email address",
          name: "email",
          label: "Email Address",
        },
        {
          id: "phone",
          formType: "phone-input",
          placeholder: "Phone Number",
          name: "phone",
          label: "Phone Number",
        },
        {
          id: "description",
          formType: "textarea",
          placeholder: "Description",
          name: "description",
          label: "Description",
        },
        {
          id: "booking-date",
          formType: "date-range",
          placeholder: "Booking Date",
          name: "booking-date",
          label: "Booking Date",
        },
        {
          id: "appointment-date",
          formType: "date",
          placeholder: "Appointment Date",
          name: "appointment-date",
          label: "Appointment Date",
        },
        {
          id: "file",
          formType: "file",
          placeholder: "File",
          name: "file",
          label: "File",
        },
      ]}
      handleSubmit={(data) => {
        console.log("Form data:", data);
      }}
    />
  );
};

export default ExampleForm;
```

### `With All Choice Inputs`

```tsx
import { z } from "zod";
import { FormBuilder }  from "~/components/platform/EnhancedFormBuilder";


const schema = z.object({
  hobbies: z.string(),
  skills: z.array(z.string()),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  preferredContact: z.enum(["email", "phone", "mail"]),
});

const MyForm = () => {
  return (
    <FormBuilder
      formSchema={schema}
      formKey="BasicForm" // your form key
      defaultValues={{
        name: "yourName",
        email: [{ email: "yourEmail@gmail.com" }],
        age: "16",
        hobbies: "coding",
        interests: ["sports", "music"],
      }}
      fields={[
        {
          id: "hobbies",
          name: "hobbies",
          formType: "select",
          label: "Hobbies",
          placeholder: "Select Hobbies",
        },
        {
          id: "interests",
          formType: "checkbox",
          name: "interests",
          label: "Interests",
        },
        {
          id: "skills",
          formType: "multi-select",
          placeholder: "Skills",
          name: "skills",
          label: "Skills",
        },
        {
          id: "gender",
          formType: "radio",
          name: "gender",
          label: "Gender",
        },
        {
          id: "preferredContact",
          formType: "radio",
          name: "preferredContact",
          label: "Preferred Contact Method",
        },
      ]}
      selectOptions={{
        hobbies: [
          { value: "reading", label: "Reading" },
          { value: "writing", label: "Writing" },
          { value: "coding", label: "Coding" },
        ],
      }}
      checkboxOptions={{
        interests: [
          { value: "sports", label: "Sports" },
          { value: "music", label: "Music" },
          { value: "travel", label: "Travel" },
        ],
      }}
      multiSelectOptions={{
        skills: [
          { label: "nextjs", value: "Nextjs" },
          { label: "React", value: "react" },
          { label: "Remix", value: "remix" },
          { label: "Vite", value: "vite" },
          { label: "Nuxt", value: "nuxt" },
          { label: "Vue", value: "vue" },
          { label: "Svelte", value: "svelte" },
          { label: "Angular", value: "angular" },
          { label: "Ember", value: "ember" },
          { label: "Gatsby", value: "gatsby" },
          { label: "Astro", value: "astro" },
        ],
      }}
      radioOptions={{
        gender: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" },
        ],
        preferredContact: [
          { value: "email", label: "Email" },
          { value: "phone", label: "Phone" },
          { value: "mail", label: "Mail" },
        ],
      }}
      handleSubmit={(data) => {
        console.log("Form data:", data);
      }}
    />
  );
};

export default MyForm;
```

### `With Multiple Inputs`

```tsx
import { z } from "zod";
import { FormBuilder }  from "~/components/platform/EnhancedFormBuilder";


const schema = z.object({
  name: z.array(z.string()),
});

const MyForm = () => {
  return (
    <FormBuilder
      formSchema={schema}
      formKey="BasicForm" // your form key
      fields={[
        {
          id: "name",
          formType: "inputs", //change input to inputs
          placeholder: "Full Name",
          name: "name",
          label: "Full Name",
          options: {
            inputsType: "multiple", //provide options to multple default is single
          },
        },
      ]}
      handleSubmit={(data) => {
        console.log("Form data:", data);
      }}
    />
  );
};

export default MyForm;
```

### `With Async Search and Debounce (Multi-Select Only)`

```tsx
"use client";

import { z } from "zod";
import { FormBuilder }  from "~/components/platform/EnhancedFormBuilder";


const schema = z.object({
  skills: z.array(z.string()),
});

type Option = {
  value: string;
  label: string;
};
const OPTIONS: Option[] = [
  { label: "nextjs", value: "Nextjs" },
  { label: "React", value: "react" },
  { label: "Remix", value: "remix" },
  { label: "Vite", value: "vite" },
  { label: "Nuxt", value: "nuxt" },
  { label: "Vue", value: "vue" },
  { label: "Svelte", value: "svelte" },
  { label: "Angular", value: "angular" },
  { label: "Ember", value: "ember" },
  { label: "Gatsby", value: "gatsby" },
  { label: "Astro", value: "astro" },
];

const mockSearch = async (value: string): Promise<Option[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const res = OPTIONS.filter((option) => option.value.includes(value));
      resolve(res);
    }, 1000);
  });
};

const MyForm = () => {
  return (
    <FormBuilder
      formSchema={schema}
      formKey="BasicForm" //your form key
     
      fields={[
        {
          id: "skills",
          formType: "multi-select",
          placeholder: "Skills",
          name: "skills",
          label: "Skills",
        },
      ]}
      multiSelectOptions={{
        skills: OPTIONS, //reuse the OPTIONS here
      }}
       onSearchSelectOption={{
        //default delay time is 500ms
        skills: async (value: string) => {
          const res = await mockSearch(value);
          return res;
        },
      }}
      handleSubmit={(data) => {
        console.log("Form data:", data);
      }}
    />
  );
};

export default MyForm;
```

## API References

Below are the API references for the `FormBuilder` component, detailing the available props and their descriptions.

### `Properties`

| Prop Name                                                                                                                                | Type                                                                                                                                | Description                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [fields](#fields-ifield)                                                                                                                 | `IField[]`                                                                                                                          | An array of field configurations for the form                         |
| [selectOptions](#selectoptionsrecordstring-iselectoptions)                                                                               | `Record<string, ISelectOptions[]>`                                                                                                  | Options for select fields, keyed by field name                        |
| [defaultValues](#defaultvalues-recordstring-any)                                                                                         | `Record<string, any>`                                                                                                               | Initial values for form fields                                        |
| [checkboxOptions](#checkboxoptions-recordstring-icheckboxoptions)                                                                        | `Record<string, ICheckboxOptions[]>`                                                                                                | Options for checkbox fields, keyed by field name                      |
| [multiSelectOptions](#multiselectoptions-recordstring-option)                                                                            | `Record<string, Option[]>`                                                                                                          | Options for multi-select fields, keyed by field name                  |
| [onSearchSelectOption](#onsearchselectoption-recordstring-search-string--promiseoption)                                                  | `Record<string, (search: string) => Promise<Option[]>>`                                                                             | Search function for select options, keyed by field name               |
| [formSchema](#formschema-zzodobjectany-any--zzodeffectszzodobjectany-any)                                                                | `z.ZodObject<any, any> \| z.ZodEffects<z.ZodObject<any, any>>`                                                                      | Zod schema for form validation                                        |
| [radioOptions](#radiooptions-recordstring-iradiooptions)                                                                                 | `Record<string, IRadioOptions[]>`                                                                                                   | Options for radio fields, keyed by field name                         |
| [handleSubmit](#handlesubmit-args-ihandlesubmit--void)                                                                                   | `(args: IHandleSubmit) => void`                                                                                                     | Function called on form submission                                    |
| [formKey](#formkey-string)                                                                                                               | `string`                                                                                                                            | Unique identifier for the form                                        |
| [formLabel](#formlabel-string)                                                                                                           | `string`                                                                                                                            | Label for the form (default: "Basic Form")                            |
| [onFormChange](#onformchange-form-ionformlisten--void)                                                                                   | `(form: IOnFormListen) => void`                                                                                                     | Callback function triggered on form changes                           |
| [isButtonLoading](#isbuttonloading-boolean)                                                                                              | `boolean`                                                                                                                           | Indicates if the submit button is in a loading state (default: false) |
| [fetching](#fetching-boolean)                                                                                                            | `boolean`                                                                                                                           | Indicates if the form is in a fetching state (default: false)         |
| [customRender](#customrender-form-useformreturn-x-string-any--any-undefined--reactelementtypeof-formfield--reactelementtypeof-formfield) | `(form: UseFormReturn<{ [x: string]: any }, any, undefined>) => ReactElement<typeof FormField> \| ReactElement<typeof FormField>[]` | Custom render function for form fields                                |

This table provides a concise reference for each prop, including its name, type, and a brief description based on the information provided in the type definitions. |

### `fields: IField[]`

The `fields` props defines the structure for form field properties. The `formType` property in the `fields` array specifies the type of form field. Below are the possible values for `formType`:

- **`input`**: A standard text input field.
- **`custom`**: A custom field rendered using the `customRender` property.
- **`textarea`**: A multi-line text input field.
- **`select`**: A dropdown select field.
- **`radio`**: A group of radio buttons.
- **`checkbox`**: A checkbox input field.
- **`date`**: A date picker input field.
- **`file`**: A file upload input field.
- **`multi-select`**: A multi-select dropdown field.
- **`inputs`**: A group of input fields.
- **`input-label-value`**: An input field with a label and value.
- **`phone-input`**: An input field for phone numbers.
- **`email-input`**: An input field for email addresses.
- **`date-range`**: A date range picker input field.

#### `fields props`

| Property                  | Type                                             | Description                                                            |
| ------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------- |
| `id`                      | `string`                                         | Unique identifier for the field.                                       |
| `formType`                | `string` (optional)                              | Specifies the type of form field. Possible values are specified above. |
| `name`                    | `string`                                         | Name of the field.                                                     |
| `label`                   | `string` (optional)                              | Label text for the field.                                              |
| `placeholder`             | `string` (optional)                              | Placeholder text for the field.                                        |
| `disabled`                | `boolean` (optional)                             | If true, the field will be disabled.                                   |
| `description`             | `string` (optional)                              | Description or help text for the field.                                |
| `required`                | `boolean` (optional)                             | If true, the field is required.                                        |
| `type`                    | `HTMLInputTypeAttribute \| undefined` (optional) | HTML input type attribute.                                             |
| `customRender`            | `React.JSX.Element` (optional)                   | Custom React element to render for the field.                          |
| `options`                 | `object` (optional)                              | Additional options for specific field types.                           |
| `options.phoneNumberType` | `"single" \| "multiple"` (optional)              | Specifies if the phone input allows single or multiple numbers.        |
| `options.phoneEmailType`  | `"single" \| "multiple"` (optional)              | Specifies if the email input allows single or multiple addresses.      |
| `options.inputsType`      | `"single" \| "multiple"` (optional)              | Specifies if the inputs field allows single or multiple inputs.        |

### `selectOptions:Record<string, ISelectOptions[]>`

The `selectOptions` prop would allow you to map field names (defined in `fields`) to their respective options. Here's an updated API reference that describes how `selectOptions` should contain an object with field names as keys and an array of option objects (with `value` and `label` properties) as values.

| Property      | Description                                                                                                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fields        | An array of field configurations for the form. The `name` property of each field is used to associate with `selectOptions`.                                                                                    |
| selectOptions | Contains an object where each key is the field's name (as defined in `fields`) and the value is an array of options (`value`, `label`). Each option is represented as an object with the following properties: |
|               | - `value`: The value to be submitted when this option is selected.                                                                                                                                             |
|               | - `label`: The text displayed to the user for this option.                                                                                                                                                     |

If your `fields` array looks like this:

```ts
const fields = [
  {
    id: "hobbies",
    name: "hobbies",
    formType: "select",
    label: "Hobbies",
    placeholder: "Select Hobbies",
  },
];
```

Then, the `selectOptions` would look like this:

```ts
    selectOptions={
        {
        "hobbies": [
          { value: "reading", label: "Reading" },
          { value: "writing", label: "Writing" },
          { value: "coding", label: "Coding" },
        ]
       }
    }
```

This setup will allow the form to populate the select fields for `hobbies` with the corresponding options. Here's the full code

```ts

const schema = z.object({
  hobbies: z.string(),
});
<FormBuilder
      formSchema={schema}
      formKey="BasicForm"  //your form key
      fields={[
          {
            id:'hobbies',
            name:'hobbies',
            formType:'select',
            label:'Hobbies',
            placeholder:'Select Hobbies',
          }
       ]}
       selectOptions={{
        "hobbies": [   { value: "reading", label: "Reading" },
          { value: "writing", label: "Writing" },
          { value: "coding", label: "Coding" },

        ]
       }}
      handleSubmit={(data) => {
        console.log("Form data:", data);
      }}

    />
```

### `defaultValues: Record<string, any>`

The `defaultValues` prop allows you to set initial values for the form fields. This is useful when you want to pre-fill the form with existing data.

Here's an example of how to use `defaultValues` along with other props:

```tsx
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.array(z.string().email("Invalid email address")),
  age: z.number().min(18, "You must be at least 18 years old"),
  hobbies: z.string(),
});

<FormBuilder
  formSchema={schema}
  formKey="BasicForm"
  fields={[
    {
      id: "name",
      formType: "input",
      placeholder: "Full Name",
      name: "name",
      label: "Full Name",
    },
    {
      id: "email",
      formType: "email-input",
      placeholder: "email address",
      name: "email",
      label: "Email Address",
    },
    {
      id: "age",
      formType: "input",
      placeholder: "Age",
      name: "age",
      label: "Age",
      type: "number",
    },
    {
      id: "hobbies",
      name: "hobbies",
      formType: "select",
      label: "Hobbies",
      placeholder: "Select Hobbies",
    },
  ]}
  defaultValues={{
    name: "yourName",
    email: [{ email: "yourEmail@gmail.com" }],
    age: "16",
    hobbies: "coding",
  }}
  selectOptions={{
    hobbies: [
      { value: "reading", label: "Reading" },
      { value: "writing", label: "Writing" },
      { value: "coding", label: "Coding" },
    ],
  }}
  handleSubmit={(data) => {
    console.log("Form data:", data);
  }}
/>;
```

In this example:

- The `name` field will be pre-filled with "yourName"
- The `email` field will be pre-filled with "<yourEmail@gmail.com>"
- The `age` field will be pre-filled with "16"
- The `hobbies` field will be pre-selected with "coding"

| Property  | Type                       | Description                           |
| --------- | -------------------------- | ------------------------------------- |
| `name`    | `string`                   | Default value for the `name` field    |
| `email`   | `Array<{ email: string }>` | Default value for the `email` field   |
| `age`     | `string`                   | Default value for the `age` field     |
| `hobbies` | `string`                   | Default value for the `hobbies` field |

You can add default values for any field defined in the `fields` array by including the corresponding key-value pairs in the `defaultValues` object. The structure of each default value should match the expected input format for that field type.

### `checkboxOptions: Record<string, ICheckboxOptions[]>`

The `checkboxOptions` prop allows you to define options for checkbox fields. This is useful when you want to provide multiple choices for a checkbox input.

Here's an example of how to use `checkboxOptions` along with other props:

```tsx
const schema = z.object({
  interests: z.array(z.string()),
});

//remove some of the fields for brevity
<FormBuilder
  formSchema={schema}
  formKey="InterestForm"
  fields={[
    {
      id: "interests",
      formType: "checkbox",
      name: "interests",
      label: "Interests",
    },
  ]}
  checkboxOptions={{
    interests: [
      { value: "sports", label: "Sports" },
      { value: "music", label: "Music" },
      { value: "travel", label: "Travel" },
    ],
  }}
  handleSubmit={(data) => {
    console.log("Form data:", data);
  }}
/>;
```

In this example, the `interests` field will render a group of checkboxes with the options "Sports", "Music", and "Travel".

| Property    | Type                                      | Description                                                                                               |
| ----------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `interests` | `Array<{ value: string, label: string }>` | Options for the `interests` checkbox field. Each option is an object with `value` and `label` properties. |

You can add checkbox options for any field defined in the `fields` array by including the corresponding key-value pairs in the `checkboxOptions` object. The structure of each option should match the expected input format for that field type.

### `multiSelectOptions: Record<string, Option[]>`

The `multiSelectOptions` prop allows you to define options for multi-select fields. This is useful when you want to provide multiple choices for a multi-select input.

Here's an example of how to use `multiSelectOptions` along with other props:

```tsx
const schema = z.object({
  skills: z.array(z.string()),
});

<FormBuilder
  formSchema={schema}
  formKey="SkillsForm"
  fields={[
    {
      id: "skills",
      formType: "multi-select",
      name: "skills",
      label: "Skills",
    },
  ]}
  multiSelectOptions={{
    skills: [
      { value: "javascript", label: "JavaScript" },
      { value: "python", label: "Python" },
      { value: "java", label: "Java" },
      { value: "react", label: "React" },
      { value: "angular", label: "Angular" },
      { value: "vue", label: "Vue" },
    ],
  }}
  handleSubmit={(data) => {
    console.log("Form data:", data);
  }}
/>;
```

In this example, the `skills` field will render a multi-select dropdown with the options `"JavaScript"`, `"Python"`, and `"Java"`.

| Property | Type                                      | Description                                                                                                |
| -------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `skills` | `Array<{ value: string, label: string }>` | Options for the `skills` multi-select field. Each option is an object with `value` and `label` properties. |

You can add multi-select options for any field defined in the `fields` array by including the corresponding key-value pairs in the `multiSelectOptions` object. The structure of each option should match the expected input format for that field type.

### `onSearchSelectOption: Record<string, (search: string) => Promise<Option[]>>`

The `onSearchSelectOption` prop is used for fields with `formType: "multi-select"`. It allows you to provide an asynchronous search function for each multi-select field. This function is triggered when the user types in the field, with a default debounce delay of 500ms.

Here's an example of how to use `onSearchSelectOption`:

```tsx
import { z } from "zod";
import { FormBuilder } from "your-form-builder-library";

const schema = z.object({
  skills: z.array(z.string()),
});

type Option = {
  value: string;
  label: string;
};

const OPTIONS: Option[] = [
  { label: "Next.js", value: "nextjs" },
  { label: "React", value: "react" },
  { label: "Remix", value: "remix" },
  // Add other options as needed
];

const mockSearch = async (value: string): Promise<Option[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const res = OPTIONS.filter((option) =>
        option.value.includes(value.toLowerCase()),
      );
      resolve(res);
    }, 1000);
  });
};

const MyForm = () => {
  return (
    <FormBuilder
      formSchema={schema}
      formKey="BasicForm"
      onSearchSelectOption={{
        skills: async (value: string) => {
          const res = await mockSearch(value);
          return res;
        },
      }}
      fields={[
        {
          id: "skills",
          formType: "multi-select",
          placeholder: "Skills",
          name: "skills",
          label: "Skills",
        },
      ]}
      multiSelectOptions={{
        skills: OPTIONS,
      }}
      handleSubmit={(data) => {
        console.log("Form data:", data);
      }}
    />
  );
};

export default MyForm;
```

| Property      | Type                                    | Description                                                                                      |
| ------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `[fieldName]` | `(search: string) => Promise<Option[]>` | Async function that takes a search string and returns a Promise resolving to an array of options |

Where `Option` is defined as:

```typescript
type Option = {
  value: string;
  label: string;
};
```

- The `onSearchSelectOption` prop is an object where each key corresponds to a field name in the `fields` array with `formType: "multi-select"`.
- Each value is an `async` function that takes a search string and returns a `Promise` resolving to an array of options.
- The search function is debounced by default with a delay of `500ms` to prevent excessive API calls.
- You can provide initial options using the `multiSelectOptions` prop, which will be used before any search is performed.

This setup allows for dynamic searching and loading of options as the user types in a multi-select field, providing a more interactive and efficient user experience for forms with large sets of potential options.

### `formSchema: z.ZodObject<any, any> | z.ZodEffects<z.ZodObject<any, any>>`

The `formSchema` prop is used to define the validation schema for your form using Zod, a TypeScript-first schema declaration and validation library. This schema ensures that the form data meets specified criteria before submission.

Here's an example of how to use `formSchema`:

```tsx
import { z } from "zod";
import { FormBuilder } from "your-form-builder-library";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be at least 18 years old"),
});

const MyForm = () => {
  return (
    <FormBuilder
      formSchema={schema}
      formKey="BasicForm"
      fields={[
        {
          id: "name",
          formType: "input",
          name: "name",
          label: "Full Name",
        },
        {
          id: "email",
          formType: "email-input",
          name: "email",
          label: "Email Address",
        },
        {
          id: "age",
          formType: "input",
          name: "age",
          label: "Age",
          type: "number",
        },
      ]}
      handleSubmit={(data) => {
        console.log("Form data:", data);
      }}
    />
  );
};

export default MyForm;
```

| Property     | Type                                                           | Description                                                        |
| ------------ | -------------------------------------------------------------- | ------------------------------------------------------------------ |
| `formSchema` | `z.ZodObject<any, any> \| z.ZodEffects<z.ZodObject<any, any>>` | Zod schema object defining the form structure and validation rules |

Key points:

- The `formSchema` should be a Zod object that matches the structure of your form fields.
- Each field in the schema should correspond to a field in your `fields` array.
- You can use Zod's validation methods (like `.min()`, `.max()`, `.email()`, etc.) to define specific validation rules for each field.
- Custom error messages can be provided as the second argument to most Zod validation methods.
- For more complex validations, you can use `z.ZodEffects` to create custom validation logic or transformations.

Example of a more complex schema with custom validation:

```typescript
const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

The `formSchema` prop is crucial for ensuring data integrity and providing a good user experience by catching and displaying validation errors before form submission. It works in conjunction with the form builder to automatically handle validation and error display based on the defined schema.

### `radioOptions: Record<string, IRadioOptions[]>`

The `radioOptions` prop is used to define the options for radio button fields in your form. It allows you to specify a set of choices for each radio group.

Here's an example of how to use `radioOptions`:

```tsx
import { z } from "zod";
import { FormBuilder } from "your-form-builder-library";

const schema = z.object({
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  preferredContact: z.enum(["email", "phone", "mail"]),
});

const MyForm = () => {
  return (
    <FormBuilder
      formSchema={schema}
      formKey="BasicForm"
      fields={[
        {
          id: "gender",
          formType: "radio",
          name: "gender",
          label: "Gender",
        },
        {
          id: "preferredContact",
          formType: "radio",
          name: "preferredContact",
          label: "Preferred Contact Method",
        },
      ]}
      radioOptions={{
        gender: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" },
        ],
        preferredContact: [
          { value: "email", label: "Email" },
          { value: "phone", label: "Phone" },
          { value: "mail", label: "Mail" },
        ],
      }}
      handleSubmit={(data) => {
        console.log("Form data:", data);
      }}
    />
  );
};

export default MyForm;
```

| Property      | Type              | Description                                    |
| ------------- | ----------------- | ---------------------------------------------- |
| `[fieldName]` | `IRadioOptions[]` | Array of radio options for the specified field |

- The `radioOptions` prop is an object where each key corresponds to a field name in the `fields` array with `formType: "radio"`.
- Each value is an array of `IRadioOptions` objects, each representing a single radio button option.
- The `value` property of each option should match the possible values defined in your Zod schema for that field.
- The `label` property is what will be displayed next to the radio button for the user to see.
- Ensure that the `name` property in your field definition matches the key in `radioOptions`.
- It's a good practice to use `z.enum()` in your Zod schema for radio button fields to restrict the possible values.

Example of using `defaultValues` with radio buttons:

```tsx
<FormBuilder
  // ... other props
  defaultValues={{
    gender: "female",
    preferredContact: "email",
  }}
  // ... other props
/>
```

The `radioOptions` prop allows you to easily define and manage the options for radio button groups in your form, providing a clear structure for both the form builder and the end-user.

### `handleSubmit: (args: IHandleSubmit) => void`

The `handleSubmit` prop is a function that is called when the form is submitted with valid data. It receives the form data and optionally the form object, allowing you to process the submitted information.

Here's an example of how to use `handleSubmit`:

```tsx
import { z } from "zod";
import { FormBuilder } from "your-form-builder-library";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be at least 18 years old"),
});

const MyForm = () => {
  const handleSubmit = ({ data, form }) => {
    console.log("Form data:", data);
    // Process the form data here
    // For example, send it to an API
    fetch("/api/submit-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Success:", result);
        form.reset(); // Reset the form after successful submission
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <FormBuilder
      formSchema={schema}
      formKey="BasicForm"
      fields={[
        {
          id: "name",
          formType: "input",
          name: "name",
          label: "Full Name",
        },
        {
          id: "email",
          formType: "email-input",
          name: "email",
          label: "Email Address",
        },
        {
          id: "age",
          formType: "input",
          name: "age",
          label: "Age",
          type: "number",
        },
      ]}
      handleSubmit={handleSubmit}
    />
  );
};

export default MyForm;
```

Certainly. I'll revise the content to make it consistent with the previous sections and organize it under multiple headings. Here's the updated version:

### `formKey: string`

The `formKey` prop is a unique identifier associated with a form, used to manage form state and handle data submission. It's crucial for distinguishing between multiple forms within an application.

```tsx
<FormBuilder
  formKey="registrationForm"
  // ... other props
/>
```

| Property  | Type     | Description                    |
| --------- | -------- | ------------------------------ |
| `formKey` | `string` | Unique identifier for the form |

Key points:

- Each form should have a unique `formKey` within your application.
- Use descriptive keys that reflect the purpose of the form (e.g., "userRegistration", "productSubmission").

### `formLabel: string`

The `formLabel` prop provides a human-readable title or description for the form, typically displayed to the user in the UI.

```tsx
<FormBuilder
  formLabel="User Registration"
  // ... other props
/>
```

| Property    | Type     | Description                    |
| ----------- | -------- | ------------------------------ |
| `formLabel` | `string` | Descriptive label for the form |

### `onFormChange: (form: IOnFormListen) => void`

The `onFormChange` prop is a callback function triggered whenever there's a change in the form. It allows you to respond to form changes in real-time.

```tsx
const MyForm = () => {
  const handleFormChange = (form: IOnFormListen) => {
    console.log("Form changed:", form.getValues());
  };

  return (
    <FormBuilder
      onFormChange={handleFormChange}
      // ... other props
    />
  );
};
```

| Property       | Type                            | Description                        |
| -------------- | ------------------------------- | ---------------------------------- |
| `onFormChange` | `(form: IOnFormListen) => void` | Callback function for form changes |

Key points:

- The `form` parameter provides access to the current form state and methods.
- Use this to perform side effects or update other parts of your application based on form changes.

### `isButtonLoading: boolean`

The `isButtonLoading` prop indicates whether the submit button is in a loading state, useful for showing loading indicators during form submission.

```tsx
<FormBuilder
  isButtonLoading={isSubmitting}
  // ... other props
/>
```

| Property          | Type      | Description                                          |
| ----------------- | --------- | ---------------------------------------------------- |
| `isButtonLoading` | `boolean` | Indicates if the submit button is in a loading state |

Default value: `false`

### `fetching: boolean`

The `fetching` prop indicates whether the form is in a data fetching state, typically used to display loading indicators while populating form data.

```tsx
<FormBuilder
  fetching={isLoadingData}
  // ... other props
/>
```

| Property   | Type      | Description                                  |
| ---------- | --------- | -------------------------------------------- |
| `fetching` | `boolean` | Indicates if the form is in a fetching state |

Default value: `false`

### `customRender: (form: UseFormReturn<{ [x: string]: any }, any, undefined>) => ReactElement<typeof FormField> | ReactElement<typeof FormField>[]`

The `customRender` prop allows for dynamic rendering of form fields based on the current form state or structure.

```tsx
const MyForm = () => {
  const customRenderFields = (
    form: UseFormReturn<{ [x: string]: any }, any, undefined>,
  ) => (
    <>
      <FormField name="username" control={form.control} />
      {form.watch("role") === "admin" && (
        <FormField name="adminCode" control={form.control} />
      )}
    </>
  );

  return (
    <FormBuilder
      customRender={customRenderFields}
      // ... other props
    />
  );
};
```

| Property       | Type                                                                                                                                | Description                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `customRender` | `(form: UseFormReturn<{ [x: string]: any }, any, undefined>) => ReactElement<typeof FormField> \| ReactElement<typeof FormField>[]` | Custom render function for form fields |

Key points:

- Allows for conditional rendering of form fields.
- Provides access to the form object for advanced form control.
- Should return one or more `FormField` components.
- Use this when you need more control over field rendering than the `fields` prop provides.
