"use client";
import React, {
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import { ulid } from "ulid";
import { api } from "~/trpc/react";
import { UpdateReportFilter } from "../Action/UpdateReportFilter";
import { GridContext } from "../Provider";
import {
  type IAction,
  type ICreateContext,
  type ISearchItem,
  type ISearchItemResult,
  type ISearchParams,
  type IState,
} from "./types";
import { removeSearchItems } from "./utils/removeSearchItems";

export const SearchGridContext = React.createContext<ICreateContext>({});

interface IProps extends PropsWithChildren {
  test?: any;
}

export default function GridSearchProvider({ children }: IProps) {
  const { state: gridState } = useContext(GridContext);
  const {
    columns = [],
    entity: defaultEntity,
    searchableFields = [],
    searchConfig,
    onFetchRecords
  } = gridState?.config ?? {};


  const { parentType } = gridState ?? {}
  /** @STATES */
  const [_query, setQuery] = useState<string>("");
  const [searchItems, setSearchItems] = useState<ISearchItem[]>(
    gridState?.advanceFilter || [],
  );
  const [open, setOpen] = useState(false);

  const advanceFilterItems = useMemo(() => {
    const advanceFilter = searchItems.map(
      ({ entity, operator, type, field, values }) => ({
        entity: entity || defaultEntity,
        operator,
        type,
        field,
        values,
      }),
    ) as ISearchItem[];
    return searchableFields.reduce(
      (acc: any, { accessorKey, ...item }: any, index) => {
        return [
          ...acc,
          {
            type: "criteria",
            operator: "equal",
            values:
              item?.field === "raw_phone_number"
                ? [_query?.replace(/[^\d]/g, "")]
                : [_query],
            entity: defaultEntity, // if entity is not provided, the default entity will be the entity of the grid
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
    const { router = "grid", resolver = "items" } = searchConfig ?? {};
    // @ts-expect-error - TS doesn't know that `api` is a global variable that is defined in the `trpc` package
    const { data } = api?.[router]?.[resolver].useQuery(search_params, options);
    return data;
  };

  const handleAddSearchItem = async (filterItem: ISearchItemResult) => {
    const { count, ...rest } = filterItem ?? {};
    const advanceFilter = searchItems.map(({ entity, ...rest }) => ({
      entity: entity || defaultEntity,
      ...rest,
    })) as ISearchItem[];
    setQuery("");
    const updateSearchItems = [
      ...advanceFilter,
      ...(advanceFilter.length
        ? [{ id: ulid(), type: "operator", operator: "and" }]
        : []),
      {
        ...rest,
        id: ulid(),
        values:
          rest?.field === "raw_phone_number"
            ? [rest?.values?.[0]?.replace(/[^\d]/g, "")]
            : [rest?.values?.[0]],
        display_value: rest?.values?.[0],
      },
    ] as ISearchItem[];
    setSearchItems(updateSearchItems);
    if(parentType === "form") {
      onFetchRecords?.({
        advance_filters: updateSearchItems,
      })
      return;
    }
    await UpdateReportFilter({
      filters: updateSearchItems,
      filterItemId: filterItem.id,
    });
  };
  const handleRemoveSearchItem = async (filterItem: ISearchItem) => {
    setQuery("");
    const updatedSearchItems = removeSearchItems(searchItems, filterItem);
    setSearchItems(updatedSearchItems);
    if(parentType === "form") {
      onFetchRecords?.({
        advance_filters: updatedSearchItems,
      })
      return;
    }

    await UpdateReportFilter({
      filters: updatedSearchItems,
      filterItemId: filterItem.id,
    });
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
