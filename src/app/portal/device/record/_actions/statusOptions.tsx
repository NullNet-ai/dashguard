"use client";
import { IMenuOptionConfig } from "~/components/platform/Record/types";
import { handleChangeStatus } from ".";
const statusOptions = [
  {
    label: "Remote Access",
    onClick: handleChangeStatus.bind(null, "remote_access"),
  },
] as IMenuOptionConfig[];

export default statusOptions;
