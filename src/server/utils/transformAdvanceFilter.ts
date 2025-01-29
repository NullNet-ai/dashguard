import { EOperator } from "@dna-platform/common-orm";

const identifyFilter = (field: string, value: string | boolean | any[]) => {
  return {
    type: "criteria",
    field,
    operator: EOperator.EQUAL,
    values: Array.isArray(value) ? value : [value],
  };
};
export const createAdvancedFilter = (
  obj: Record<string, string | boolean | any[]>,
) => {
  const entries = Object.entries(obj);
  const filters: any = [];
  entries.forEach(([field, value], index) => {
    filters.push(identifyFilter(field, value));
    if (index < entries.length - 1) {
      filters.push({ type: "operator", operator: EOperator.AND });
    }
  });

  return filters;
};
