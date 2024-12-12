import React from "react";

export default function RecordShellSummary({ position_type }: { position_type: string }) {
  return (
    <div className="px-1">
      <strong>Position Type:</strong>
      {position_type}
    </div>
  );
}
