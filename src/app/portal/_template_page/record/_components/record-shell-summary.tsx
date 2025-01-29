import React from "react";

export default function RecordShellSummary({ role }: { role: string }) {
  return (
    <div className="px-1">
      <strong>Role:</strong>
      {role}
    </div>
  );
}
