import { UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { IButtonConfig, IFeatures, IFilterGridConfig } from "../global/interfaces";
import { TDisplayType, TFormSchema } from "../global/types";

interface IFormHeaderProps {
  buttonConfig?: IButtonConfig;
  form: UseFormReturn<Record<string, any>, any, undefined>;
  formLabel: string;
  formSchema: z.ZodObject<any, any> | z.ZodEffects<z.ZodObject<any, any>>;
  isButtonLoading: boolean;
  isListLoading?: boolean;
  open: boolean;
  headerClassName?: string;
  buttonHeaderRender?: JSX.Element;
  filterGridConfig?: IFilterGridConfig;
  displayType: TDisplayType;
  enableAppendForm?: boolean;
  handleAppendForm(): void;
  handleNewRecordFormFilterGrid: () => void;
  handleDebug: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleLock: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleOpen: (e: React.MouseEvent<HTMLButtonElement>) => void;
  saveForm(data: z.infer<TFormSchema>): Promise<void>;
  selectedRecords: any[];
  handleUpdateDisplayType: (type: TDisplayType) => void;
  formKey: string,
  features : IFeatures | undefined;
  formProps?: any
}

export type {
  IFormHeaderProps
};
