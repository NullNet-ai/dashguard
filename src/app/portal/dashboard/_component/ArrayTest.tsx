// import { EllipsisVertical, MinusCircleIcon } from "lucide-react";
// import { Fragment, useEffect } from "react";
// import { useFieldArray, type UseFormReturn } from "react-hook-form";
// import BasicFormHeader from "~/components/ui/basic-form-header";

// import { FormField, FormItem } from "~/components/ui/form";
// import { Input } from "~/components/ui/input";
// import { Label } from "~/components/ui/label";
// import { Separator } from "~/components/ui/separator";
// import { useEventListener } from "~/hooks/useEventListener";
// import { cn } from "~/lib/utils";

// export default function ArrayTest({
//   form,
//   options,
// }: {
//   form: UseFormReturn;
//   options?: {
//     appendFormKey?: string;
//   };
// }) {
//   const { register } = form;
//   const { fields, append, remove } = useFieldArray({
//     control: form?.control,
//     name: "educations",
//   });

//   const addEducation = () => {
//     append({ school: "", degree: "", major: "", graduationYear: "" });
//   };

//   useEventListener({
//     eventKey: options?.appendFormKey,
//     listener: addEducation,
//   });

//   return (
//     <FormField
//       name="educations"
//       control={form.control}
//       render={(formProps) => {
//         const errorMessage = formProps?.fieldState?.error as {
//           [key: string]: any;
//         };

//         return (
//           <FormItem>
//             {fields.map((field, index) => {
//               return (
//                 <Fragment key={field.id}>
//                   <div className="py-2">
//                     <BasicFormHeader
//                       label="Education"
//                       ellipseOptions={[
//                         {
//                           id: 1,
//                           name: "Remove",
//                           onClick: () => remove(index),
//                         },
//                       ]}
//                     />
//                     <Label
//                       className={cn(
//                         errorMessage?.[index] && "text-destructive",
//                         `after:ml-0.5 after:text-destructive after:content-["*"]`,
//                       )}
//                     >
//                       School
//                     </Label>
//                     <Input
//                       {...register(`educations.${index}.school` as const)}
//                       placeholder="School"
//                       //   onChange={(e) => {
//                       //     handleChange(index, "type", e.target.value);
//                       //   }}
//                       disabled
//                     />
//                     {errorMessage?.[index] && (
//                       <p
//                         className={cn(
//                           "py-1 text-sm font-medium text-destructive",
//                         )}
//                       >
//                         {errorMessage?.[index]?.filters?.message}
//                       </p>
//                     )}
//                   </div>

//                   <Separator />
//                 </Fragment>
//               );
//             })}
//           </FormItem>
//         );
//       }}
//     />
//   );
// }

export {};
