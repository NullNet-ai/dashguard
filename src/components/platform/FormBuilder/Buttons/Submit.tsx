import { CheckIcon } from "@heroicons/react/24/outline";
import { type z } from "zod";
import { Button } from "~/components/ui/button";

export default function SubmitForm({
  isLoading,
  form,
  saveForm,
  formSchema,
  formKey,
}: {
  saveForm(data: z.infer<typeof formSchema>): Promise<void>;
  isLoading: boolean;
  form: any;
  formSchema: z.ZodObject<any, any> | z.ZodEffects<z.ZodObject<any, any>>;
  formKey?: string;
}) {
  return (
    <Button
      data-test-id={`submitFormButton${formKey}`}
      className={
        "m-auto h-6 w-6 rounded-full bg-green-100 hover:disabled:cursor-not-allowed"
      }
      loading={isLoading}
      type="submit"
      variant={"ghost"}
      size={"icon"}
      onClick={form.handleSubmit(saveForm)}
    >
      {!isLoading && (
        <CheckIcon className="h-4 w-4 cursor-pointer text-green-800" />
      )}
    </Button>
  );
}
