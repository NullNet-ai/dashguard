import { headers } from "next/headers";
import React from "react";

type TProps = Partial<{
  email: string;
  phone: string;
  full_name: string;
  categories: string[];
  date_of_birth: string;
  address: string;
}>;

const fields = {
  Email: "email",
  Phone: "phone",
  "Full Name": "full_name",
  "Date of Birth": "date_of_birth",
  Category: "categories",
  Address: "address",
};

export default function RecordShellSummary(props: TProps) {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , mainEntity, ,] = pathname.split("/");
  return (
    <div className="pt-[4px]">
      {Object.entries(fields || {}).map(([key, value], idx) => (
        <div
          className="px-5"
          key={idx}
          data-test-id={
            `${mainEntity}-rcrdsum-` +
            key.split(" ").join("-").toLowerCase()
          }
        >
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
