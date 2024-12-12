import React from "react";

export default function RecordShellSummary({ benefit }: { benefit: string }) {
  return (
    <div className="px-1">
      <strong>Benefit: </strong>
      {benefit}
    </div>
  );
}
