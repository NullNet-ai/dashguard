"use client";

import Header from "./Header";
import WizardProvider from "./Provider";
import { type IState, type Summary, type TStepsNavigationButtons } from "./type";
import SummaryComponent from "./Summary";
import SummaryMobile from "./SummaryMobile";


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
     <section className="overflow-hidden wizard-section relative p-2 lg:mt-[0px]">
        <div className="flex gap-2">
          {/* Left side: Stepper */}
          <div className="hidden sm:block">
            <SummaryComponent />
          </div>

          <div className="flex flex-col gap-2 flex-grow bg-transparent">
            <div className="flex items-center md:h-[2.72rem]">
              <Header />
            </div>
            <div className="rounded-t-[2px] rounded-b-[8px] md:h-[calc(100vh-10rem)] h-[calc(100vh-14rem)] overflow-auto">
              {children}
            </div>
          </div>
        </div>
      </section>
      <SummaryMobile />
    </WizardProvider>
  );
}
