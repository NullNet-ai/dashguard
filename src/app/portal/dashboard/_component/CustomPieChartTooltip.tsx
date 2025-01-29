"use client";

import React from "react";
import { IPayload } from "../types";
import { startCase } from "lodash";
import { DefaultTooltipContent } from "recharts";
import getPercentage from "~/utils/get-percentage";

interface ICustomPieChartTooltipProps {
  active: boolean;
  payload: IPayload[];
  separator: string;
  totalRecordsCount: number;
}

const CustomPieChartTooltip: React.FC<ICustomPieChartTooltipProps> = (
  props,
) => {
  const { active, payload, separator, totalRecordsCount } = props;

  if (payload && payload.length && active) {
    const { value = 0, name } = payload[0] ?? {};
    const percentage = getPercentage(value, totalRecordsCount);

    return (
      <div className="border-3 border-dotted border-red-500 px-0 py-2">
        <p className="label">{`${startCase(name ?? "")}${separator}${value}`}</p>
        <p className="text-center">{`${percentage}%`}</p>
      </div>
    );
  }
  return <DefaultTooltipContent {...props} />;
};

export default CustomPieChartTooltip;
