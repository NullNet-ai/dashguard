import { type ReactElement } from "react";
import RecordSummary from "./Summary/RecordSummary";
import RecordProvider from "./Provider";
import { ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import HeaderTabs from "./Tabs/HeaderTabs";
import React from "react";
import { RecordSummaryViewContent } from "./Summary/SummaryViewContent";
import { type RecordProps } from "./types";
import MainContent from "./MainContent";
import RecordWrapperProvider from "./providers/RecordWrapperProvider";
import RecordSummaryMobile from "./Summary/RecordSummaryMobile";
import RecordSummaryContent from "./Summary/SummaryContent";

const Record = ({
  config: { tabs, entityCode, entityName, categories, identifierOption },
  children,
}: RecordProps) => {
  const summaryChildren = React.Children.toArray(children).filter(
    (child) => (child as ReactElement).type === RecordSummaryViewContent,
  );
  const mainContentChildren = React.Children.toArray(children).filter(
    (child) => (child as ReactElement).type !== RecordSummaryViewContent,
  );
  return (
    <RecordProvider
      config={{
        entityCode: entityCode,
        entityName: entityName,
        identifierOption: identifierOption,
        categories: categories,
      }}
    >
      <section className="min-h-[calc(100vh-110px)] md:mt-[2.5rem] lg:mt-[0.5rem] mt-8">
        <ResizablePanelGroup direction="horizontal" className="flex">
          <div className="h-full hidden md:block w-full md:w-[240px] lg:w-[300px] border-r border-slate-100 min-h-[calc(100vh-105px)]">
              <RecordWrapperProvider>
                <RecordSummary />
                {summaryChildren}
              </RecordWrapperProvider>
          </div>
          <ResizablePanel
            defaultSize={95}
            minSize={25}
            className="min-h-60 flex-grow-[6] bg-transparent"
          >
            <HeaderTabs tabs={tabs ?? []} />
            <MainContent className="p-4">{mainContentChildren}</MainContent>
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
      {/* <Tabs>{tabs} </Tabs>
      <MainContent>{children}</MainContent> */}
      <RecordSummaryMobile>
        <RecordSummaryContent />
      </RecordSummaryMobile>
    </RecordProvider>
  );
};

export default Record;
