import { EOperator } from "@dna-platform/common-orm";

const identifyFilter = (field: string, value: string | boolean) => {
  return {
    type: "criteria",
    field,
    operator: EOperator.EQUAL,
    values: [value],
  };
};
export const createAdvancedFilter = (obj: Record<string, string | boolean>) => {
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
