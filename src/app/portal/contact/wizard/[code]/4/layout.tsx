import { headers } from "next/headers";
import React from "react";

const WizardLayout: React.FC<any> = (props) => {
  const { params, children, ...rest } = props;
  const headerList = headers();
  const categories = headerList.get("x-categories") || "";
  const { professionaldetails, personaldetails } = rest ?? {};
  let ComponentRendered = null;
  switch (categories) {
    case "Applicant":
      ComponentRendered = professionaldetails;
      break;
    case "Employee":
      ComponentRendered = personaldetails;
      break;
    default:
      break;
  }

  return <div className="space-y-2">{ComponentRendered}</div>;
};

export default WizardLayout;
