"use client";

import { useState, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Card } from "~/components/ui/card";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { z } from "zod";
import { useToast } from "~/context/ToastProvider";
import { ulid } from "ulid";

const FIELD_TYPES = [
  { value: "input", label: "Text Input" },
  { value: "input-grid", label: "Input Grid" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Select" },
  { value: "multi-select", label: "Multi Select" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date Picker" },
  { value: "date-range", label: "Date Range" },
  { value: "smart-date", label: "Smart Date" },
  { value: "phone-input", label: "Phone Input" },
  { value: "email-input", label: "Email Input" },
  { value: "inputs", label: "Multiple Inputs" },
  { value: "input-label-value", label: "Label Value Input" },
  { value: "address-input", label: "Address Input" },
  { value: "file", label: "File Upload" },
  { value: "slider", label: "Slider" },
  { value: "rich-text-editor", label: "Rich Text Editor" },
  { value: "number-input", label: "Number Input" },
  { value: "password", label: "Password" },
  { value: "currency-input", label: "Currency Input" },
  { value: "time-picker", label: "Time Picker" },
  { value: "draggable", label: "Draggable" },
  { value: "multi-field", label: "Multi Field" },
  { value: "switch", label: "Switch" },
] as const;

const toSnakeCase = (str: string) => {
  return str
    .replace(/([A-Z])/g, " $1")
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, "_");
};

export function FormFieldSelector() {
  const toast = useToast();
  const [fields, setFields] = useState<any[]>([]);
  const [editingField, setEditingField] = useState<number | null>(null);
  const [fieldName, setFieldName] = useState("");
  const [isRequired, setIsRequired] = useState(false);

  const FormSchema = useMemo(() => {
    const schemaObj: Record<string, any> = {};
    fields.forEach((field) => {
      const fieldName = field.name;
      schemaObj[fieldName] = field.required
        ? z.string().min(1, { message: `${field.label} is required` })
        : z.string();
    });
    return z.object(schemaObj);
  }, [fields]);

  const handleFieldTypeSelect = (type: string) => {
    const id = ulid();
    setFields((prev) => [
      ...prev,
      {
        id,
        formType: type,
        name: `${type}_${id}`,
        label: "",
        required: false,
        placeholder: "",
      },
    ]);
    setEditingField(fields.length);
  };

  const handleUpdateField = (index: number) => {
    if (!fieldName) return;

    const snakeCaseName = toSnakeCase(fieldName);

    setFields((prev) =>
      prev.map((field, i) => {
        if (i === index) {
          return {
            ...field,
            id: snakeCaseName,
            name: snakeCaseName,
            label: fieldName,
            required: isRequired,
            placeholder: fieldName,
          };
        }
        return field;
      }),
    );

    setEditingField(null);
    setFieldName("");
    setIsRequired(false);
  };

  const handleEditField = (index: number, field: any) => {
    setFieldName(field.label);
    setIsRequired(field.required);
    setEditingField(index);
  };

  const handleRemoveField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
    if (editingField === index) {
      setEditingField(null);
    }
  };

  const generateCode = () => {
    return `"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import { api } from "~/trpc/react";

const FormSchema = z.object({
  ${fields.map((f) => `${f.name}: z.string()${f.required ? '.min(1, { message: "' + f.label + ' is required" })' : ""}`).join(",\n  ")}
});

export default function BasicDetails({ params, defaultValues }: IFormProps) {
  const toast = useToast();
  const update = api.record.updateDynamicRecord.useMutation();
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      toast.error("Failed to submit Basic Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      formProps={params}
      formLabel="Basic Details"
      handleSubmit={handleSave}
      formKey="basicDetails"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={${JSON.stringify(fields, null, 2)}}
    />
  );
}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateCode());
    toast.success("Code copied to clipboard!");
  };

  const handlePreviewSubmit = async ({ data }: any) => {
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[250px_1fr] gap-6">
        <Card className="h-fit p-4">
          <Label className="mb-4 block text-lg font-semibold">
            Select Field Type
          </Label>
          <div className="flex flex-col gap-2">
            {FIELD_TYPES.map((type) => (
              <Button
                key={type.value}
                variant="outline"
                onClick={() => handleFieldTypeSelect(type.value)}
                className="h-10 justify-start"
              >
                <span>{type.label}</span>
              </Button>
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          {fields.length > 0 && (
            <Card className="p-4">
              <Label className="mb-4 block text-lg font-semibold">
                Form Fields
              </Label>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-md border p-4">
                    {editingField === index ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Field Name</Label>
                            <Input
                              value={fieldName}
                              onChange={(e) => setFieldName(e.target.value)}
                              placeholder="Enter field name"
                            />
                            {fieldName && (
                              <p className="text-sm text-gray-500">
                                ID/Name: {toSnakeCase(fieldName)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`required-${index}`}
                              checked={isRequired}
                              onCheckedChange={(checked) =>
                                setIsRequired(checked as boolean)
                              }
                            />
                            <Label htmlFor={`required-${index}`}>
                              Required
                            </Label>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleUpdateField(index)}>
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingField(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {field.label || "Unnamed Field"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Type: {field.formType} | ID: {field.id}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleEditField(index, field)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleRemoveField(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {fields.length > 0 && (
            <>
              <Card className="p-4">
                <Label className="mb-4 block text-lg font-semibold">
                  Form Preview
                </Label>
                <FormBuilder
                  myParent="wizard"
                  formProps={{}}
                  formLabel="Basic Details"
                  handleSubmit={handlePreviewSubmit}
                  formKey="basicDetails"
                  formSchema={FormSchema}
                  defaultValues={{}}
                  fields={fields}
                />
              </Card>

              <Card className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-lg font-semibold">
                    Generated Code
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="flex items-center gap-2"
                  >
                    <ClipboardIcon className="h-4 w-4" />
                    Copy Code
                  </Button>
                </div>
                <pre className="overflow-x-auto rounded-md bg-slate-900 p-4">
                  <code className="block text-sm text-slate-50">
                    {generateCode()}
                  </code>
                </pre>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
