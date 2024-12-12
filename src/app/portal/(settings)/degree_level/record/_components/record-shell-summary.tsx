import React from "react";

export default function RecordShellSummary({
  degree_level,
}: {
  degree_level: string;
}) {
  return (
    <div className="px-1">
      <strong>Degree Level:</strong>
      {degree_level}
    </div>
  );
}
