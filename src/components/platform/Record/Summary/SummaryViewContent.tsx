import React from "react";

// Define types for the props
interface SummaryViewProps {
  children: React.ReactNode;
}

const RecordSummaryViewContent: React.FC<SummaryViewProps> = ({ children }) => {
  return <div className="summary-view m-4">{children}</div>;
};

export { RecordSummaryViewContent };
