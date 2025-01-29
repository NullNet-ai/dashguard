import { ReactElement } from "react";

export type IValidationType = "required" | "date" | "unique";
export interface IConfigValidationWizard {
  key: string;
  type: IValidationType[];
}

export interface IConfigWizard {
  currentStep?: number;
  totalSteps: number;
  entityName?: string;
  entityCode?: string;
  entityIdentifier: string;
  enableAutoCreate?: boolean;
  stepLabels?: Record<number, string>;
  errorMessage?: Record<string, string[]> | null;
  nextLoading?: boolean;
  prevLoading?: boolean;
  skipLoading?: boolean;
  debugOn?: boolean;
  saveContinueLoading?: boolean;
  saveNewLoading?: boolean;
  saveCloseLoading?: boolean;
  formSave?: Record<string, string>;
  stepValidation?: Record<string, IConfigValidationWizard[]>;
}
export interface ICallbackHandler {
  onClickWizardSave?: (args: {
    data: Record<string, any>;
    /**
     * action_type is just an identifier to determine which action is being performed
     */
    action_type: "save_new" | "save_continue" | "save_close";
    /**
     * next() will continue to the default next step
     */
    next: () => Promise<void>;
  }) => Promise<void>;
  customizeWizardButtonSave?: {
    label?: string;
    icon?: ReactElement;
    disableDropdown?: boolean;
    disabled?: boolean;
    dropdownOptions?: Array<{
      label: string;
    }>;
  };
}

export type NumberWords =
  | "one"
  | "two"
  | "three"
  | "four"
  | "five"
  | "six"
  | "seven"
  | "eight"
  | "nine"
  | "ten"
  | "eleven"
  | "twelve"
  | "thirteen"
  | "fourteen"
  | "fifteen"
  | "sixteen"
  | "seventeen"
  | "eighteen"
  | "nineteen"
  | "twenty"
  | "twenty-one"
  | "twenty-two"
  | "twenty-three"
  | "twenty-four"
  | "twenty-five"
  | "twenty-six"
  | "twenty-seven"
  | "twenty-eight"
  | "twenty-nine"
  | "thirty";

export type TStepsNavigationButtons = {
  [key in NumberWords]?: {
    next: boolean;
    prev: boolean;
    skip: boolean;
  };
};
export type TSummaryComponents = {
  component: JSX.Element;
  label: string;
};

export type Summary = {
  [key in NumberWords]?: {
    label: string;
    components: TSummaryComponents[];
    required?: boolean;
  };
};

export interface IState extends IConfigWizard {
  test?: any;
  summary?: Summary | undefined;
  traverseSteps?: Record<string, "Stepped">;
  isSummaryOpen?: boolean;
  stepsNavigation?: TStepsNavigationButtons;
  callbackHandlers?: ICallbackHandler;
}

export interface IAction {
  handleIncrementStep: (setLoading: (value: boolean) => void) => void;
  handleDecrementStep: () => void;
  handleSaveAndContinue: () => void;
  handleSaveAndClose: () => void;
  handleSaveAndNew: () => void;
  handleDebug: () => void;
  registerSaveHandler: (eventName: string) => void;
  unregisterSaveHandler: (eventName: string) => void;
  handleNext: () => Promise<void> | void;
  handlePrev: () => Promise<void> | void;
  handleSummaryToggle: (isOpen: boolean) => void;
  handleSkip: () => Promise<void> | void;
  setFormSave: (formSave: Record<string, string>) => void;
  setSavedStep: (step: number) => void;
  setCallback: (callbackHandler: ICallbackHandler) => void;
}

export interface ICreateContext {
  state?: IState;
  actions?: IAction;
}
