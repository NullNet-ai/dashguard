import React from "react";

type TProps = Partial<{
  email: string;
  phone: string;
  full_name: string;
  categories: string[];
}>;

const fields = {
  Email: "email",
  Phone: "phone",
  "Full Name": "full_name",
  Category: "categories",
};

export default function RecordShellSummary(props: TProps) {
  return (
    <div className="pt-2">
      {Object.entries(fields || {}).map(([key, value], idx) => (
        <div className="px-5" key={idx}>
          <div className="p-1 text-sm">
            <div>
              <span className="text-slate-400">{key}: </span>
              <span>{props?.[value as keyof TProps] || "None"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
