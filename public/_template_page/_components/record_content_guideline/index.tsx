"use client";

import { useState } from "react";

export default function RecordContentGuide() {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Manual Form Implementation Guide
        </h2>
        <div className="space-y-4">
          <div className="rounded-md border-l-4 border-indigo-400 bg-indigo-50 p-4">
            <h4 className="font-medium text-indigo-800">
              Steps to Add Form to Record Tab
            </h4>
            <div className="mt-2 space-y-2">
              <ol className="list-decimal space-y-2 pl-4 text-sm text-indigo-700">
                <li>Copy the @guideline folder structure</li>
                {showMore && (
                  <>
                    <li>
                      Rename @guideline to your desired form name (e.g.,
                      @basic_info)
                    </li>
                    <li>
                      Update import path in page.tsx to point to your form
                      component
                    </li>
                    <li>
                      Example path structure:
                      <code className="mt-2 block rounded bg-indigo-100 p-2 font-mono text-xs">
                        import BasicInfoForm from
                        "../../../../_components/forms/basic_info/client";
                      </code>
                    </li>
                    <li>
                      Replace RecordContentGuide component with your form
                      component
                    </li>
                  </>
                )}
              </ol>
              <button
                onClick={() => setShowMore(!showMore)}
                className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                {showMore ? "Show Less" : "Show More"}
              </button>
            </div>
          </div>

          {showMore && (
            <>
              <div className="rounded-md border-l-4 border-purple-400 bg-purple-50 p-4">
                <h4 className="font-medium text-purple-800">
                  Example Structure:
                </h4>
                <pre className="mt-2 overflow-x-auto rounded bg-purple-100 p-2 text-xs text-purple-700">
                  {`src/app/portal/<menu>/record/[code]/
├── @record/
└── _TEMPLATE/
    ├── @guideline/     👈 Copy this
    │   └── page.tsx    
    └── @your_form/     👈 Paste and rename
        └── page.tsx    👈 Update imports`}
                </pre>
              </div>

              <div className="rounded-md border-l-4 border-yellow-400 bg-yellow-50 p-4">
                <h4 className="font-medium text-yellow-800">Important:</h4>
                <ul className="mt-2 list-disc pl-4 text-sm text-yellow-700">
                  <li>Keep consistent naming conventions</li>
                  <li>Verify import paths are correct</li>
                  <li>Remove this guide after implementation</li>
                  <li>Test form integration in the tab</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
