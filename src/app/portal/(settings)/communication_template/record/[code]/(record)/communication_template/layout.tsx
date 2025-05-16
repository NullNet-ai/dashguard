import React from "react";

const RecordLayout: React.FC<any> = (props) => {
  const { basicDetails, eventDetails, contentDetails } = props;
  const forms = [basicDetails, eventDetails, contentDetails]
  return <div className="space-y-2">{forms}</div>;
};

export default RecordLayout;
