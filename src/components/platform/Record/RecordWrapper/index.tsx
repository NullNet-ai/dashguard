import RecordWrapperProvider from "~/components/platform/Record/providers/RecordWrapperProvider";
import HeaderTabs from "~/components/platform/Record/Tabs/HeaderTabs";
import MainContent from "~/components/platform/Record/MainContent";
import RecordSummaryMobile from "~/components/platform/Record/Summary/RecordSummaryMobile";
import { ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import type { IProps } from "./types";
import RecordProvider from "~/components/platform/Record/Provider";
import RecordContainer from './_component/RecordContainer';

const Wrapper = (props: IProps) => {
  const { record, record_summary, customProps, tabs } = props;

  const { config } = customProps || {};

  return (
    <RecordProvider config={config!}>
      <RecordWrapperProvider>
        <section className="mt-0 h-[calc(100vh-85px)] lg:mt-[0rem]">
          <ResizablePanelGroup direction="horizontal" className="flex gap-2 p-2">
            <RecordContainer>{record_summary}</RecordContainer>
            <ResizablePanel
              defaultSize={95}
              minSize={25}
              className="flex flex-col gap-2 min-h-60 flex-grow-[6] bg-transparent"
            >
              <HeaderTabs tabs={tabs} />
              <MainContent>{record}</MainContent>
            </ResizablePanel>
          </ResizablePanelGroup>
        </section>
        {/* <Tabs>{tabs} </Tabs>
        <MainContent>{children}</MainContent> */}
        <RecordSummaryMobile>{record_summary}</RecordSummaryMobile>
      </RecordWrapperProvider>
    </RecordProvider>
  );
};

export default Wrapper;
