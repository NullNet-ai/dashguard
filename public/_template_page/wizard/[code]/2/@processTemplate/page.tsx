export default function FormBuilderGuidePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Form Builder Guide</h2>
        <div className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <p className="font-mono text-sm">$ platform add-form</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Interactive Steps:</h3>
            <ol className="list-decimal space-y-2 pl-4">
              <li>Select target menu from the portal menu list</li>
              <li>Enter form name when prompted</li>
              <li>Wait for form generation to complete</li>
              <li>Choose whether to integrate with wizard
                <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
                  <li>If yes, select the wizard step number</li>
                  <li>Form will be integrated into the selected step</li>
                </ul>
              </li>
            </ol>
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
            <p>Note: The command will handle all necessary file creation and integration. Follow the prompts to complete the form setup.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
