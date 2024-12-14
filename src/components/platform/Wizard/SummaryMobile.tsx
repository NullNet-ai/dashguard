"use client";

import {
  MicrophoneIcon,
  PaperClipIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  CheckIcon,
  ChevronDown,
  FolderSearchIcon,
  HistoryIcon,
  ListCheckIcon,
  PlusIcon,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Card, CardFooter } from "~/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { useSidebar } from "~/components/ui/sidebar";
import { WizardContext } from "./Provider";
import useScreenType from "~/hooks/use-screen-type";
import { cn } from "~/lib/utils";
import { Button } from "@headlessui/react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import numberToWords from "./Utils/steptoWords";
import { use } from "chai";
import { SmartContext } from "~/components/ui/smart-component";
import { testIDFormatter } from "~/utils/formatter";

const SummaryMobile = () => {
  
  const { open } = useSidebar();
  const { state } = useContext(WizardContext);
  const size = useScreenType();
  const [selected, setSelected] = useState<null | "summary" | "smart">(null);
  const smart  = useContext(SmartContext);

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

  const entity = state?.entityName

  useEffect(() => {
     if(size === "xs" || size === "sm") {
      smart?.action("wizard-summary");
     }

    return () => {
      smart?.action("smart");
    };
  }, [size])
  

  const footerContent = useCallback(() => {

    const activeClass = "border-b-4 border-primary bg-muted p-4 text-primary";
    return (
      <>
        <Separator />
        <DrawerFooter>
          <div className="fixed bottom-0 z-20 left-0 flex w-full justify-between bg-muted text-default/60 lg:hidden">
            <Button
              data-test-id={testIDFormatter(`${entity}-wzrdsum-mobile-toggle-btn`)}
              onClick={() => {
                setSelected("summary");
              }}
              className={cn('flex w-1/2 justify-center gap-2  bg-muted p-4 lg:hidden', {[activeClass] : selected === "summary"})}
            >
              <ListCheckIcon className={cn('h-5 w-5', {'text-primary': selected === "summary"})} /> Summary 
            </Button>
            <Button
              data-test-id={testIDFormatter(`${entity}-wzrdsum-smart-mobile-toggle-btn`)}
              onClick={() => {
                setSelected("smart");
              }}
              className={cn('flex w-1/2 justify-center gap-2  bg-muted p-4 lg:hidden', {[activeClass] : selected === "smart"})}
            >
              <FolderSearchIcon className={cn('h-5 w-5', {'text-primary': selected === "smart"})} /> Smart
            </Button>
          </div>
        </DrawerFooter>
      </>
    );
  }, [selected]);

  const content = useCallback(() => {
    if (!selected) return null;

    if (selected === "summary") {
      return (
        <>
          <DrawerHeader className="flex items-center gap-4 p-3">
            <h1 className="text-md flex-grow text-start font-bold">Summary</h1>
            <Button
              onClick={() => {
                setSelected(null);
              }}
              data-test-id={testIDFormatter(`${entity}-wzrdsum-mobile-drawer-toggle-btn`)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200"
            >
              <ChevronDown className="h-6 w-6 text-primary" />
            </Button>
          </DrawerHeader>
          <Separator />
          <div className="p-2 px-4">
            <div className="max-h-[40dvh] overflow-y-auto">
              <Accordion
                // onValueChange={(value) => {
                // }}
                // defaultValue={["1", "2", "3", "4"]}
                type="multiple"
              >
                <div
                  className={cn(
                    "relative w-[-50px] after:bg-gray-200 after:hover:bg-gray-300 sm:block sm:p-3 lg:p-4",
                  )}
                >
                  <ol role="list" className="overflow-hidden">
                    {stepsArray?.map((step, stepIdx) => {
                      const stepIndex = stepIdx + 1;
                      const isStepped =
                        traverseSteps?.[numberToWords(stepIndex)] === "Stepped";
                      const isCurrent = state?.currentStep === stepIndex;
                      pathArray.pop();
                      pathArray.push(`${step}`);
                      const _completeLink = pathArray.join("/");
                      const completeLink = fullSearchQueryParams
                        ? `${_completeLink}?${fullSearchQueryParams}`
                        : _completeLink;

                      const summaryTitle =
                        // @ts-expect-error - SummaryComponent is not defined
                        state?.summary?.[numberToWords(stepIndex)]?.label;
                      // @ts-expect-error - SummaryComponent is not defined
                      const summaryComponent = state?.summary?.[
                        numberToWords(stepIndex)
                      ]?.component
                        ? // @ts-expect-error - SummaryComponent is not defined
                          state?.summary?.[numberToWords(stepIndex)]?.component
                        : null;

                      return (
                        <AccordionItem
                          key={stepIdx}
                          value={stepIndex.toString()}
                          data-test-id={testIDFormatter(`${entity}-wzrdsum-mobile-stepper-itm-${stepIndex}`)}
                        >
                          <li
                            className={cn(
                              stepIdx !== stepsArray.length ? "pb-10" : "",
                              "relative",
                            )}
                          >
                            {isStepped ? (
                              <div className={cn("flex", {})}>
                                {isCurrent ? (
                                  stepIdx !== stepsArray.length - 1 ? (
                                    <div
                                      aria-hidden="true"
                                      className={cn(
                                        "absolute left-3 top-4 -ml-px mt-0.5 h-full w-0.5 bg-indigo-600",
                                      )}
                                    />
                                  ) : (
                                    <div
                                      aria-hidden="true"
                                      className={cn(
                                        "absolute left-3 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300",
                                      )}
                                    />
                                  )
                                ) : (
                                  <div
                                    aria-hidden="true"
                                    className={cn(
                                      "absolute left-3 top-4 -ml-px mt-0.5 h-full w-0.5 bg-indigo-600",
                                    )}
                                  />
                                )}
                                <Link
                                  href={completeLink}
                                  className="group relative flex items-start"
                                  data-test-id={testIDFormatter(`${entity}-wzrdsum-mobile-stepper-itm-${stepIndex}-completed-link`)}
                                >
                                  <span className="flex h-9 items-center">
                                    {isCurrent ? (
                                      <span
                                        aria-hidden="true"
                                        className="flex h-9 items-center"
                                      >
                                        <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-4 border-primary bg-white text-xs">
                                          {stepIndex}
                                        </span>
                                      </span>
                                    ) : (
                                      <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                                        <CheckIcon
                                          aria-hidden="true"
                                          className="h-5 w-5 text-white"
                                        />
                                      </span>
                                    )}
                                  </span>
                                </Link>
                                <span
                                  className={cn("ml-3 flex min-w-0 flex-col")}
                                >
                                  {/* Hidden on mobile, visible from small screens (sm) and up */}
                                  <span
                                    className={cn("text-gray text-xs sm:block")}
                                  >
                                    {summaryTitle
                                      ? summaryTitle
                                      : "Description of Step " + stepIndex}
                                  </span>
                                  {/* This will be hidden on mobile screens */}
                                  <AccordionTrigger
                                    data-test-id={testIDFormatter(`${entity}-wzrdsum-mobile-stepper-itm-${stepIndex}-accordion-trigger`)}
                                  >
                                    <span className="text-left text-sm font-medium sm:block">
                                      {summaryTitle
                                        ? summaryTitle
                                        : "Description of Step " + stepIndex}
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="text-sm font-medium sm:block">
                                      {summaryComponent}
                                    </div>
                                  </AccordionContent>
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
                                <a
                                  href={completeLink}
                                  data-test-id={testIDFormatter(`${entity}-wzrdsum-mobile-stepper-itm-${stepIndex}-link`)}
                                  className="group relative flex items-start"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="flex h-9 items-center"
                                  >
                                    <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-4 border-gray-300 bg-white text-xs group-hover:border-gray-400">
                                      {stepIndex}
                                    </span>
                                  </span>
                                  <span
                                    className={cn("ml-3 flex min-w-0 flex-col")}
                                  >
                                    {/* Hidden on mobile, visible from small screens (sm) and up */}
                                    <span className="text-xs font-medium text-default/50 sm:block">
                                      {"Step  " + stepIndex}
                                    </span>
                                    {/* This will be hidden on mobile screens */}
                                    <span className="text-sm text-gray-500 sm:block">
                                      {summaryTitle
                                        ? summaryTitle
                                        : "Description of Step " + stepIndex}
                                    </span>
                                  </span>
                                </a>
                              </>
                            )}
                          </li>
                        </AccordionItem>
                      );
                    })}
                  </ol>
                </div>
              </Accordion>
            </div>
          </div>
          {footerContent()}
        </>
      );
    }
    return (
      <>
        <DrawerHeader className="flex items-center gap-4 p-3">
          <h1 className="text-md flex-grow text-start">Smart</h1>
          <PlusIcon className="h-6 w-6 text-primary" />
          <HistoryIcon className="h-5 w-5 text-muted-foreground" />
          <XMarkIcon className="h-6 w-6 text-muted-foreground" />
        </DrawerHeader>
        <Separator />
        <main className="max-h-[40dvh] space-y-2 overflow-auto p-4">
          <p className="mb-4 text-center text-sm text-muted-foreground/70">
            Thu,Oct 31
          </p>

          <div className="flex items-start gap-1">
            <Card className="rounded-xl p-2">
              {`Please give me the list of active contacts with the same numbers
                        as Marlyn Cooper's phone number that is used in this current draft
                        record`}
            </Card>
            <img
              alt=""
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              className="inline-block h-8 w-8 rounded-full"
            />
          </div>
          <p className="text-start text-xs font-normal text-muted-foreground/70">
            Tom Cook <time dateTime="8:30">8:30 AM</time>
          </p>

          <div className="flex items-start gap-2">
            <Image
              alt="Your Company"
              src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=200"
              className="rounded-full bg-muted p-1"
              width={35}
              height={35}
            />
            <Card className="rounded-xl bg-muted p-3">
              <p>
                {`Hi Tom! Absolutely. I have gathered all records saved under
                        Marlyn Cooper's phone number that is used in this current draft
                        record`}
              </p>
              <Card className="mb-2 border-l-2 border-l-primary p-2">
                <Badge
                  className="mr-2 rounded-sm border-0 p-2 font-normal"
                  variant={"primary"}
                >
                  ID100089
                </Badge>
                <Badge className="rounded-sm border-0 bg-yellow-100 p-2 font-normal text-yellow-600">
                  Draft
                </Badge>
                <h1 className="font-bold">Alexandra Jason Parker</h1>

                <div className="flex gap-2">
                  <h2 className="text-muted-foreground">Email</h2>
                  <h2>alex_54JP@example.com</h2>
                </div>
              </Card>
              <Card className="border-l-2 border-l-primary p-2">
                <Badge
                  className="mr-2 rounded-sm border-0 p-2 font-normal"
                  variant={"primary"}
                >
                  ID100089
                </Badge>
                <Badge className="rounded-sm border-0 bg-yellow-100 p-2 font-normal text-yellow-600">
                  Draft
                </Badge>
                <h1 className="font-bold">Alexandra Jason Parker</h1>

                <div className="flex gap-2">
                  <h2 className="text-muted-foreground">Email</h2>
                  <h2>alex_54JP@example.com</h2>
                </div>
              </Card>
            </Card>
          </div>
          <section className="flex items-center justify-start gap-2">
            <Badge
              variant={"secondary"}
              className="rounded-none p-2 text-sm font-normal"
            >
              Copy
            </Badge>
            <Badge
              variant={"secondary"}
              className="rounded-none p-2 text-sm font-normal"
            >
              Regenerate Response
            </Badge>
            <span className="text-xs text-muted-foreground">
              Smart Bot <time dateTime="8:30">8:30 AM</time>
            </span>
          </section>
        </main>
       {footerContent()}
      </>
    );
  }, [selected]);

  if (size !== "xs" && size !== "sm") {
    return null;
  }

  const widthClass = open
    ? "sm:w-[calc(100%-250px)]"
    : "sm:w-[calc(100%-50px)]";

  return (
    <Drawer
      open={selected !== null}
      onClose={() => {
        setSelected(null);
      }}
    >
      <div className="fixed bottom-0 flex w-full items-center justify-between gap-2 bg-muted lg:hidden">
        <Button
          className={cn(
            "flex w-1/2 items-center justify-center gap-2 p-4",
            widthClass,
          )}
          data-test-id={testIDFormatter(`${entity}-wzrdsum-mobile-ftr-toggle-btn`)}
          onClick={() => {
            setSelected("summary");
          }}
        >
          <ListCheckIcon className="h-5 w-5" /> Summary
        </Button>
        <div className="h-8 w-[1px] bg-slate-400" />
        <Button
          className={cn(
            "flex w-1/2 items-center justify-center gap-2 p-4",
            widthClass,
          )}
          data-test-id={testIDFormatter(`${entity}-wzrdsum-smart-mobile-ftr-toggle-btn`)}
          onClick={() => {
            setSelected("smart");
          }}
        >
          <FolderSearchIcon className="h-5 w-5" /> Smart
        </Button>
      </div>
      <DrawerContent className="h-[60dvh]">{content()}</DrawerContent>
    </Drawer>
  );
};

export default SummaryMobile;
