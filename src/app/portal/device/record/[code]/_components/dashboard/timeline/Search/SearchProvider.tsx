'use client'
import { createContext, useContext, useState } from "react";
import { IAction, IProps, ISearchContext, IState } from "../types";

export const SearchContext = createContext<ISearchContext>({});

export const useSearch = (): ISearchContext => {
  console.log("%c Line:7 🍿 useSearch", "color:#fca650");
  const context = useContext(SearchContext);
  console.log("%c Line:9 🥥 context", "color:#7f2b82", context);
  if (!context) {
    console.log("NO CONTEXT!!!!!!!!!!")
    // throw new Error("use Wizard must be used within a WizardProvider");
    console.warn("use Search must be used within a SearchProvider");
  }

  return context;
};

const SearchProvider = ({ children }: IProps) => {
  const [filters, setFilters] = useState([
    "All Data",
    "Source IP",
    "Country ( Philippines )",
  ]);

  const [query, setQuery] = useState("");

  const addFilter = (filter: string) => {
    setFilters((prev) => [...prev, filter]);
  };

  const handleOnChange = (e: any) => {
    console.log("%c Line:33 🍿 e", "color:#fca650", e);
    setQuery(e)
  } 
  const state = {
    filters,
    query
  } as IState

  const actions = {
    addFilter,
    handleOnChange
  } as IAction

  console.log("%c Line:38 🍿 state", "color:#fca650", {state, actions});
  return (
    <SearchContext.Provider value={{ state, actions }}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider