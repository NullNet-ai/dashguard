export interface IConfigurationRuleGridProps {
  code: string;
}

export type TGridDataResult = {
  items: Record<string, unknown>[];
  totalCount: number;
};
