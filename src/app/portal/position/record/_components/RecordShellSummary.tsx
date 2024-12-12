import React from "react";

export default function RecordShellSummary({ title }: { title: string }) {
  return (
    <div className="px-1">
      <strong>Title: </strong>
      {title}
    </div>
  );
}
