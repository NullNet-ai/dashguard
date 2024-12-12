import React from "react";

const WizardLayout: React.FC<any> = (props) => {
  const { params, children, ...rest } = props;
  const { compensation, benefits } = rest ?? {};
  return (
    <div className="space-y-2">
      {Object.values({
        compensation,
        benefits,
      })}
    </div>
  );
};

export default WizardLayout;
