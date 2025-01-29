"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useEventEmitter } from "~/context/EventEmitterProvider";
import { useToast } from "~/context/ToastProvider";
import {
  ICallbackHandler,
  Summary,
  TStepsNavigationButtons,
  type IAction,
  type ICreateContext,
  type IState,
} from "./type";
import { omit } from "lodash";
import { SaveAndContinue } from "./Action/SaveAndContinue";
import { SaveAndNew } from "./Action/SaveAndNew";
import { SaveAndClose } from "./Action/SaveAndClose";
import { PrevPage } from "./Action/PrevPage";
// import { NextPage } from "./Action/NextPage";

import { api } from "~/trpc/react";
import useDeepCompareEffect from "./Hooks/useDeepCompareEffect";
import useTraverseStepped from "./Hooks/useTraverseStepped";
import useTraverseSteppedSaved from "./Hooks/useTraverseStepSave";
import usePrefetchWizardTraverse from "./Hooks/usePrefetchWizardTraverse";
import { NextPage } from "./Action/NextPage";
import { Create } from "../Grid/Action/Create";

// import { redis } from "~/lib/redis";
export const WizardContext = React.createContext<ICreateContext>({});

interface IProps {
  children: React.ReactNode;
  config: IState;
  summary?: Summary;
  stepsNavigation?: TStepsNavigationButtons;
}

export const useWizard = (): ICreateContext => {
  const context = useContext(WizardContext);
  if (!context) {
    // throw new Error("use Wizard must be used within a WizardProvider");
    console.warn("use Wizard must be used within a WizardProvider");
  }

  return context;
};

export default function WizardProvider({
  children,
  config,
  summary,
  stepsNavigation,
}: IProps) {
  // const utils = api.useUtils();
  /** @HOOKS */
  const router = useRouter();
  const eventEmitter = useEventEmitter();
  const toast = useToast();
  const searchParams = useSearchParams();
  // ! TO FINALIZE THE NAMING AND STRUCTURE OF THE PATH
  const path =
  usePathname().split("/");
  let [, portal, mainEntity, application = "wizard", identifier, step] = path;
  if (process.env.IS_PLAYGROUND) {
    const [, , playgroundPortal, playgroundApplication, , playgroundIdentifier, playgroundStep] = path
    portal = playgroundPortal
    application = playgroundApplication || "wizard"
    identifier = playgroundIdentifier
    step = playgroundStep
    mainEntity = "contact";
  }
  const currentContext = "/" + portal + "/" + mainEntity;

  // Now:
  // section -> Represents the main section of the portal (e.g., "contacts")
  // step -> Represents the specific step or page within the section (e.g., "grid")

  /** @HOOKS */

  /** @STATES */
  const [formSave, setFormSave] = React.useState<Record<string, string>>({});
  const [traverseSteps, setTraverseStep] = React.useState<
    Record<string, "Stepped">
  >({
    // one: "Stepped",
  });

  const [debugOn, setDebugOn] = React.useState(false);
  // const [currentStep, setCurrentStep] = React.useState(+(step || "1"));
  const [errorMessage] = React.useState<Record<string, string[]> | null>(null);

  const currentStep = useMemo(() => {
    return +(step || "1");
  }, [step]);

  const [prevLoading, setPrevLoading] = React.useState(false);
  const [saveContinueLoading, setSaveContinueLoading] = React.useState(false);
  const [saveNewLoading, setSaveNewLoading] = useState(false);
  const [saveCloseLoading, setSaveCloseLoading] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = React.useState(true);
  const [nextLoading, setNextLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
  const [savedStep, setSavedStep] = useState<null | number>(null);
  const [callbackHandlers, setCallbackHandlers] = useState<ICallbackHandler>(config?.callbackHandlers || {});

  /** @STATES */
  const nextStep = api.wizard.wizardCreateStep.useMutation();
  const prevStep = api.wizard.wizardCreateStep.useMutation();
  /** @USE_EFFECT */
  // const successfulHandlers = new Set<string>();

  const triggerHandler = () => {
    const filtered_handlers = Object.entries(formSave).reduce(
      (acc: string[], [key, value]: [string, string]) => {
        if (["failed", "dirty"].includes(value)) {
          return acc.concat(key);
        }
        return acc;
      },
      [],
    );
    if (!filtered_handlers.length) {
      handleIncrementStep(setNextLoading);
    }
    executeHandlers(filtered_handlers);
  };

  const executeHandlers = async (handlers: string[]) => {
    const response = await Promise.allSettled(
      handlers.map(
        (handler) =>
          new Promise<void>((resolve, reject) => {
            eventEmitter.emit(handler, resolve, reject);
          }),
      ),
    );

    setNextLoading(false);
    return response;
  };

  const processResults = (data: { status: string; form_key: string }) => {
    const { status, form_key } = data;
    const field_name =
      form_key == "action" ? form_key : `submitForm:${form_key}`;

    setFormSave((prev) => ({
      ...prev,
      [field_name]: status,
    }));

    if (status !== "done") return;

    setSavedStep(currentStep);
  };

  const handlePrev = async () => {
    setPrevLoading(true);
    handleDecrementStep();
    setFormSave({});
  };

  const handleIncrementStep = async (setLoading: (loading: any) => void) => {
    setLoading(true);
    // const steps = currentStep + 1;
    // nextStep.mutateAsync({
    //   entity: mainEntity!,
    //   identifier: identifier!,
    //   step: steps.toString(),
    // }).then(() => {
    //   setLoading(false)
    //   router.push()
    // });

    NextPage()
      .then(() => {
        setLoading(false);
        setFormSave({});
      })
      .catch(() => {
        setLoading(false);
        toast.error("Previous step failed");
      });
  };

  const handleDecrementStep = async () => {
    setPrevLoading(true);
    // ! CLIENT ACTIONS
    // prevStep.mutateAsync({
    //   entity: mainEntity!,
    //   identifier: identifier!,
    //   step: (currentStep - 1).toString(),
    // });
    // router.push(
    //   `/portal/${mainEntity}/wizard/${identifier}/${currentStep - 1}`,
    // );
    // ! SERVER ACTIONS
    PrevPage()
      .then(() => {
        setPrevLoading(false);
      })
      .catch(() => {
        setPrevLoading(false);
        toast.error("Previous step failed");
      });
  };

  const handleNext = async () => {
    try {
      setNextLoading(true);
      setFormSave((prev) => ({ ...prev, action: "next" }));
      triggerHandler();
    } catch (error) {
      console.error("An error occurred while incrementing the step", error);
      toast.error("Failed to increment step");
    }
  };

  const handleSkip = async () => {
    try {
      setFormSave({});
      handleIncrementStep(setSkipLoading);
    } catch (error) {
      console.error("An error occurred while incrementing the step", error);
      toast.error("Failed to increment step");
    }
  };

  const handleSaveAndClose = async () => {
    try {
      const data = {
        entity: mainEntity!,
        identifier: config?.entityIdentifier,
        currentContext: currentContext,
      }
      const next = async () => {
        await SaveAndClose(data);
      };
      setSaveCloseLoading(true);
      if (callbackHandlers?.onClickWizardSave) {
        await callbackHandlers?.onClickWizardSave({
          data,
          action_type: "save_close",
          next,
        });
        setSaveCloseLoading(false);
        return;
      }
      await next();
      setSaveCloseLoading(false);
    } catch (error) {
      console.error("An error occurred while saving and closing", error);
      setSaveCloseLoading(false);
    }
  };

  const handleSaveAndNew = async () => {
    try {
      const data = {
        entity: mainEntity!,
        enableAutoCreate: false,
        identifier: config?.entityIdentifier,
        currentContext: currentContext,
        is_from_grid: false,
      };
      const next = async () => {
        if (config?.enableAutoCreate === false) {
          Create(data);
          setSaveNewLoading(false);
          return;
        }
        await SaveAndNew(data);
      };
      setSaveNewLoading(true);
      if (callbackHandlers?.onClickWizardSave) {
        await callbackHandlers?.onClickWizardSave({
          data,
          action_type: "save_new",
          next,
        });
        setSaveNewLoading(false);
        return;
      }
      await next();
      setSaveNewLoading(false);
    } catch (error) {
      console.error("An error occurred while saving and new", error);
      setSaveNewLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    try {
      const data = {
        entity: mainEntity!,
        identifier: config?.entityIdentifier,
        currentContext: currentContext,
      }
      const next = async () => {
        await SaveAndContinue(data);
      };
      setSaveContinueLoading(true);
      if (callbackHandlers?.onClickWizardSave) {
        await callbackHandlers?.onClickWizardSave({
          data,
          action_type: "save_continue",
          next,
        });
        setSaveContinueLoading(false);
        return;
      }
      await next();
      setSaveContinueLoading(false);
    } catch (error) {
      console.error("An error occurred while saving and continuing", error);
      setSaveContinueLoading(false);
    }
  };

  const handleSummaryToggle = (state: boolean) => {
    setIsSummaryOpen(state);
  };

  const handleDebug = () => {
    setDebugOn(!debugOn);
  };

  const registerSaveHandler = (eventName: string) => {
    const formHandler = "submitForm:" + eventName;

    if (formSave?.[formHandler]) return;
    setFormSave((prev) => ({
      ...prev,
      [formHandler]: "dirty",
    }));

    eventEmitter.on(`formStatus:${eventName}`, processResults);
    // Clean up the listener when the component unmounts
    return () => {
      eventEmitter.off(`formStatus:${eventName}`, processResults);
    };
  };

  const unregisterSaveHandler = (eventName: string) => {
    const formHandler = "submitForm:" + eventName;
    setFormSave((prev) => omit(prev, formHandler));
  };
  const setCallback = (callback: ICallbackHandler) => {
    setCallbackHandlers((prev) => ({ ...prev, ...callback }));
  };

  useDeepCompareEffect(() => {
    if (formSave.action === "next") {
      const omitted_form_save = omit(formSave, "action");
      const form_values = Object.values(omitted_form_save).filter(
        (status) => status !== "done",
      );
      if (!form_values.length) {
        handleIncrementStep(setNextLoading);
      }
    }
  }, [formSave]);

  useEffect(() => {
    if (savedStep) return;
    setSavedStep(currentStep);
  }, [currentStep, savedStep]);

  usePrefetchWizardTraverse(
    `${mainEntity}:wizard:${identifier}`,
    setTraverseStep,
  );
  useTraverseSteppedSaved(traverseSteps);
  useTraverseStepped(savedStep, setTraverseStep);
  //get other way don't listen to currentStep
  const state_context = {
    debugOn,
    currentStep,
    errorMessage,
    stepLabels: config?.stepLabels,
    nextLoading,
    prevLoading,
    skipLoading,
    saveContinueLoading,
    saveNewLoading,
    saveCloseLoading,
    entityCode: config?.entityCode,
    entityName: mainEntity!.toLocaleLowerCase(),
    totalSteps: config?.totalSteps,
    formSave,
    summary,
    traverseSteps,
    isSummaryOpen,
    stepsNavigation,
    callbackHandlers,
  } as IState;

  const actions = {
    handleIncrementStep,
    handleDecrementStep,
    handleSaveAndContinue,
    handleSaveAndNew,
    handleSaveAndClose,
    handleDebug,
    registerSaveHandler,
    unregisterSaveHandler,
    handleNext,
    handlePrev,
    handleSummaryToggle,
    handleSkip,
    setFormSave,
    setSavedStep,
    setCallback,
  } as IAction;

  return (
    <WizardContext.Provider
      value={{
        state: state_context,
        actions: actions,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}
