import React from "react";

export default function RecordShellSummary({ name }: { name: string }) {
  return (
    <div className="px-1">
      <strong>Name:</strong>
      {name}
    </div>
  );
}
