import { XCircleIcon } from "@heroicons/react/24/outline";
import { type z } from "zod";
import { Button } from "~/components/ui/button";

export default function CancelFormButton({
  isLoading,
  form,
  saveForm,
  formSchema,
}: {
  saveForm(data: z.infer<typeof formSchema>): Promise<void>;
  isLoading: boolean;
  form: any;
  formSchema: z.ZodObject<any, any> | z.ZodEffects<z.ZodObject<any, any>>;
}) {
  return (
    <Button
      data-test-id="cancelFormButton"
      className={
        "m-auto h-6 w-6 rounded-full bg-red-100 hover:disabled:cursor-not-allowed"
      }
      loading={isLoading}
      type="submit"
      variant={"ghost"}
      size={"icon"}
      onClick={(e : any) => {
        e.preventDefault();
        form.reset();
        form.clearErrors();
        form.control._disableForm(!form.formState.disabled);
      }}
    >
      {!isLoading && (
        <XCircleIcon className="h-4 w-4 cursor-pointer text-red-800" />
      )}
    </Button>
  );
}
