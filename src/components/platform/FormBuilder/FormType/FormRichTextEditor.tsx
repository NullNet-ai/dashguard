import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { type IField } from "../type";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { MinimalTiptapEditor } from "~/components/ui/rich-text-editor/minimal-tiptap";
import { useState } from "react";
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
  // value,
}: IProps) {
  const isDisabled = formRenderProps.field.disabled;
  let defaultValue = form.getValues(fieldConfig?.name) && "";
  const isToFormat = true; // Set to true if to include like how the tipTapEditor is formatted
  if (isToFormat) {
    defaultValue = `<p class="text-node">${defaultValue ?? ""}</p>`;
  } else {
    defaultValue;
  }
  const [content, setContent] = useState<Content>(defaultValue ?? "");
  function handleChange(newValue: Content) {
    form.setValue(`${fieldConfig?.name}`, newValue, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
    setContent(newValue);
  }

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
          {...form.register(fieldConfig?.name)}
          editorProps={{
            editable: () => !(formRenderProps.field.disabled || fieldConfig?.readonly),
            attributes: {
              "data-test-id": `${formKey}-editor-${fieldConfig.name}`,
            },
          }}
          throttleDelay={0}
          value={content}
          onChange={handleChange} // Use handleChange to synchronize both states
          className="w-full"
          editorContentClassName="p-5"
          output={fieldConfig?.richTextOutput ?? "html"}
          placeholder={
            fieldConfig?.placeholder ?? "Type your description here..."
          }
          autofocus={true}
          editable={!(formRenderProps.field.disabled || fieldConfig?.readonly)}
          editorClassName="focus:outline-none"
          onBlur={() => {
            formRenderProps.field.onBlur();
          }}
        />
      </FormControl>
      <FormMessage data-test-id={`${formKey}-error-msg-${fieldConfig.name}`} />

      {/* <span>{JSON.stringify(content, null, 2)}</span> */}
    </FormItem>
  );
}
