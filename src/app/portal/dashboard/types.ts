interface IPayload {
  key: string;
  value: number;
  fill: string;
  name: string;
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

export type {
  ICustomPieChartLabelProps,
  IToolTipPayload,
  IToolTipPosition,
  IPayload,
}