import React from "react";

const RecordLayout: React.FC<any> = async (props) => {
  const { params, children, ...rest } = props;

  return <div className="space-y-2">{Object.values(rest)}</div>;
};

export default RecordLayout;
