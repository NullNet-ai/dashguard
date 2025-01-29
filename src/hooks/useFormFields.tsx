import { useState, useEffect, type ChangeEvent } from "react";

// Define the type for field configuration
export interface FieldConfig {
  id: string;
  value?: string;
  type: string;
  placeholder?: string;
  label?: string;
}

export type FieldValidated = Record<string, string>;

// Custom hook to manage form fields with persistence
function useFormFields(initialFields: FieldConfig[], key?: string) {
  // Load fields from local storage or initialize with provided field configurations
  const [fields, setFields] = useState<FieldConfig[]>(() => {
    if (!key) {
      return initialFields;
    }
    const savedFields = localStorage.getItem(key);
    return savedFields
      ? (JSON.parse(savedFields ?? []) as FieldConfig[])
      : initialFields;
  });

  // Save fields to local storage whenever they change
  useEffect(() => {
    if (!key) {
      return;
    }
    localStorage.setItem(key, JSON.stringify(fields));
  }, [fields, key]);

  // Handler for input changes
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? { ...field, value } : field,
      ),
    );
  };

  return {
    fields,
    handleChange,
  };
}

export default useFormFields;
