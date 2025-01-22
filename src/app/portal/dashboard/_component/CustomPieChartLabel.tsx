"use client";
import { startCase } from "lodash";
import React from "react";

interface IPayload {
  key: string;
  value: number;
  fill: string;
  [key: string]: any;
}

interface IToolTipPayload {
  name: string;
  value: number;
  payload: IPayload;
  [key: string]: any;
}

interface IToolTipPosition {
  x: number;
  y: number;
}

interface ICustomPieChartLabelProps {
  stroke: string;
  fill: string;
  cx: number;
  cy: number;
  percent: number;
  name: string;
  tooltipPayload: IToolTipPayload[];
  midAngle: number;
  middleRadius: number;
  tooltipPosition: IToolTipPosition;
  payload: IPayload;
  key: string;
  value: number;
  innerRadius: number;
  outerRadius: number;
  maxRadius: number;
  startAngle: number;
  endAngle: number;
  paddingAngle: number;
  index: number;
  textAnchor: string;
  x: number;
  y: number;
}

const CustomPieChartLabel: React.FC<ICustomPieChartLabelProps> = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, value, name, fill } =
    props;
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
    </text>
  );
};

export default CustomPieChartLabel;
