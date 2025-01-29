"use client";
import { ChevronLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "~/components/ui/drawer";
import Header from "./Header";
import WizardProvider from "./Provider";
import { type Summary, type TStepsNavigationButtons, type IState } from "./type";

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
     <section className="overflow-hidden wizard-section relative  lg:mt-[0px]">
        <div className="flex ">
          {/* Left side: Stepper */}
            <div className="hidden sm:block">
            <SummaryComponent />
            </div>

          <div className="flex-grow bg-transparent">
            <div className="border-b flex items-center md:h-[2.72rem]">
              <Header />
            </div>
            <div className="h-[calc(100vh-10rem)] overflow-auto">
              {children}
            </div>
          </div>
        </div>
      </section>
      <SummaryMobile />
    </WizardProvider>
  );
}
