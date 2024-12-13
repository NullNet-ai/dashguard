import React from "react";

type TProps = Partial<{
  email: string;
  phone: string;
  full_name: string;
  categories: string[];
}>;

export default function RecordShellSummary(props: TProps) {
  return (
    <>
      {Object.entries(props || {}).map(([key, value], idx) => (
        <div className="px-1" key={idx}>
          <strong>{key}:</strong>
          &nbsp; {value || "None"}
        </div>
      ))}
    </>
  );
}
