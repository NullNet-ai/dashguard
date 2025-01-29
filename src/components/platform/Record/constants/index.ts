"use client";
import { updateRecordState } from "../actions/updateRecordState";
import { IMemoizedRecordData } from "../Summary/Menu/DefaultSummaryMenuOptions";
import { IMenuOptionConfig } from "../types";

export const getDefaultMenuOptionConfig = (
  recordData: IMemoizedRecordData,
): IMenuOptionConfig[] => {
  const recordStateItems = ["Active", "Draft", "Archived"].filter(
    (state) => state !== recordData.status,
  );
  return [
    // add default menu options here
    {
      label: "Change Record State",
      onClick: () => ({}),
      children: recordStateItems.map((status) => {
        const label = status === "Archived" ? "Archive" : status;
        return {
          label,
          onClick: async (identifier, entity, handleLoadingStateChange) => {
            handleLoadingStateChange(label, true);
            await updateRecordState({ identifier, entity, status });
          },
        };
      }),
    },
  ];
};
