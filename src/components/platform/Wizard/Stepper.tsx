"use client";
import { useContext, useMemo, useState } from "react";
import { WizardContext } from "./Provider";
import { cn } from "~/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useToast } from "~/context/ToastProvider";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { AccordionContent } from "@radix-ui/react-accordion";
import numberToWords from "./Utils/steptoWords";
import useDeepCompareEffect from "./Hooks/useDeepCompareEffect";
import { Summary, TSummaryComponents } from "./type";
import { testIDFormatter } from "~/utils/formatter";

const getNotRequiredSteps = (steps: Summary) => {
  if (!steps) return [];

  const result = [];
  let found_required_step = false;

  for (const [key, value] of Object.entries(steps)) {
    if (value.required) {
      found_required_step = true;
    }
    if (!value.required) {
      if (found_required_step) {
        break;
      }
      result.push(key);
    }
  }

  return result;
};

export default function MyVerticalStepper() {
  const { state, actions } = useContext(WizardContext);
  const router = useRouter();
  const toast = useToast();
  const { entityName } = state ?? {};

  const traverseSteps = useMemo(() => {
    return state?.traverseSteps;
  }, [state?.traverseSteps]);

  const stepsArray = useMemo(() => {
    return Array.from({ length: state?.totalSteps || 0 }, (_, i) => i + 1);
  }, [state?.totalSteps]);

  const pathName = usePathname();
  const searchParams = useSearchParams();
  const fullSearchQueryParams = searchParams.toString();
  const pathArray = pathName.split("/");
  const [availableSteps, setAvailableSteps] = useState<string[]>([]);

  useDeepCompareEffect(() => {
    const available_steps = getNotRequiredSteps(state?.summary!);
    const stepped = Object.keys(traverseSteps || {});

    setAvailableSteps([...new Set([...stepped, ...available_steps])]);
  }, [state?.traverseSteps]);

  const defaultValueAccordionItems = useMemo(() => {
    return Object.values(state?.summary || {}).reduce(
      (acc: string[], { components }) => {
        const labels = components.map(
          (
            {
              label,
            }: {
              label: string;
            },
            idx: number,
          ) => idx + label,
        );
        return [...acc, ...labels];
      },
      [],
    );
  }, []);

  const isSummOpen = state?.isSummaryOpen;

  return (
    <div className="scrollbar-hide h-[calc(100vh-10rem)] overflow-y-auto">
      <Accordion
        // onValueChange={(value) => {
        // }}
        defaultValue={defaultValueAccordionItems}
        type="multiple"
        data-test-id={testIDFormatter(
          `${entityName}-wzrdsum-stepper-accordion`,
        )}
        className="flex flex-col items-center"
      >
        <div
          className={cn(
            "relative hidden  after:bg-gray-200 after:hover:bg-gray-300 sm:block sm:p-[12px]",
            { "text-center sm:p-0": !isSummOpen },
            `${isSummOpen ? "w-full" : "w-[30px]"}`,
          )}
        >
          <ol role="list" className="overflow-hidden">
            {stepsArray?.map((step, stepIdx) => {
              const stepIndex = stepIdx + 1;
              const index = numberToWords(stepIndex);
              const isStepped = traverseSteps?.[index] === "Stepped";
              const isCurrent = state?.currentStep === stepIndex;

              pathArray.pop();
              pathArray.push(`${step}`);

              const _completeLink = pathArray.join("/");

              const navigateLink = (index: string) => {
                if (!availableSteps.includes(index)) {
                  toast.error("Prior steps must be completed first.");
                  return;
                }
                actions?.setFormSave({});

                router.push(
                  fullSearchQueryParams
                    ? `${_completeLink}?${fullSearchQueryParams}`
                    : _completeLink,
                );
              };
              // @ts-expect-error - SummaryComponent is not defined
              const summary_details = state?.summary?.[index];
              if (isCurrent && !!summary_details?.show_summary) {
                actions?.setSavedStep(stepIndex);
              }

              const summaryTitle = summary_details?.label;
              const summaryComponents = summary_details?.components?.length
                ? summary_details?.components
                : null;

              return (
                <li
                  key={stepIndex}
                  data-test-id={testIDFormatter(
                    `${entityName}-wzrdsum-stepper-accordion-itm-${stepIndex}`,
                  )}
                  className={cn(
                    stepIdx !== stepsArray.length - 1 ? "relative pb-[24px]" : "",
                  )}
                >
                  {isStepped || isCurrent ? (
                    <div className="flex flex-1">
                      {isCurrent ? (
                        stepIdx !== stepsArray.length - 1 ? (
                          <div
                            aria-hidden="true"
                            className={cn(
                              "absolute left-3 top-4 -ml-px mt-0.5 h-full w-0.5 bg-primary",
                              { "-ml-px": isSummOpen },
                            )}
                          />
                        ) : (
                          <>
                            {stepsArray.length > stepIdx + 1 ? (
                              <div
                                aria-hidden="true"
                                className="absolute left-3 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                              />
                            ) : null}
                          </>
                        )
                      ) : (
                        <>  
                          {stepsArray.length > stepIdx + 1 ? (
                            <div
                              aria-hidden="true"
                              className="absolute left-3 top-4 -ml-px mt-0.5 h-full w-0.5 bg-primary"
                            />
                          ) : null}
                        </>
                      )}
                      <button
                        onClick={() => navigateLink(index)}
                        data-test-id={testIDFormatter(
                          `${entityName}-wzrdsum-stepper-accordion-itm-${stepIndex}-link`,
                        )}
                        className="group relative flex cursor-pointer items-start"
                      >
                        <span className="flex h-9 items-center">
                          {isCurrent ? (
                            <span
                              aria-hidden="true"
                              className="flex h-9 items-center"
                            >
                              <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-4 border-primary bg-white" />
                            </span>
                          ) : (
                            <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-4 bg-primary group-hover:bg-primary" />
                          )}
                        </span>
                      </button>
                      <span
                        className={cn("ml-[10px] flex min-w-0 flex-col pt-2.5", {
                          "hidden h-0 w-0": !isSummOpen,
                        })}
                      >
                        {/* Hidden on mobile, visible from small screens (sm) and up */}
                        {/* this is the title */}
                        <span className="text-xs sm:block text-primary">
                          {summaryTitle
                            ? summaryTitle
                            : "Description of Step " + stepIndex}
                        </span>
                        {summaryComponents?.map(
                          (
                            { component, label }: TSummaryComponents,
                            idx: number,
                          ) => {
                            return (
                              <AccordionItem
                                key={idx + label}
                                value={idx + label}
                                className="flex flex-col pt-2"
                              >
                                <AccordionTrigger
                                  data-test-id={testIDFormatter(
                                    `${entityName}-wzrdsum-stepper-accordion-itm-${stepIndex}-trigger-${label}`,
                                  )}
                                >
                                  <span className="text-sm font-medium sm:block">
                                    {label
                                      ? label
                                      : "Description of Step " + stepIndex}
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="text-sm font-medium sm:block mt-[8px]">
                                    {component}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          },
                        )}
                        {/* This will be hidden on mobile screens */}
                      </span>
                    </div>
                  ) : (
                    <>
                      {
                        // Last  step should not have a line
                        stepIdx !== stepsArray.length - 1 && (
                          <div
                            aria-hidden="true"
                            className="absolute left-3 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                          />
                        )
                      }
                      <div
                        // href={completeLink(index)}
                        onClick={() => navigateLink(index)}
                        // href={"#"}
                        className="group relative flex items-start"
                      >
                        <span
                          aria-hidden="true"
                          className="flex h-9 items-center"
                        >
                          <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-4 border-gray-300 bg-white group-hover:border-gray-400"></span>
                        </span>
                        <span className="ml-[10px] flex min-w-0 flex-col pt-2.5">
                          {/* This will be hidden on mobile screens */}
                          <span className="text-sm text-gray-500 sm:block">
                            {summaryTitle
                              ? summaryTitle
                              : "Description of Step " + stepIndex}
                          </span>
                        </span>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </Accordion>
    </div>
  );
}
