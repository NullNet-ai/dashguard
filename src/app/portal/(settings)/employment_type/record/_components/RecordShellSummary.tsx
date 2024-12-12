import React from "react";

export default function RecordShellSummary({
  employment_type,
}: {
  employment_type: string;
}) {
  return (
    <div className="px-1">
      <strong>Employment Type:</strong>
      {employment_type}
    </div>
  );
}
