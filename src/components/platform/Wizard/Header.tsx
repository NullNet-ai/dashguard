"use client";

import {
  BugAntIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useContext, useMemo } from "react";
import { Button } from "~/components/ui/button";
import WizardNavigator from "./BreadCrumbs";
import Validation from "./Error/Validation";
import { WizardContext } from "./Provider";
import { ButtonWithDropdown } from "../ButtonWithDropdown";
import React from "react";
import DebuggerComponent from "./Debugger";
import MyVerticalStepper from "./Stepper";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import numberToWords from "./Utils/steptoWords";
import { type NumberWords } from "./type";
import { testIDFormatter } from "~/utils/formatter";
import { SaveIcon } from "lucide-react";

export default function Header() {
  const { state, actions } = useContext(WizardContext);

  const {
    currentStep = 1,
    totalSteps = 5,
    errorMessage,
    prevLoading,
    nextLoading,
    skipLoading,
    saveContinueLoading,
    saveNewLoading,
    saveCloseLoading,
    debugOn,
    entityName,
    stepsNavigation,
  } = state ?? {};

  const {
    handleNext,
    handlePrev,
    handleSkip,
    handleSaveAndContinue,
    handleSaveAndClose,
    handleSaveAndNew,
    handleDebug,
  } = actions ?? {};

  const [isOpen, setIsOpen] = React.useState(false);

  const {
    next: enabled_next = true,
    prev: enabled_prev = true,
    skip: enabled_skip = false,
  } = useMemo(() => {
    const index = numberToWords(currentStep);

    return (
      stepsNavigation?.[index as NumberWords] || {
        next: true,
        prev: true,
        skip: false,
      }
    );
  }, [currentStep, stepsNavigation]);

  const customizedButton = state?.callbackHandlers?.customizeWizardButtonSave;

  return (
    <>
      <div className="flex w-full flex-col items-start justify-start gap-y-2 rounded px-2 py-2 pb-2 text-foreground sm:items-center md:h-[44px] md:flex-row md:items-center md:justify-between md:gap-0 md:py-1 md:pb-1">
        <div className="flex flex-row items-center justify-start">
          <Collapsible
            onOpenChange={setIsOpen}
            className="lg-block hidden border-b-2 border-primary px-4 py-2"
          >
            <CollapsibleTrigger asChild>
              <Button
                name="toggleStepper"
                data-test-id={testIDFormatter(
                  `${entityName}-wzrd-toggle-stepper`,
                )}
                variant={"ghost"}
                className="items-end gap-2 p-0"
              >
                <WizardNavigator />
                {isOpen ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <MyVerticalStepper />
            </CollapsibleContent>
          </Collapsible>

          <div className="md:p-4 md:px-2">
            <span className="text-sm font-bold text-foreground">
              <WizardNavigator />
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {currentStep > 1 && (
            <Button
              data-test-id={testIDFormatter(`${entityName}-wzrd-prev-btn`)}
              disabled={!enabled_prev || currentStep === 1 || prevLoading}
              variant={"outline"}
              loading={prevLoading}
              onClick={handlePrev}
              size={"xs"}
              className="gap-1"
            >
              <ChevronLeftIcon
                className="h-3 w-3 text-slate-400"
                strokeWidth={4}
              />
              <span className="text-foreground">Prev</span>
            </Button>
          )}
          <Button
            name="wizardDebugButton"
            data-test-id={testIDFormatter(`${entityName}-wzrd-debug-btn`)}
            size={"icon"}
            variant={"ghost"}
            className="m-auto h-6 w-6 rounded-full bg-rose-200"
            onClick={handleDebug}
          >
            <BugAntIcon className="h-4 w-4 cursor-pointer rounded-full border text-red-500" />
          </Button>

          {currentStep === totalSteps ? (
            <div className="flex flex-row items-center">
              <Button
                data-test-id={testIDFormatter(
                  `${entityName}-wzrd-save-continue-btn`,
                )}
                className="gap-1 rounded-r-none"
                loading={saveContinueLoading}
                size={"sm"}
                onClick={handleSaveAndContinue}
                disabled={
                  customizedButton?.disabled ||
                  saveContinueLoading ||
                  saveCloseLoading ||
                  saveNewLoading
                }
              >
                {customizedButton?.icon ? (
                  customizedButton?.icon
                ) : (
                  <SaveIcon className="h-4 w-4" />
                )}
                <span>{customizedButton?.label || "Save & Continue"}</span>
              </Button>
              {customizedButton?.disableDropdown ? null : (
                <ButtonWithDropdown
                  entity={entityName}
                  buttonClassName="rounded-l-none"
                  buttonVariant={"default"}
                  dropdownOptions={[
                    {
                      label:
                        customizedButton?.dropdownOptions?.[0]?.label ||
                        "Save & Close",
                      onClick: handleSaveAndClose!,
                      loading: saveCloseLoading,
                    },
                    {
                      label:
                        customizedButton?.dropdownOptions?.[1]?.label ||
                        "Save & New",
                      onClick: handleSaveAndNew!,
                      loading: saveNewLoading,
                    },
                  ]}
                  disabled={
                    customizedButton?.disabled ||
                    saveContinueLoading ||
                    saveCloseLoading ||
                    saveNewLoading
                  }
                />
              )}
            </div>
          ) : (
            <>
              {currentStep > 1 && (
                <Button
                  data-test-id={testIDFormatter(`${entityName}-wzrd-skip-btn`)}
                  variant={"outline"}
                  loading={skipLoading}
                  size={"sm"}
                  disabled={
                    !enabled_skip || currentStep === totalSteps || skipLoading
                  }
                  onClick={handleSkip}
                >
                  <span className="text-foreground">Skip</span>
                  <ChevronRightIcon
                    className="h-3 w-3 text-slate-400"
                    strokeWidth={4}
                  />
                </Button>
              )}

              <Button
                data-test-id={testIDFormatter(`${entityName}-wzrd-next-btn`)}
                loading={nextLoading}
                size={"sm"}
                disabled={
                  !enabled_next || currentStep === totalSteps || nextLoading
                }
                onClick={handleNext}
                className="gap-1"
              >
                <span>Next</span>
                <ChevronRightIcon className="h-3 w-3" strokeWidth={4} />
              </Button>
            </>
          )}
        </div>
      </div>
      {debugOn && <DebuggerComponent />}
      <Validation
        dataTestId={testIDFormatter(`${entityName}-wzrd-validation-msg`)}
        messages={errorMessage ?? {}}
      />
    </>
  );
}
