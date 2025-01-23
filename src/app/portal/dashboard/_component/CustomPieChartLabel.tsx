"use client";
import { startCase } from "lodash";
import React from "react";
import { ICustomPieChartLabelProps } from "../types";

const CustomPieChartLabel: React.FC<ICustomPieChartLabelProps> = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
    name,
    fill,
    percent,
  } = props;
  const radius = 25 + innerRadius + (outerRadius - innerRadius);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={fill}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${startCase(name)} (${value})`}
      <tspan x={x} y={y + 20} textAnchor="middle" className="">
        {`${(percent * 100).toFixed(0)}`}%
      </tspan>
    </text>
  );
};

export default CustomPieChartLabel;
