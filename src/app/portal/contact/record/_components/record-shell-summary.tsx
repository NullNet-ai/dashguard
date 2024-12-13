import { headers } from "next/headers";
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

  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , mainEntity, ,] = pathname.split("/");
  return (
    <div className="pt-2">
      {Object.entries(fields || {}).map(([key, value], idx) => (
        <div className="px-5" key={idx } data-test-id={
          `${mainEntity}-rcrd-summary-` + key.split(" ").join("-").toLowerCase()}>
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
