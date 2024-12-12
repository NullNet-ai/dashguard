import React from "react";

export default function RecordShellSummary({
  position_role,
}: {
  position_role: string;
}) {
  return (
    <div className="px-1">
      <strong>Position Role:</strong>
      {position_role}
    </div>
  );
}
