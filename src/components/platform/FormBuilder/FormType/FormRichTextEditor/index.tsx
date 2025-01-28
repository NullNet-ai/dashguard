import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { MinimalTiptapEditor } from "~/components/ui/rich-text-editor/minimal-tiptap";
import { useState, useEffect } from "react";
import { type Content } from "@tiptap/react";
import { type IField } from "../../types";
import { cn } from "~/lib/utils";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  icon?: React.ElementType;
  value?: string;
  formKey: string;
}

export default function FormRichTextEditor({
  fieldConfig,
  formRenderProps,
  form,
  formKey,
}: IProps) {
  // Initialize content state from form value
  const [content, setContent] = useState<Content>(() => {
    const fieldValue = formRenderProps.field.value;
    if (!fieldValue) return "";
    
    const stringValue = Array.isArray(fieldValue) 
      ? fieldValue.join("") 
      : (fieldValue as string).toString();
      
    // Only wrap in p tag if it doesn't already contain HTML
    return !stringValue.includes('<') 
      ? `<p class="text-node">${stringValue}</p>`
      : stringValue;
  });

  const isDisabled = fieldConfig.disabled || formRenderProps.field.disabled;
  
  // Track editor instance key to force re-render
  const [editorKey, setEditorKey] = useState(0);

  // Sync content state with form value changes
  useEffect(() => {
    const fieldValue = formRenderProps.field.value;
    if (fieldValue !== content) {
      setContent(fieldValue || "");
    }
  }, [formRenderProps.field.value]);

  // Force re-render of editor when disabled state changes
  useEffect(() => {
    setEditorKey(prev => prev + 1);
  }, [isDisabled]);

  const handleChange = (newValue: Content) => {
    if (
      formRenderProps.field.disabled ||
      fieldConfig?.readonly ||
      fieldConfig?.disabled
    ) {
      return;
    }

    setContent(newValue);
    form.setValue(fieldConfig?.name, newValue, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required}
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <MinimalTiptapEditor
          key={editorKey} // Add key prop to force re-render
          editorProps={{
            editable: () => !isDisabled,
            attributes: {
              "data-test-id": `${formKey}-editor-${fieldConfig.name}`,
            },
          }}
          throttleDelay={0}
          immediatelyRender={false}
          value={content}
          onChange={handleChange}
          className={cn(
            "w-full",
            form.formState.errors[fieldConfig?.name] && 
            "ring-1 ring-destructive ring-offset-0",
          )}
          editorContentClassName="p-5"
          output={fieldConfig?.richTextOutput ?? "html"}
          placeholder={fieldConfig?.placeholder ?? "Type your description here..."}
          autofocus={true}
          editorClassName="focus:outline-none"
          onBlur={formRenderProps.field.onBlur}
        />
      </FormControl>
      <FormMessage data-test-id={`${formKey}-error-msg-${fieldConfig.name}`} />
    </FormItem>
  );
}