import { useState } from "react";
import { type Content } from "@tiptap/react";
import { MinimalTiptapEditor } from "./rich-text-editor/minimal-tiptap";

export const RichTextEditor = () => {
  const [value, setValue] = useState<Content>("");
  return (
    <MinimalTiptapEditor
      value={value}
      onChange={setValue}
      className="w-full"
      editorContentClassName="p-5"
      output="html"
      placeholder="Type your description here..."
      autofocus={true}
      editable={true}
      editorClassName="focus:outline-none"
    />
  );
};
