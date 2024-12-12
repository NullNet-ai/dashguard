import archive from "../actions/archive";
import { IMenuOptionConfig } from "../types";

export const CHANGE_RECORD_STATE = "Change Record State";

export const DEFAULT_MENU_OPTION_CONFIG: IMenuOptionConfig[] = [
  // add change record state option that has children of archive and delete
  {
    label: CHANGE_RECORD_STATE,
    onClick: () => ({}),
    children: [
      {
        label: "Archive",
        onClick: async (recordId: string, entityName: string) => {
          await archive(recordId, entityName);
        },
        children: [],
      },
    ],
  },
];
