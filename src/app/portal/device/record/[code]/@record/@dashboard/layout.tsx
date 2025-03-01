import React from "react";

const RecordLayout: React.FC<any> = (props) => {
  const { params, children, ...rest } = props;

  const {pie_chart, multi_graph} = rest
  const RenderComponents = [multi_graph].filter(Boolean)
  return <div className="grid grid-cols-1 gap-2">{RenderComponents}</div>;
};

export default RecordLayout;
