# Documentation: Usage of Custom Field Render

## Overview

The **FormBuilder** component allows developers to quickly create forms with predefined field types. However, when project-level developers require full control over a field's rendering and behavior, the `custom-field` type can be used. This approach retains the structure of the FormBuilder while enabling complete customization of the field's UI and logic. Under the hood, it leverages React Hook Form for form management.

---

## Implementing a Custom Field

### Field Configuration

To use a custom field, define a field configuration object in the `fields` array with the following properties:

- **`type`**: Set to `'custom-field'`.
- **`id`**: Unique identifier for the field.
- **`name`**: Name of the field (required for form submission).
- **`label`**: Display label for the field.
- **`placeholder`**: Placeholder text (if applicable).
- **`required`**: Boolean indicating if the field is mandatory.
- **`render`**: A function that returns the custom JSX/TSX component (see [Render Function Props](#render-function-props)).
- Additional properties as needed (e.g., `disabled`, `hasFormMessages`).

#### Example Configuration

```jsx
const fields = [
    {
        type: 'custom-field',
        id: 'custom-text',
        name: 'customText',
        label: 'Custom Text Input',
        placeholder: 'Enter text...',
        required: true,
        hasFormMessages: false, // Optional (default: true)
        render: ({ field, fieldState, form }) => (
            <div>
                <label>{fieldConfig.label}</label>
                <input
                    {...field}
                    placeholder={fieldConfig.placeholder}
                    data-testid={`${formKey}-custom-text`}
                />
                {fieldState.error && (
                    <p className="error">{fieldState.error.message}</p>
                )}
            </div>
        ),
    },
];
```

---

### Render Function Props

The `render` function receives an object with five props:

| Prop            | Description                                                                                                      |
|-----------------|------------------------------------------------------------------------------------------------------------------|
| **`field`**     | Contains all React Hook Form props (e.g., `onChange`, `onBlur`, `value`, `ref`). Use this to bind to your input. |
| **`fieldState`**| Provides field state details: `error`, `isTouched`, `isDirty`, `disabled`, etc.                                  |
| **`fieldConfig`**| The full field configuration object defined in `fields` (includes `id`, `label`, `placeholder`, etc.).          |
| **`form`**      | The React Hook Form instance (`useForm`). Use to access methods like `watch()`, `reset()`, or `setValue()`.       |
| **`formKey`**   | The `formKey` passed to the FormBuilder. Useful for generating unique `data-testid` attributes or labels.         |

---

## `hasFormMessages` Flag

- **Default**: `true`
- When enabled, the FormBuilder automatically displays validation/error messages for the field.
- Set `hasFormMessages: false` in the field configuration to manually handle error messages in the `render` function.

---

## Example Usage

### Basic Custom Field Implementation

```jsx
import { useForm } from 'react-hook-form';
import FormBuilder from './FormBuilder';

const CustomForm = () => {
    const form = useForm();

    const fields = [
        {
            type: 'custom-field',
            id: 'email',
            name: 'email',
            label: 'Email Address',
            required: true,
            render: ({ field, fieldState, fieldConfig, formKey }) => (
                <div>
                    <label htmlFor={fieldConfig.id}>{fieldConfig.label}</label>
                    <input
                        {...field}
                        id={fieldConfig.id}
                        placeholder="user@example.com"
                        data-testid={`${formKey}-email`}
                        className={fieldState.error ? 'error' : ''}
                    />
                    {fieldState.error && (
                        <p className="error-message">{fieldState.error.message}</p>
                    )}
                </div>
            ),
        },
    ];

    return (
        <FormBuilder
            form={form}
            fields={fields}
            formKey="userForm"
            onSubmit={(data) => console.log(data)}
        />
    );
};
```

### Complete Form with Multiple Custom Fields

```jsx
"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { Button } from '~/components/ui/button';
import { FormItem, FormLabel } from '~/components/ui/form';

const FormSchema = z.object({
    "full-name": z
        .string({ message: "Full Name is required" })
        .min(2, { message: "Full Name must be at least 2 characters long" }),
    "gender": z.string({ message: "Gender is required" }),
    "bio": z.string().optional(),
    "dob": z
        .string({ message: "Date of Birth is required" })
        .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
});

export default function UserProfileForm() {
    const handleSave = async (values: { data: z.infer<typeof FormSchema> }) => {
        return new Promise<void>((resolve, reject) => {
            try {
                toast(
                    <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                        <code className="text-white">
                            {JSON.stringify(values.data, null, 2)}
                        </code>
                    </pre>,
                );
                resolve();
            } catch (error) {
                console.error("Profile update error", error);
                toast.error("Failed to update profile. Please try again.");
                reject(new Error("Profile update error"));
            }
        });
    };

    return (
        <FormBuilder
            enableFormRegisterToParent
            formLabel="User Profile Form"
            formKey="user-profile"
            handleSubmit={handleSave}
            formSchema={FormSchema}
            fields={[
                {
                    id: "full-name",
                    formType: "custom-field",
                    label: "Full Name",
                    placeholder: "Enter your full name",
                    required: true,
                    name: "full-name",
                    render: ({ field, fieldConfig, fieldState }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>{fieldConfig.label}</FormLabel>
                            <input
                                {...field}
                                value={field.value ?? ""}
                                className={`${fieldState.error && "border-red-500 border-2"}`}
                            />
                        </FormItem>
                    ),
                },
                {
                    id: "gender",
                    formType: "custom-field",
                    label: "Gender",
                    placeholder: "Select your gender",
                    required: true,
                    name: "gender",
                    render: ({ field, fieldConfig, fieldState }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>{fieldConfig.label}</FormLabel>
                            <select
                                {...field}
                                className={`${fieldState.error && "border-red-500 border-2"}`}
                            >
                                <option value="">Select your gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </FormItem>
                    ),
                },
                {
                    id: "bio",
                    formType: "custom-field",
                    label: "Bio",
                    placeholder: "Tell us about yourself",
                    required: false,
                    name: "bio",
                    render: ({ field, fieldConfig, fieldState }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>{fieldConfig.label}</FormLabel>
                            <textarea
                                {...field}
                                placeholder={fieldConfig.placeholder}
                                className={`${fieldState.error && "border-red-500 border-2"}`}
                            />
                        </FormItem>
                    ),
                },
                {
                    id: "dob",
                    formType: "custom-field",
                    label: "Date of Birth",
                    placeholder: "Enter your date of birth",
                    required: true,
                    name: "dob",
                    render: ({ field, fieldConfig, fieldState, form }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>{fieldConfig.label}</FormLabel>
                            <input
                                type="date"
                                {...field}
                                value={field.value ?? ""}
                                className={`${fieldState.error && "border-red-500 border-2"}`}
                            />
                            <Button onClick={() => { form.reset() }} type='reset'>
                                Reset
                            </Button>
                        </FormItem>
                    ),
                },
            ]}
        />
    );
}
```

### Common Custom Field Patterns

#### Custom Input with Inline Validation

```jsx
{
    type: 'custom-field',
    id: 'username',
    name: 'username',
    label: 'Username',
    required: true,
    render: ({ field, fieldState, fieldConfig }) => (
        <div className="input-wrapper">
            <label htmlFor={fieldConfig.id}>{fieldConfig.label}</label>
            <div className="input-container">
                <input
                    {...field}
                    id={fieldConfig.id}
                    placeholder="Enter username"
                    className={fieldState.error ? 'error-input' : 'standard-input'}
                />
                {fieldState.isTouched && !fieldState.error && (
                    <span className="valid-icon">✓</span>
                )}
            </div>
            {fieldState.error && (
                <p className="error-text">{fieldState.error.message}</p>
            )}
        </div>
    )
}
```

#### Custom Field with Dynamic Content

```jsx
{
    type: 'custom-field',
    id: 'dynamicOptions',
    name: 'dynamicOptions',
    label: 'Select Option',
    required: true,
    render: ({ field, fieldConfig, form }) => {
        const [options, setOptions] = useState([]);
        
        useEffect(() => {
            // Simulate fetching options based on another field value
            const category = form.watch('category');
            fetchOptionsByCategory(category).then(setOptions);
        }, [form.watch('category')]);
        
        return (
            <div>
                <label>{fieldConfig.label}</label>
                <select {...field}>
                    <option value="">Select an option</option>
                    {options.map(option => (
                        <option key={option.id} value={option.id}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    }
}
```

#### Custom Field with Field Interaction

```jsx
{
    type: 'custom-field',
    id: 'password',
    name: 'password',
    label: 'Password',
    required: true,
    render: ({ field, fieldConfig, form }) => {
        const [visible, setVisible] = useState(false);
        
        return (
            <div>
                <label>{fieldConfig.label}</label>
                <div className="password-field">
                    <input
                        {...field}
                        type={visible ? 'text' : 'password'}
                        placeholder="Enter password"
                    />
                    <button
                        type="button"
                        onClick={() => setVisible(!visible)}
                        className="toggle-visibility"
                    >
                        {visible ? 'Hide' : 'Show'}
                    </button>
                </div>
                <div className="password-strength">
                    <div className={`strength-meter ${getStrengthClass(field.value)}`}></div>
                    <span>{getStrengthText(field.value)}</span>
                </div>
            </div>
        );
    }
}
```

---

## Best Practices

### 1. Leverage `field` and `fieldState` Effectively

Use the provided props to handle input binding and field state:

```jsx
// Good practice
<input 
    {...field} 
    className={fieldState.error ? 'error-input' : 'standard-input'} 
/>

// Avoid manual state management
const [value, setValue] = useState(field.value);
<input 
    value={value} 
    onChange={(e) => { 
        setValue(e.target.value); 
        field.onChange(e); 
    }} 
/>
```

### 2. Use `form` Sparingly

Only use the `form` prop when necessary for cross-field logic:

```jsx
// Good practice - when you need to react to other field changes
const otherFieldValue = form.watch('otherField');

// Avoid - when field-specific logic can be handled locally
const fieldValue = form.watch(field.name); // Use field.value instead
```

### 3. Consistent Naming for Testing

Generate consistent test identifiers using the `formKey`:

```jsx
<input
    {...field}
    data-testid={`${formKey}-${fieldConfig.id}`}
/>
```

### 4. Custom Validation

Combine `fieldConfig` with React Hook Form's validation for complex rules:

```jsx
// In field configuration
{
    id: 'password',
    type: 'custom-field',
    // ...
    validate: (value) => {
        if (!/[A-Z]/.test(value)) return 'Password must contain uppercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain a number';
        return true;
    }
}
```

### 5. Accessibility Considerations

Ensure your custom fields maintain accessibility:

```jsx
<FormItem>
    <FormLabel htmlFor={fieldConfig.id}>{fieldConfig.label}</FormLabel>
    <input
        {...field}
        id={fieldConfig.id}
        aria-invalid={!!fieldState.error}
        aria-describedby={fieldState.error ? `${fieldConfig.id}-error` : undefined}
    />
    {fieldState.error && (
        <p id={`${fieldConfig.id}-error`} className="error-message">
            {fieldState.error.message}
        </p>
    )}
</FormItem>
```