"use client";

import { useState } from "react";

export default function RecordImplementationGuide() {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Record Tab Guide</h2>
        <div className="space-y-4">
          <div className="rounded-md border-l-4 border-green-400 bg-green-50 p-4">
            <h4 className="font-medium text-green-800">Add Record Tabs</h4>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-green-700">
                Generate new record tabs using:
              </p>
              <code className="block rounded bg-green-100 p-2 font-mono text-sm">
                $ platform record
              </code>
              <ul className="mt-2 list-disc pl-4 text-sm text-green-700">
                <li>Select menu type (Main Menu or Settings Menu)</li>
                {showMore && (
                  <>
                    <li>Choose target menu with record folder</li>
                    <li>System will show existing tabs (default: dashboard)</li>
                    <li>Enter names for additional tabs</li>
                    <li>Review and confirm tab creation</li>
                  </>
                )}
              </ul>
              <button
                onClick={() => setShowMore(!showMore)}
                className="mt-2 text-sm font-medium text-green-600 hover:text-green-800"
              >
                {showMore ? "Show Less" : "Show More"}
              </button>
            </div>
          </div>

          {showMore && (
            <div className="rounded-md border-l-4 border-yellow-400 bg-yellow-50 p-4">
              <h4 className="font-medium text-yellow-800">After Generation:</h4>
              <ul className="mt-2 list-disc pl-4 text-sm text-yellow-700">
                <li>Remove this guide component</li>
                <li>Implement tab content in generated files</li>
                <li>Update tab navigation if needed</li>
                <li>Test tab switching functionality</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
