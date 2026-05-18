"use client";
import { startCase } from "lodash";
import { ICustomPieChartLabelProps } from "../types";

function CustomPieChartLabel(props: ICustomPieChartLabelProps) {
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

  // Increase radius for better spacing
  const radius = 22 + innerRadius + (outerRadius - innerRadius);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Determine if label is on left or right side
  const isRightSide = x > cx;
  
  // Calculate offsets based on side
  const nameOffset = isRightSide ? -10 : 10;
  const percentOffset = isRightSide ? -10 : 10;
  
  // Calculate text anchor positions
  const nameAnchor = isRightSide ? "start" : "end";
  const percentAnchor = isRightSide ? "start" : "end";

  return (
    <g>
      {/* Name text */}
      <text
        x={x + nameOffset}
        y={y}
        fill={fill}
        textAnchor={nameAnchor}
        dominantBaseline="central"
        style={{ fontSize: "12px" }}
      >
        {startCase(name)}
      </text>
      
      {/* Percentage and value text */}
      <text
        x={x + percentOffset}
        y={y + 16}
        fill={fill}
        textAnchor={percentAnchor}
        dominantBaseline="central"
        style={{ fontSize: "11px", opacity: 0.9 }}
      >
        {`${(percent * 100).toFixed(0)}% (${value})`}
      </text>
    </g>
  );
}

export default CustomPieChartLabel;
