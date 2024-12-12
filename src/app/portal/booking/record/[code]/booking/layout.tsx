import React from "react";

const RecordLayout: React.FC<any> = (props) => {
  const { params, children, ...rest } = props;
  const { schedule, interviewnotes } = rest || {};
  const ComponentRendered = [schedule, interviewnotes];
  return <div className="space-y-2">{ComponentRendered}</div>;
};

export default RecordLayout;
