import React from "react";
import { headers } from "next/headers";

const WizardLayout: React.FC<any> = (props) => {
  const { params, children, ...rest } = props;
  const headerList = headers();
  const categories = headerList.get("x-categories") || "";
  const { certificationdetails, confirmationdetails } = rest ?? {};

  let ComponentRendered = null;
  switch (categories) {
    case "Applicant":
      ComponentRendered = certificationdetails;
      break;
    case "Employee":
      ComponentRendered = confirmationdetails;
      break;
    default:
      break;
  }

  return <div className="space-y-2">{ComponentRendered}</div>;
};

export default WizardLayout;
