import React from "react";

export default function RecordShellSummary({ name }: { name: string }) {
  return (
    <div className="pt-2">
      <div className="px-5">
        <div className="p-1 text-sm">
          <div>
            <span className="text-slate-400">Name: </span>
            <span>{name || "None"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
