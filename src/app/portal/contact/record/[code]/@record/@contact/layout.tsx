import { headers } from "next/headers";
import React from "react";
import { api } from "~/trpc/server";

const RecordLayout: React.FC<any> = async (props) => {
  const { params, children, ...rest } = props;
  const headerList = headers();
  let categories = headerList.get("x-categories") || "";
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, , identifier] = pathname.split("/");

  const record_details = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: [
      "categories",
    ],
  });

  categories = record_details?.data?.categories.filter((e: string) => e !== 'Contact').join(',')

  const {
    basicdetails,
    categorydetails,
    roledetails,
    personaldetails,
    educationdetails,
    professionaldetails,
    skilldetails,
    certificatedetails,
    documentdetails,
    linkdetails,
    employeedetails,
    accountinformationdetails,
  } = rest ?? {};

  let ComponentRendered = [basicdetails, categorydetails];

  switch (categories) {
    case "Applicant":
      ComponentRendered = [
        ...ComponentRendered,
        personaldetails,
        professionaldetails,
        educationdetails,
        skilldetails,
        certificatedetails,
        documentdetails,
        linkdetails,
      ];
      break;
    case "Employee":
      ComponentRendered = [
        ...ComponentRendered,
        roledetails,
        personaldetails,
        employeedetails,
        accountinformationdetails,
      ];
      break;
    default:
      ComponentRendered = [];
      break;
  }

  return <div className="space-y-2">{ComponentRendered}</div>;
};

export default RecordLayout;
