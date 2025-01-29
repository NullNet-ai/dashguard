"use client";

import { useState } from "react";

export default function FormImplementationGuide() {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Form Implementation Guide
        </h2>
        <div className="space-y-4">
          <div className="rounded-md border-l-4 border-purple-400 bg-purple-50 p-4">
            <h4 className="font-medium text-purple-800">
              Steps to Implement Form
            </h4>
            <div className="mt-2 space-y-2">
              <ol className="list-decimal space-y-2 pl-4 text-sm text-purple-700">
                <li>Go to Form Field Selector (right side)</li>
                {showMore && (
                  <>
                    <li>Select desired form controls</li>
                    <li>Configure each field's properties</li>
                    <li>Preview the form</li>
                    <li>Copy the generated code</li>
                    <li>
                      Replace the content in this file with the copied code
                    </li>
                  </>
                )}
              </ol>
              <button
                onClick={() => setShowMore(!showMore)}
                className="mt-2 rounded-md border-2 border-blue-400 px-2 text-sm font-medium text-blue-600 hover:text-purple-800"
              >
                {showMore ? "Show Less" : "Show More"}
              </button>
            </div>
          </div>

          {showMore && (
            <div className="rounded-md border-l-4 border-yellow-400 bg-yellow-50 p-4">
              <h4 className="font-medium text-yellow-800">Important:</h4>
              <ul className="mt-2 list-disc pl-4 text-sm text-yellow-700">
                <li>Remove this guide component after implementation</li>
                <li>Test all form validations</li>
                <li>Ensure proper error handling</li>
                <li>Verify data submission flow</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
