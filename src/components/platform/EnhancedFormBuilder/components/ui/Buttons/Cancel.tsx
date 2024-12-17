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
    //     <Button
    //       data-test-id="cancelFormButton"
    //       loading={isLoading}
    //       type="submit"
    //       variant={"ghost"}
    //       size={"icon"}
    //       onClick={(e : any) => {
    //         e.preventDefault();
    //         form.reset();
    //         form.clearErrors();
    //         form.control._disableForm(!form.formState.disabled);
    //       }}
    //       {...props}
    //     >
    //       {!isLoading && (
    //         <XIcon className="h-3 w-3 cursor-pointer text-red-700 group-hover:text-red-500" strokeWidth={4} />
    //       )}
    //     </Button>

    // <Button
    //   className="px-2 bg-red-200"
    //   loading={isLoading}
    //   type="submit"
    //   iconClassName="text-red-800 w-4 h-4 transform translate-x-1.5"
    //   Icon={XIcon}
    //   iconPlacement="left"
    //   variant={"soft"}
    //   size={"xs"}
    //   onClick={(e : any) => {
    //     e.preventDefault();
    //     form.reset();
    //     form.clearErrors();
    //     form.control._disableForm(!form.formState.disabled);
    //   }}
    //   {...props}
    //   >
    //   <span className="text-red-800">Cancel</span>
    // </Button>

    <Button
      variant={"outline"}
      onClick={(e: any) => {
        e.preventDefault();
        form.reset();
        form.clearErrors();
        form.control._disableForm(!form.formState.disabled);
      }}
      type="button"
      // loading={isLoading}
      disabled={isLoading}
      size={"xs"}
      {...props}
    >
      {" "}
      <XMarkIcon className="h-4 w-4" />
      Cancel
    </Button>
  );
}
