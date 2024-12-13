import { UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { IFeatures, IPropsForms } from "../global/interfaces";
import { TDisplayType, TFormSchema } from "../global/types";
import { SetState } from "./types";


interface IAccordionLayoutProps extends IPropsForms {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  debugOn: boolean;
  isOpenGrid: string;
  isSaveLoading: boolean;
  isListLoading: boolean;
  isAccordionExpanded: boolean;
  isFormOpened: boolean;
  displayType: TDisplayType;
  formGridSelected: any[];
  showFormActions: boolean;
  handleCloseGrid: () => void;
  handleAccordionChange: (value: string) => void;
  handleListLoading: (loading: boolean) => void;
  handleDebug: (e: React.MouseEvent<HTMLButtonElement>) => void;
  setIsSaveLoading: SetState<boolean>;
  saveForm: (data: z.infer<TFormSchema>) => Promise<void>;
  handleLock: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleAccordionExpand: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onSubmitFormGrid: (data: z.infer<TFormSchema>) => Promise<void>;
  handleNewRecordFormFilterGrid: () => void;
  handleAppendForm: () => void;
  handleUpdateDisplayType: (type: TDisplayType) => void;
  handleRemovedSelectedRecords: (records: any[]) => void;
  handleOpenForm: (e: React.MouseEvent<HTMLButtonElement>) => void;
  setShowFormActions: SetState<boolean>;
  handleSearchOpen: () => void;
  isOpenSearch?: boolean;
}

export type {
  IAccordionLayoutProps
};
