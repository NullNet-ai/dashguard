'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useEventEmitter } from '~/context/EventEmitterProvider';
import { useToast } from '~/context/ToastProvider';
import {
  type ICallbackHandler,
  type Summary,
  type TStepsNavigationButtons,
  type IAction,
  type ICreateContext,
  type IState,
} from './type';
import { omit } from 'lodash';
import { SaveAndContinue } from './Action/SaveAndContinue';
import { SaveAndNew } from './Action/SaveAndNew';
import { SaveAndClose } from './Action/SaveAndClose';
import { PrevPage } from './Action/PrevPage';
// import { NextPage } from "./Action/NextPage";

import useDeepCompareEffect from './Hooks/useDeepCompareEffect';
import useTraverseSteppedSaved from './Hooks/useTraverseStepSave';
import { NextPage } from './Action/NextPage';
import { Create } from '../Grid/Action/Create';
import { useSocket } from '~/context/SocketProvider';
import numberToWords from './Utils/steptoWords';
import { api } from '~/trpc/react';

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
    console.warn('use Wizard must be used within a WizardProvider');
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
  const utils = api.useUtils();
  // ! TO FINALIZE THE NAMING AND STRUCTURE OF THE PATH
  const path = usePathname().split('/');
  const [, portal, mainEntity, application = 'wizard', identifier, step] = path;
  const currentContext = '/' + portal + '/' + mainEntity;

  // Now:
  // section -> Represents the main section of the portal (e.g., "contacts")
  // step -> Represents the specific step or page within the section (e.g., "grid")

  /** @HOOKS */
  /** @STATES */
  const [formSave, setFormSave] = React.useState<Record<string, string>>({});
  const [traverseSteps, setTraverseStep] = React.useState<
    Record<string, 'Stepped'>
  >(
    config?.traverseSteps || {
      one: 'Stepped',
    },
  );
  console.debug('traverseSteps', traverseSteps);

  const [debugOn, setDebugOn] = React.useState(false);
  // const [currentStep, setCurrentStep] = React.useState(+(step || "1"));
  const [errorMessage] = React.useState<Record<string, string[]> | null>(null);

  const currentStep = useMemo(() => {
    return +(step || '1');
  }, [step]);

  const [prevLoading, setPrevLoading] = React.useState(false);
  const [saveContinueLoading, setSaveContinueLoading] = React.useState(false);
  const [saveNewLoading, setSaveNewLoading] = useState(false);
  const [saveCloseLoading, setSaveCloseLoading] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = React.useState(true);
  const [nextLoading, setNextLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
  const [savedStep, setSavedStep] = useState<null | number>(null);
  const [callbackHandlers, setCallbackHandlers] = useState<ICallbackHandler>(
    config?.callbackHandlers || {},
  );

  const socketClient = useSocket();

  /** @STATES */
  const nextStep = api.wizard.wizardCreateStep.useMutation();
  // const prevStep = api.wizard.wizardCreateStep.useMutation();
  /** @USE_EFFECT */
  // const successfulHandlers = new Set<string>();

  const triggerHandler = () => {
    const filtered_handlers = Object.entries(formSave).reduce(
      (acc: string[], [key, value]: [string, string]) => {
        if (['failed', 'dirty'].includes(value)) {
          return acc.concat(key);
        }
        return acc;
      },
      [],
    );

    if (!filtered_handlers.length) {
      handleIncrementStep(setNextLoading);
    } else {
      setNextLoading(false);
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
    return response;
  };

  const processResults = (data: { status: string; form_key: string }) => {
    const { status, form_key } = data;
    const field_name =
      form_key == 'action' ? form_key : `submitForm:${form_key}`;

    setFormSave((prev) => ({
      ...prev,
      [field_name]: status,
    }));

    if (status !== 'done') return;

    setSavedStep(currentStep);
  };

  const handlePrev = async () => {
    setPrevLoading(true);
    handleDecrementStep();
    setFormSave({});
  };

  const handleIncrementStep = async (setLoading: (loading: any) => void) => {
    try {
      setNextLoading(true);
      const next = () => {
        nextStep
          .mutateAsync({
            entity: mainEntity!,
            identifier: identifier!,
            step: steps.toString(),
          })
          .then(() => {
            setLoading(false);
            setFormSave({});
            router.push(`/portal/${mainEntity}/wizard/${identifier}/${steps}`);
          });
      };
      const steps = currentStep + 1;
      if (config?.customNextNavigationAction?.[numberToWords(currentStep)]) {
        await config?.customNextNavigationAction?.[
          numberToWords(currentStep)
        ]?.({
          entity: mainEntity!,
          identifier: identifier!,
          next,
          setNextLoading,
        });
        return;
      }
      next();
      // await NextPage()
      //   .then(() => {
      //     setNextLoading(false);
      //     setFormSave({});
      //   })
      //   .catch((error) => {
      //     setNextLoading(false);
      //     if (error.message !== 'NEXT_REDIRECT') {
      //       toast.error('Previous step failed');
      //     }
      //     setFormSave({});
      //   })
      //   .finally(() => {
      //     setFormSave({});
      //     setNextLoading(false);
      //   });
    } catch (error) {
      setNextLoading(false);
    }
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
      .catch((error) => {
        setPrevLoading(false);
        if (error.message !== 'NEXT_REDIRECT') {
          toast.error('Previous step failed');
        }
      });
  };

  const handleNext = async () => {
    try {
      setNextLoading(true);
      setFormSave((prev) => ({ ...prev, action: 'next' }));
      triggerHandler();
    } catch (error) {
      console.error('An error occurred while incrementing the step', error);
      toast.error('Failed to increment step');
    }
  };

  const handleSkip = async () => {
    try {
      setFormSave({});
      handleIncrementStep(setSkipLoading);
    } catch (error) {
      console.error('An error occurred while incrementing the step', error);
      toast.error('Failed to increment step');
    }
  };

  const handleSaveAndClose = async () => {
    try {
      const data = {
        entity: mainEntity!,
        identifier: config?.entityIdentifier,
        currentContext: currentContext,
        ormEntity: config?.ormEntity,
      };
      const next = async (toastMessage?: string) => {
        if (toastMessage) {
          toast.success(toastMessage);
        }
        await SaveAndClose(data);
      };
      setSaveCloseLoading(true);
      if (callbackHandlers?.onClickWizardSave) {
        await callbackHandlers?.onClickWizardSave({
          data,
          action_type: 'save_close',
          socketClient,
          next,
        });

        setSaveCloseLoading(false);
        return;
      }
      await next();
      setSaveCloseLoading(false);
    } catch (error) {
      console.error('An error occurred while saving and closing', error);
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
        ormEntity: config?.ormEntity,
      };
      const next = async (toastMessage?: string) => {
        if (config?.enableAutoCreate === false) {
          Create(data);
          setSaveNewLoading(false);
          return;
        }
        if (toastMessage) {
          toast.success(toastMessage);
        }
        await SaveAndNew(data);
      };
      setSaveNewLoading(true);
      if (callbackHandlers?.onClickWizardSave) {
        await callbackHandlers?.onClickWizardSave({
          data,
          action_type: 'save_new',
          socketClient,
          next,
        });
        setSaveNewLoading(false);
        return;
      }
      await next();
      setSaveNewLoading(false);
    } catch (error) {
      console.error('An error occurred while saving and new', error);
      setSaveNewLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    try {
      const data = {
        entity: mainEntity!,
        identifier: config?.entityIdentifier,
        currentContext: currentContext,
        ormEntity: config?.ormEntity,
      };
      const next = async (toastMessage?: string) => {
        if (toastMessage) {
          toast.success(toastMessage);
        }
        await SaveAndContinue({
          ...data,
          defaultRecordTab: config?.defaultRecordTab,
        });
      };
      setSaveContinueLoading(true);
      if (callbackHandlers?.onClickWizardSave) {
        await callbackHandlers?.onClickWizardSave({
          data,
          action_type: 'save_continue',
          socketClient,
          next,
        });
        setSaveContinueLoading(false);
        return;
      }
      await next();
      setSaveContinueLoading(false);
    } catch (error) {
      console.error('An error occurred while saving and continuing', error);
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
    const formHandler = 'submitForm:' + eventName;

    if (formSave?.[formHandler]) return;
    setFormSave((prev) => ({
      ...prev,
      [formHandler]: 'dirty',
    }));

    eventEmitter.on(`formStatus:${eventName}`, processResults);
    // Clean up the listener when the component unmounts
    return () => {
      eventEmitter.off(`formStatus:${eventName}`, processResults);
    };
  };

  const unregisterSaveHandler = (eventName: string) => {
    const formHandler = 'submitForm:' + eventName;
    setFormSave((prev) => omit(prev, formHandler));
  };
  const setCallback = (callback: ICallbackHandler) => {
    setCallbackHandlers((prev) => ({ ...prev, ...callback }));
  };

  useDeepCompareEffect(() => {
    if (formSave.action === 'next') {
      const omitted_form_save = omit(formSave, 'action');
      const form_values = Object.values(omitted_form_save).filter(
        (status) => status !== 'done',
      );
      const checkIfCustomNavigation =
        config?.customNavigation?.[numberToWords(currentStep)] ?? false;

      if (!form_values.length && !checkIfCustomNavigation) {
        handleIncrementStep(setNextLoading);
      }
    }
  }, [formSave]);

  useEffect(() => {
    setNextLoading(false);
  }, [step]);

  useTraverseSteppedSaved(traverseSteps, setTraverseStep);

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
    title: config?.title,
    customNavigation: config?.customNavigation,
    enableTimeline: config?.enableTimeline,
    metadata: config?.metadata,
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
