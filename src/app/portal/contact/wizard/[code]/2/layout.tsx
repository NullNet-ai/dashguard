import React from "react";

const WizardLayout: React.FC<any> = (props) => {
  const { params, children, ...rest } = props;

  return <div className="space-y-2">{Object.values(rest)}</div>;
};

export default WizardLayout;
