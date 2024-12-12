import React from "react";

export default function RecordShellSummary({ country }: { country: string }) {
  return (
    <div className="px-1">
      <strong>Country:</strong>
      {country}
    </div>
  );
}
