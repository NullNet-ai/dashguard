import { FormFieldSelector } from "~/components/platform/FormBuilder/FormFieldSelector";

export default function FormBuilderPage() {
  return (
    <div className="mx-auto px-8 py-8">
      <h1 className="mb-4 text-2xl font-bold">Form Builder</h1>
      <FormFieldSelector />
    </div>
  );
}
