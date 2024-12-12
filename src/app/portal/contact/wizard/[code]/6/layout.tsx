import React from "react";
import { headers } from "next/headers";

const WizardLayout: React.FC<any> = (props) => {
  const { params, children, ...rest } = props;
  const headerList = headers();
  const categories = headerList.get("x-categories") || "";
  const { skillsdetails, accountinformationdetails } = rest ?? {};

  let ComponentRendered = null;
  switch (categories) {
    case "Applicant":
      ComponentRendered = skillsdetails;
      break;
    case "Employee":
      ComponentRendered = accountinformationdetails;
      break;
    default:
      break;
  }

  return <div className="space-y-2">{ComponentRendered}</div>;
};

export default WizardLayout;
