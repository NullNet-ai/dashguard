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
        "m-auto h-6 w-6 rounded-full group bg-red-200 hover:bg-red-100"
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
        <XIcon className="h-3 w-3 cursor-pointer text-red-700 group-hover:text-red-500" strokeWidth={4} />
      )}
    </Button>
  );
}
