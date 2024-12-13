import React from "react";

interface IProps {
  email: string;
  phone: string;
  full_name: string;
  categories: string[];
}

export default function RecordShellSummary(props: IProps) {
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
