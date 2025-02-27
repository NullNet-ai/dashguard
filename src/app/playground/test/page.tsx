"use client";

import { UserIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
const FormSchema = z.object({
    select_with_options: z.string({ message: "Select with Options is required" }),
    select_single: z.string({ message: "Select Single is required" }),
});

function handleSubmit(values: {
    data: z.infer<typeof FormSchema>;
}): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            toast(
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">
                        {JSON.stringify(values.data, null, 2)}
                    </code>
                </pre>,
            );
            resolve();
        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Failed to submit the form. Please try again.");
            reject(new Error("Form submission error"));
        }
    });
}

const sampleSelectOptions = [
    { label: "Date", value: "date" },
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Elderberry", value: "elderberry" },
    { label: "Cherry", value: "cherry" },
];

const sampleSelectOptionsAlphabetical = [
    { label: "Date", value: "date" },
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Elderberry", value: "elderberry" },
    { label: "Cherry", value: "cherry" },
];

export default function SelectDetails({}) {
    return (
        <>
            {/* FormBuilder 3: Select */}
            <div className="h-96">
                <FormBuilder
                    handleSubmit={handleSubmit}
                    enableFormRegisterToParent
                    formLabel="Select Form Builder"
                    formKey="FormBuilderSelect"
                    formSchema={FormSchema}
                    selectOptions={{
                        select_with_options: sampleSelectOptionsAlphabetical,
                        select_single: sampleSelectOptions,
                    }}
                    fields={[
                        {
                            id: "select_with_options",
                            formType: "select",
                            name: "select_with_options",
                            label: "Select with Options",
                            required: true,
                            selectSearchable: true,
                            selectIcon: UserIcon,
                            // readonly:true,
                        },
                        {
                            id: "select_single",
                            formType: "select",
                            name: "select_single",
                            label: "Select Single",
                            required: true,
                            selectIcon: UserIcon,
                            selectSearchable: true,
                            // disabled:true
                        },
                    ]}
                />
            </div>
        </>
    );
}



// 'use client'
// import React, { useState, useRef } from 'react';
// import { usePopper } from 'react-popper';

// const PopperComponent = () => {
//   const [visible, setVisible] = useState(false);
//   const referenceRef = useRef(null);
//   const popperRef = useRef(null);
  
//   const { styles, attributes, update } = usePopper(referenceRef.current, popperRef.current, {
//     placement: 'bottom', // Starting placement
//     modifiers: [
//       {
//         name: 'preventOverflow',
//         options: {
//           rootBoundary: 'viewport',
//           padding: 8, // Extra padding from the viewport edges
//         },
//       },
//       {
//         name: 'flip',
//         options: {
//           fallbackPlacements: ['top', 'right', 'left'], // Order of placements to try if original placement doesn't fit
//           padding: 8,
//         },
//       },
//       {
//         name: 'offset',
//         options: {
//           offset: [0, 10], // [skidding, distance] - horizontal and vertical offset
//         },
//       },
//       {
//         name: 'computeStyles',
//         options: {
//           gpuAcceleration: true, // Uses transform: translate3d for better performance
//         },
//       },
//     ],
//   });

//   const togglePopper = () => {
//     setVisible(!visible);
//     // When popper becomes visible, call update to ensure proper positioning
//     if (!visible && update) {
//       setTimeout(() => {
//         update();
//       }, 0);
//     }
//   };

//   return (
//     <div className="p-4 h-96 border border-black flex items-center justify-center">
//       <button
//         ref={referenceRef}
//         onClick={togglePopper}
//         className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
//       >
//         Toggle Popper
//       </button>

//       {visible && (
//         <div
//           ref={popperRef}
//           style={styles.popper}
//           {...attributes.popper}
//           className="bg-white border border-gray-200 shadow-lg rounded p-4 z-10 w-64"
//         >
//           <h3 className="text-lg font-semibold mb-2">Popper Content</h3>
//           <p>This popper will reposition itself to stay within the viewport and avoid collision.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PopperComponent;