import React from "react";

export default function RecordShellSummary({ code }: { code: string }) {
  return (
    <div className="px-1">
      <strong>Code:</strong>
      {code}
    </div>
  );
}
