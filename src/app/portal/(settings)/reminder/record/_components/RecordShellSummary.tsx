import React from "react";

export default function RecordShellSummary({ reminder }: { reminder: string }) {
  return (
    <div className="px-1">
      <strong>Reminder:</strong>
      {reminder}
    </div>
  );
}
