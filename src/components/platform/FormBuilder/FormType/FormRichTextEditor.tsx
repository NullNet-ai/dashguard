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
import kebabCase from "lodash/kebabCase";
import capitalize from "lodash/capitalize";
;
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
  icon,
  form,
  formKey,
  // value,
}: IProps) {
  const isDisabled = formRenderProps.field.disabled || fieldConfig.disabled;
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
        data-test-id={kebabCase(
          formKey + " "+ (fieldConfig.name) + "RichTextEditorFormLabel",
        )}
      >
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <MinimalTiptapEditor
          {...form.register(fieldConfig?.name)}
          editorProps={{
            editable: () => !isDisabled && !fieldConfig?.readonly,
            attributes: {
              "data-test-id": kebabCase(
                formKey + fieldConfig?.name + "RichTextEditor",
              ),
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
          editable={!isDisabled}
          editorClassName="focus:outline-none"
          onBlur={() => {
            formRenderProps.field.onBlur();
          }}
        />
      </FormControl>
      <FormMessage data-test-id={kebabCase(formKey + " "+ (fieldConfig.name) + "RichTextEditorErrorMessage")}/>

      {/* <span>{JSON.stringify(content, null, 2)}</span> */}
    </FormItem>
  );
}
