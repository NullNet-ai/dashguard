"use client";
import { IMenuOptionConfig } from "~/components/platform/Record/types";
import { handleChangeStatus } from ".";
const statusOptions = [
  // {
  //   label: "Identifier Option One",
  //   onClick: handleChangeStatus.bind(null, "Passed"),
  // },
  // {
  //   label: "Identifier Option Two",
  //   onClick: handleChangeStatus.bind(null, "Test"),
  //   children: [
  //     {
  //       label: "Identifier Option Three",
  //       onClick: handleChangeStatus.bind(null, "Test"),
  //     },
  //     {
  //       label: "Identifier Option Four",
  //       onClick: handleChangeStatus.bind(null, "Test"),
  //     },
  //   ],
  // },
] as IMenuOptionConfig[];

export default statusOptions;
