"use client";
import React, { type PropsWithChildren, useState } from "react";
import { type IAction, type ICreateContext, type IState } from "./types";

export const SearchGridContext = React.createContext<ICreateContext>({});

interface IProps extends PropsWithChildren {
  test?: any;
}

const projects = [
  { id: 1, name: "Workflow Inc. / Website Redesign", url: "#" },
  // More projects...
];
const recent = [projects[0]];

export default function GridSearchProvider({ children }: IProps) {
  /** @STATES */
  const [_query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [searchSelected, setSearchSelected] = useState<
    Record<string, unknown>[]
  >([]);
  const handleQuery = (data: React.SetStateAction<string>) => {
    setQuery(data);
  };

  const handleOpen = (open: boolean) => {
    setOpen(open);
  };

  const handleSearchSelected = (data: Record<string, unknown>) => {
    setSearchSelected((prev) => [...prev, data]);
  };

  const state_context = {
    data: projects,
    recentView: recent,
    open,
    searchSelected,
  } as IState;
  const actions = {
    handleQuery,
    handleOpen,
    handleSearchSelected,
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
