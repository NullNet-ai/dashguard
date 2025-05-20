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
              Option 1: New Form Setup
            </h4>
            <div className="mt-2 space-y-2">
              <ol className="list-decimal space-y-2 pl-4 text-sm text-indigo-700">
                <li>Copy the @guideline folder structure</li>
                {showMore && (
                  <>
                    <li>Rename @guideline to your desired form name</li>
                    <li>Update import path in page.tsx</li>
                    <li>Replace RecordContentGuide with your form</li>
                  </>
                )}
              </ol>
            </div>
          </div>

          <div className="rounded-md border-l-4 border-green-400 bg-green-50 p-4">
            <h4 className="font-medium text-green-800">
              Option 2: Copy from Wizard
            </h4>
            <div className="mt-2 space-y-2">
              <ol className="list-decimal space-y-2 pl-4 text-sm text-green-700">
                <li>Locate your form in wizard steps</li>
                {showMore && (
                  <>
                    <li>
                      Copy entire form folder from wizard/_components/forms/
                    </li>
                    <li>Paste into record/_components/forms/</li>
                    <li>
                      Update server.tsx import paths:
                      <code className="mt-2 block rounded bg-green-100 p-2 font-mono text-xs">
                        {`import YourForm from "../../../../_components/forms/your_form/client";`}
                      </code>
                    </li>
                    <li>Form will automatically handle existing record data</li>
                  </>
                )}
              </ol>
            </div>
          </div>

          <button
            onClick={() => setShowMore(!showMore)}
            className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            {showMore ? "Show Less" : "Show More"}
          </button>

          {showMore && (
            <>
              <div className="rounded-md border-l-4 border-purple-400 bg-purple-50 p-4">
                <h4 className="font-medium text-purple-800">
                  Folder Structure:
                </h4>
                <pre className="mt-2 overflow-x-auto rounded bg-purple-100 p-2 text-xs text-purple-700">
                  {`src/app/portal/<menu>/
├── wizard/
│   └── [code]/
│       └── <step>/
│           └── @your_form/     👈 Copy from here
└── record/
    └── [code]/
        └── @record/
            └── @your_form/     👈 Paste here`}
                </pre>
              </div>

              <div className="rounded-md border-l-4 border-yellow-400 bg-yellow-50 p-4">
                <h4 className="font-medium text-yellow-800">Important:</h4>
                <ul className="mt-2 list-disc pl-4 text-sm text-yellow-700">
                  <li>Forms will auto-populate with record data</li>
                  <li>Verify all import paths after copying</li>
                  <li>Test form with existing records</li>
                  <li>Remove guide after implementation</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
