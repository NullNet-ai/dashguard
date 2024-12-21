"use client";
import React, {
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  type ISearchItem,
  type ISearchItemResult,
  type ISearchParams,
  type IAction,
  type ICreateContext,
  type IState,
} from "./types";
import { api } from "~/trpc/react";
import { GridContext } from "../Provider";
import { usePathname, useRouter } from "next/navigation";
import { UpdateReportFilter } from "../Action/UpdateReportFilter";
import { ulid } from "ulid";
import { formatAndCapitalize } from "~/lib/utils";
import { removeSearchItems } from "./utils/removeSearchItems";

export const SearchGridContext = React.createContext<ICreateContext>({});

interface IProps extends PropsWithChildren {
  test?: any;
}

export default function GridSearchProvider({ children }: IProps) {
  const { state: gridState } = useContext(GridContext);
  const {
    columns = [],
    entity,
    searchableFields = [],
    searchConfig,
  } = gridState?.config ?? {};

  const pathName = usePathname();
  const router = useRouter();

  /** @STATES */
  const [_query, setQuery] = useState<string>("");
  const [searchItems, setSearchItems] = useState<ISearchItem[]>(
    gridState?.advanceFilter || [],
  );
  const [open, setOpen] = useState(false);

  const advanceFilterItems = useMemo(() => {
    const advanceFilter = searchItems.map(
      ({ entity, operator, type, field, values }) => ({
        entity,
        operator,
        type,
        field,
        values,
      }),
    ) as ISearchItem[];
    return searchableFields.reduce(
      (acc: any, item: any, index) => {
        return [
          ...acc,
          {
            type: "criteria",
            operator: "equal",
            values: [_query],
            entity, // if entity is not provided, the default entity will be the entity of the grid
            ...item,
          },
          ...(searchableFields.length - 1 === index
            ? []
            : [{ type: "operator", operator: "or" }]),
        ];
      },
      [
        ...advanceFilter,
        ...(advanceFilter?.length
          ? [{ type: "operator", operator: "or" }]
          : []),
      ],
    );
  }, [_query, columns.length]);

  const handleQuery = (data: React.SetStateAction<string>) => {
    setQuery(data);
  };

  const handleOpen = (open: boolean) => {
    setOpen(open);
  };

  const handleSearchQuery = (
    search_params: ISearchParams,
    options: Record<string, any>,
  ) => {

    const {router = "grid", resolver = "items" } = searchConfig ?? {}
    // @ts-ignore
    const { data } = api?.[router]?.[resolver].useQuery(search_params, options);
    return data;
  };

  const handleAddSearchItem = async (filterItem: ISearchItemResult) => {
    const { count, ...rest } = filterItem ?? {};
    setQuery("");
    const updateSearchItems = [
      ...searchItems,
      ...(searchItems.length
        ? [{ id: ulid(), type: "operator", operator: "and" }]
        : []),
      { ...rest, id: ulid() },
    ] as ISearchItem[];
    setSearchItems(updateSearchItems);
    await UpdateReportFilter({
      filters: updateSearchItems,
    });
    router.push(`${pathName}?advanceFilterItem=${filterItem.id}`);
  };
  const handleRemoveSearchItem = async (filterItem: ISearchItem) => {
    setQuery("");
    const updatedSearchItems = removeSearchItems(searchItems, filterItem);
    setSearchItems(updatedSearchItems);
    await UpdateReportFilter({
      filters: updatedSearchItems,
    });
    router.push(`${pathName}?advanceFilterItem=${filterItem.id}`);
  };

  const state_context = {
    open,
    searchItems,
    query: _query,
    advanceFilterItems,
  } as IState;
  const actions = {
    handleQuery,
    handleOpen,
    handleSearchQuery,
    handleAddSearchItem,
    handleRemoveSearchItem,
  } as IAction;

  return (
    <SearchGridContext.Provider
      value={{
        state: state_context,
        actions: actions,
      }}
    >
      {children}
    </SearchGridContext.Provider>
  );
}
