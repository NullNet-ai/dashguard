import React, { createContext, useState } from "react";
import {
  EOrderDirection,
  type IAction,
  type ICreateContext,
  type IFilterBy,
  type IRawFilter,
  type ISortBy,
  type IState,
  type IStoreUnSaveFilters,
  type IStoreUnSaveSorts,
} from "./type";
const CategoryContext = createContext<ICreateContext | null>(null);

interface IProviderProps extends IFilterBy {
  children: React.ReactNode;
}

export const CategoryProvider = ({
  children,
  filter_by,
  filter_id,
  sort_by,
}: IProviderProps) => {
  const [unSaveFilters, setUnSaveFilters] = useState<IStoreUnSaveFilters>({
    entity: "",
    dirty: false,
    values: filter_by?.raw,
    validated: filter_by?.raw?.length ? true : false,
  });
  const [unSaveSorts, setUnSaveSorts] = useState<IStoreUnSaveSorts>({
    entity: "",
    dirty: false,
    values: {
      sort_by_direction: sort_by?.sort_by_direction || EOrderDirection.ASC,
      sort_by_field: sort_by?.sort_by_field || "",
    },
    validated: sort_by?.sort_by_field ? true : false,
  });

  const handleStoreUnSavedFilters = (
    entity: string,
    validated: boolean,
    filters: IRawFilter[],
  ) => {
    setUnSaveFilters({
      validated,
      entity: entity,
      dirty: true,
      values: filters,
    });
  };

  const handleStoreUnSavedSorts = (
    entity: string,
    validated: boolean,
    sorts: ISortBy,
  ) => {
    setUnSaveSorts({
      validated,
      entity: entity,
      dirty: true,
      values: sorts,
    });
  };

  const state: IState = {
    filter_state: {
      filter_by: {
        raw: unSaveFilters?.values,
        converted: filter_by?.converted,
      },
      sort_by: {
        sort_by_direction: unSaveSorts?.values?.sort_by_direction,
        sort_by_field: unSaveSorts?.values?.sort_by_field,
      },
      filter_id,
    },
    storeUnsaved: {
      filters: unSaveFilters,
      sorts: unSaveSorts,
    },
  };

  const action: IAction = {
    handleStoreUnSavedFilters,
    handleStoreUnSavedSorts,
  };

  return (
    <CategoryContext.Provider
      value={{
        state,
        action,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => {
  const context = React.useContext(CategoryContext);
  if (!context) {
    throw new Error(
      "useCategoryContext must be used within a CategoryProvider",
    );
  }
  return context;
};
