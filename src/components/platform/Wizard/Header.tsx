"use client";

import {
  BookmarkSquareIcon,
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
import { NumberWords } from "./type";

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
  }, [currentStep]);

  return (
    <>
      <div className="flex flex-row items-center justify-between rounded text-foreground sm:items-center">
        <div className="flex flex-row items-baseline justify-start">
          <Collapsible
            onOpenChange={setIsOpen}
            className="lg-block hidden border-b-2 border-primary px-4 py-2"
          >
            <CollapsibleTrigger asChild>
              <Button
                name="toggleStepper"
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
          <div className="hidden p-4 lg:block">
            <WizardNavigator />
          </div>
          <div className="p-4 px-2 lg:hidden">
            <span className="text-sm font-bold text-foreground">Title </span>
          </div>
        </div>
        <div className="my-auto flex flex-row space-x-2 px-4">
          <Button
            name="wizardDebugButton"
            size={"icon"}
            variant={"ghost"}
            className="m-auto h-6 w-6 rounded-full bg-rose-200"
            onClick={handleDebug}
          >
            <BugAntIcon className="h-4 w-4 cursor-pointer rounded-full border text-red-500" />
          </Button>
          <Button
            data-test-id="wizardPrevButton"
            disabled={!enabled_prev || currentStep === 1 || prevLoading}
            loading={prevLoading}
            onClick={handlePrev}
            size={"sm"}
            Icon={ChevronLeftIcon}
            iconPlacement="left"
            className="border bg-secondary text-foreground hover:bg-secondary/80"
          >
            <span className="m-auto text-foreground">Prev</span>
          </Button>
          {currentStep === totalSteps ? (
            <div className="flex flex-row space-x-0.5">
              <Button
                data-test-id="wizardSaveContinueButton"
                className="rounded-r-none"
                loading={saveContinueLoading}
                Icon={BookmarkSquareIcon}
                iconPlacement="right"
                onClick={handleSaveAndContinue}
                disabled={
                  saveContinueLoading || saveCloseLoading || saveNewLoading
                }
              >
                <span>Save & Continue</span>
              </Button>
              <ButtonWithDropdown
                buttonClassName="rounded-l-none"
                buttonVariant={"default"}
                dropdownOptions={[
                  {
                    label: "Save & Close",
                    onClick: handleSaveAndClose!,
                    loading: saveCloseLoading,
                  },
                  {
                    label: "Save & New",
                    onClick: handleSaveAndNew!,
                    loading: saveNewLoading,
                  },
                ]}
                disabled={
                  saveContinueLoading || saveCloseLoading || saveNewLoading
                }
                loading={saveContinueLoading} // Pass the loading state for the main button
              />
            </div>
          ) : (
            <>
              <Button
                data-test-id="wizardSkipButton"
                loading={skipLoading}
                disabled={
                  !enabled_skip || currentStep === totalSteps || skipLoading
                }
                onClick={handleSkip}
                size={"sm"}
                className="m-auto border bg-secondary text-foreground hover:bg-secondary/80"
                Icon={ChevronRightIcon}
              >
                <span className=" ">Skip</span>
              </Button>
              <Button
                data-test-id="wizardNextButton"
                loading={nextLoading}
                disabled={
                  !enabled_next || currentStep === totalSteps || nextLoading
                }
                onClick={handleNext}
                size={"sm"}
                className="m-auto"
                Icon={ChevronRightIcon}
              >
                <span className=" ">Next</span>
              </Button>
            </>
          )}
        </div>
      </div>
      {debugOn && <DebuggerComponent />}
      <Validation messages={errorMessage ?? {}} />
    </>
  );
}
