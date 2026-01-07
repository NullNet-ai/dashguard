import { Check, PlusIcon, SaveIcon } from "lucide-react";
import { type z } from "zod";
import { Button } from "~/components/ui/button";


export default function SubmitForm({
  isLoading,
  form,
  saveForm,
  formSchema,
  formSaveButtonTitle,
  formSaveIcon,
  ...props
}: {
  saveForm(data: z.infer<typeof formSchema>): Promise<void>;
  isLoading: boolean;
  form: any;
  formSchema: z.ZodObject<any, any> | z.ZodEffects<z.ZodObject<any, any>>;
  formSaveButtonTitle?: string;
  formSaveIcon?: React.ReactNode;
}) {
  return (
    // <Button
    //   className="px-2 bg-green-200"
    //   loading={isLoading}
    //   type="submit"
    //   iconClassName="text-green-800 w-4 h-4 transform translate-x-1.5"
    //   Icon={SaveIcon}
    //   iconPlacement="left"
    //   variant={"soft"}
    //   size={"xs"}
    //   onClick={form.handleSubmit(saveForm)}
    //   {...props}
    // >
    //   <span className="text-green-800">Save</span>
    // </Button>

    <Button
      variant={"default"}
      onClick={form.handleSubmit(saveForm)}
      type="button"
      loading={isLoading}
      size={"xs"}
      className="gap-1 items-center text-sm"
      {...props}
      >
      {formSaveIcon ?? <SaveIcon className="h-4 w-4" />}
      {formSaveButtonTitle ?? 'Save'}
    </Button>

    
  );
}
