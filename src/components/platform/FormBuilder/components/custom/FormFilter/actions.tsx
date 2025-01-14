"use server";
import { api } from "~/trpc/server";
const defaultSorting = [
    {
      id: "created_date",
      desc: true,
      sort_key: "created_date",
    },
  ];
  
export const fetchRecords = async ({
    advance_filters = [],
    router,
    resolver,
    pluck_fields,
  }: {
    pluck_fields: string[],
    router : string,
    resolver : string,
    advance_filters: {
      type: string;
      operator: string;
      values?: string[] | undefined;
      entity?: string | undefined;
      field?: string | undefined;
    }[];
  }) => {
    // @ts-expect-error - TS doesn't know that `api` is a global variable that is defined in the `trpc` package
    const { items = [], totalCount } = await api?.[router]?.[resolver]?.({
      current: 0,
      limit: 100,
      entity: "contact",
      pluck: pluck_fields,
      sorting: defaultSorting,
      advance_filters : advance_filters,
    });
    return {
      items,
      totalCount,
    };
  };
  