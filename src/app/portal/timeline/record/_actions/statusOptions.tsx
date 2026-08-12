"use client";
import { IMenuOptionConfig } from "~/components/platform/Record/types";
import { handleChangeStatus } from ".";
const statusOptions = [
  {
    label: "Screening",
    onClick: handleChangeStatus.bind(null, "Screening"),
  },
  {
    label: "Assessment Test",
    onClick: handleChangeStatus.bind(null, "Assessment Test"),
  },
  {
    label: "Interview",
    onClick: handleChangeStatus.bind(null, "Interview"),
  },
  {
    label: "Pending",
    onClick: handleChangeStatus.bind(null, "Pending"),
  },
  {
    label: "Hired",
    onClick: handleChangeStatus.bind(null, "Hired"),
  },
  {
    label: "Failed",
    onClick: handleChangeStatus.bind(null, "Failed"),
  },
  {
    label: "On Hold",
    onClick: handleChangeStatus.bind(null, "On Hold"),
  },
  {
    label: "Job",
    onClick: handleChangeStatus.bind(null, "Job Offered"),
  },
] as IMenuOptionConfig[];

export default statusOptions;
