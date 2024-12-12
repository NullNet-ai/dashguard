import React from "react";

export default function RecordShellSummary({
  requirement_type,
}: {
  requirement_type: string;
}) {
  return (
    <div className="px-1">
      <strong>Requirement Type:</strong>
      {requirement_type}
    </div>
  );
}
