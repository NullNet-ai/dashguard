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
import { cn } from "~/lib/utils";
import { type IField } from '../../types/global/interfaces';
import { useState, useEffect, useMemo, useCallback } from "react";
import { type Content } from "@tiptap/react";
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

  // Memoize the disabled state to prevent unnecessary recalculations
  const isDisabled = useMemo(() => 
    fieldConfig.disabled || formRenderProps.field.disabled, 
    [fieldConfig.disabled, formRenderProps.field.disabled]
  );

  // Track editor instance key to force re-render
  const [editorKey, setEditorKey] = useState(0);

  // Sync content state with form value changes
  useEffect(() => {
    const fieldValue = formRenderProps.field.value;
    // Check if fieldValue is empty or undefined and reset content accordingly
    if (!fieldValue && fieldValue !== content) {
      setContent("");
      setEditorKey(prev => prev + 1); // Force re-render of editor when content is cleared
    } else if (fieldValue !== content) {
      setContent(fieldValue || "");
    }
  }, [formRenderProps.field.value, content]);

  // Reset content when form is no longer dirty
  useEffect(() => {
    if (!form.formState.isDirty) {
      setContent("");
      setEditorKey(prev => prev + 1); // Force re-render of editor
    }
  }, [form.formState.isDirty]);

  // Force re-render of editor when disabled state changes
  useEffect(() => {
    setEditorKey(prev => prev + 1);
  }, [isDisabled]);

  // Memoize the handleChange function to prevent recreation on each render
  const handleChange = useCallback((newValue: Content) => {
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
  }, [formRenderProps.field.disabled, fieldConfig?.readonly, fieldConfig?.disabled, fieldConfig?.name, form]);

  // Memoize rich text config to prevent unnecessary recalculations
  const richTextConfig = useMemo(() => {
    const { richTextConfig } = fieldConfig;
    return {
      plainTextMode: richTextConfig?.plainTextMode,
      customDropdowns: richTextConfig?.customDropdowns?.map(dropdown => ({
        ...dropdown,
        disabled: isDisabled,
      }))
    };
  }, [fieldConfig.richTextConfig, isDisabled]);

  const { plainTextMode: isPlainTextMode, customDropdowns } = richTextConfig;

  // Memoize editor props to prevent unnecessary recreations
  const editorProps = useMemo(() => ({
    editable: () => !isDisabled,
    attributes: {
      "data-test-id": `${formKey}-editor-${fieldConfig.name}`,
    },
  }), [isDisabled, formKey, fieldConfig.name]);

  // Memoize class names to prevent unnecessary string concatenations
  const className = useMemo(() => 
    cn(
      "w-full",
      form.formState.errors[fieldConfig?.name] &&
      "ring-1 ring-destructive ring-offset-0",
      fieldConfig.className,
    ), 
    [form.formState.errors, fieldConfig?.name, fieldConfig.className]
  );

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
          key={editorKey}
          editorProps={editorProps}
          disabled={isDisabled}
          readOnly={fieldConfig.readonly || isDisabled}
          throttleDelay={0}
          immediatelyRender={false}
          value={content}
          onChange={handleChange}
          onBlur={formRenderProps.field.onBlur}
          editorClassName="focus:outline-none"
          placeholder={fieldConfig?.placeholder ?? "Type your description here..."}
          autofocus={true}
          className={className}
          editorContentClassName="p-5"
          output={fieldConfig?.richTextOutput ?? "html"}
          plainTextMode={isPlainTextMode}
          plainTextConfig={{
            ...fieldConfig?.richTextConfig?.plainTextConfig,
          }}
          customDropdowns={customDropdowns}
        />
      </FormControl>
      <FormMessage data-test-id={`${formKey}-error-msg-${fieldConfig.name}`} />
    </FormItem>
  );
}