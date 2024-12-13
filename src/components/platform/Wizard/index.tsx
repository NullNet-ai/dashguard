"use client";
import { ChevronLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { Button } from "~/components/ui/button";
import { Button as Button2 } from "@headlessui/react";
import { Card } from "~/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "~/components/ui/drawer";
import Header from "./Header";
import WizardProvider from "./Provider";
import { Summary, TStepsNavigationButtons, type IState } from "./type";

import WizardNavigator from "./BreadCrumbs";
import SummaryComponent from "./Summary";
import SummaryMobile from "./SummaryMobile";

const FORM_HEADER_HEIGHT = "3.5rem";

interface Wizard {
  children: React.ReactNode;
  config: Omit<IState, "nextLoading" | "prevLoading" | "saveContinueLoading">;
  summary?: Summary;
  stepsNavigation?: TStepsNavigationButtons;
}


export default function Wizard(props: Wizard) {

  const { children, summary, config, stepsNavigation = {} } = props || {};
  return (
    <WizardProvider
      summary={summary}
      config={config}
      stepsNavigation={stepsNavigation}
    >
     <section className="overflow-hidden wizard-section relative sm:mt-[2.2rem] lg:mt-0">
     <Card className="flex flex-wrap items-center justify-between px-2 sm:hidden mt-[2.9rem] py-2">
          <Button variant={"ghost"} className="flex justify-between p-0">
            <ChevronLeftIcon className="mr-auto h-5 w-5" />
            ID100089 - User Details
            {/* {props.config.entityCode} - {props.config.entityName} */}
          </Button>
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                className="ms-auto bg-blue-100 p-2 text-primary"
                size={"sm"}
              >
                Go Smart
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="min-h-[90vh]">
                <div className="flex w-full justify-between border-b px-4">
                  <h1 className="text-lg font-semibold text-foreground">
                    Go Smart
                  </h1>
                  <DrawerClose asChild>
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      className="h-6 w-6 rounded-full bg-gray-100"
                    >
                      <XMarkIcon className="m-auto h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </Card>

        <div className="lg:hidden block  p-4 border-b ">
            <WizardNavigator />
        </div>
        <div className="flex  lg:0">
          {/* Left side: Stepper */}
            <div className="hidden sm:block">
            <SummaryComponent />
            </div>

          <div className="flex-grow bg-transparent">
            <div className="border-b flex items-center" style={{ height: FORM_HEADER_HEIGHT }}>
              <Header />
            </div>
            <div className="h-[calc(100vh-10rem)] overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </section>
      <SummaryMobile />
    </WizardProvider>
  );
}

