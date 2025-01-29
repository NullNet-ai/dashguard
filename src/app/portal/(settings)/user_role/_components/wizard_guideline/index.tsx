export default function WizardGuideline() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Wizard Form Builder Integration Guide
        </h2>
        <div className="space-y-4">
          <div className="rounded-md border-l-4 border-green-400 bg-green-50 p-4">
            <h4 className="font-medium text-green-800">
              Add More Wizard Steps
            </h4>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-green-700">
                Need additional wizard steps? Use this command:
              </p>
              <code className="block rounded bg-green-100 p-2 font-mono text-sm">
                $ platform wizard
              </code>
              <ul className="mt-2 list-disc pl-4 text-sm text-green-700">
                <li>Choose your menu</li>
                <li>System validates existing structure</li>
                <li>Specify how many new steps to add</li>
                <li>Review and confirm total steps</li>
                <li>Steps will be added to your existing wizard</li>
              </ul>
            </div>
          </div>

          <div className="rounded-md border-l-4 border-green-400 bg-green-50 p-4">
            <h4 className="font-medium text-green-800">Create Form</h4>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-green-700">
                Generate a new form using:
              </p>
              <code className="block rounded bg-green-100 p-2 font-mono text-sm">
                $ platform add-form
              </code>
              <ul className="mt-2 list-disc pl-4 text-sm text-green-700">
                <li>Select target menu from the portal menu list</li>
                <li>Enter form name when prompted</li>
                <li>Wait for form generation to complete</li>
                <li>
                  Choose whether to integrate with wizard
                  <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
                    <li>If yes, select the wizard step number</li>
                    <li>Form will be integrated into the selected step</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-md bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">Generated Files:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ Form component</li>
              <li>✓ Form schema</li>
              <li>✓ Form types</li>
              {/* Optional */}
              <li>○ Wizard integration (if selected)</li>
            </ul>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Note: The command will handle all necessary file creation and
              integration. Follow the prompts to complete the form setup.
            </p>
          </div>
          <div className="rounded-md border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <h4 className="font-medium text-yellow-800">Important:</h4>
            <ul className="mt-2 list-disc pl-4 text-sm text-yellow-700">
              <li>Remove this template after form creation is complete</li>
              <li>Update the generated form code according to your needs</li>
              <li>Test the form functionality before deployment</li>
              <li>Commit changes only after successful testing</li>
            </ul>
          </div>
          <div className="rounded-md border-l-4 border-blue-400 bg-blue-50 p-4">
            <h4 className="font-medium text-blue-800">Troubleshooting:</h4>
            <ul className="mt-2 list-disc pl-4 text-sm text-blue-700">
              <li>
                If changes are not visible immediately, restart the Next.js
                development server
              </li>
              <li>
                Run:{" "}
                <code className="rounded bg-blue-100 px-2 py-0.5">
                  pnpm local
                </code>
              </li>
              <li>
                This ensures proper compilation and hot-reload of new components
              </li>
              <li>
                Clear{" "}
                <code className="rounded bg-blue-100 px-2 py-0.5">.next</code>{" "}
                cache if needed
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
