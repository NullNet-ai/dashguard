// "use client";
// import { z } from "zod";
// import FileUploadTest from "./fileUploadTest";
// import { FormBuilder }  from "~/components/platform/FormBuilder";

// import ArrayTest from "./ArrayTest";
// import FormDatePicker from "~/components/platform/FormBuilder/FormType/FormDate";
// import { DateTimePicker } from "~/components/ui/date-picker";
// import { DevTool } from "@hookform/devtools";
// import { Button } from "~/components/ui/button";

// const schema = z.object({
//   // name: z.string().optional(),
//   date: z.string({
//     message: "Please enter a valid date",
//   }),
//   "multi-select": z.array(z.string(), {
//     message: "Please select at least one option",
//   }),
// });
// export default function TestComponent() {

//   return (
//     <>
//       <FormBuilder
//         customDesign={{
//           formClassName: "w-full",
//         }}
//         handleSubmit={() => {
//           return Promise.resolve();
//         }}
//         enableAppendForm={true}
//         appendFormKey="test-form-button"
//         formKey="test-form"
//         formSchema={schema}
//         fields={[
//           {
//             id: "date",
//             name: "date",
//             label: "Date",
//             formType: "date",
//           }
//         ]}
//       />
//     </>
//   );
// }

export {};
