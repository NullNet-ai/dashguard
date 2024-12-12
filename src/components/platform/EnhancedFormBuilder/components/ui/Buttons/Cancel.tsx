import { XCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { XIcon } from "lucide-react";
import { type z } from "zod";
import { Button } from "~/components/ui/button";

export default function CancelFormButton({
  isLoading,
  form,
  saveForm,
  formSchema,
  ...props
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
      {...props}
    >
      {!isLoading && (
        <XIcon className="h-3 w-3 cursor-pointer text-red-800" strokeWidth={4} />
      )}
    </Button>
  );
}
