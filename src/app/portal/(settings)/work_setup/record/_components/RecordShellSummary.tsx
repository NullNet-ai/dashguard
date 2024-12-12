import React from "react";

export default function RecordShellSummary({
  work_setup,
}: {
  work_setup: string;
}) {
  return (
    <div className="px-1">
      <strong>Work setup:</strong>
      {work_setup}
    </div>
  );
}
