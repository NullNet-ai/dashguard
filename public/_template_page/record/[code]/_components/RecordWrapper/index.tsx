import RecordWrapperProvider from "~/components/platform/Record/providers/RecordWrapperProvider";
import HeaderTabs from "~/components/platform/Record/Tabs/HeaderTabs";
import MainContent from "~/components/platform/Record/MainContent";
import RecordSummaryMobile from "~/components/platform/Record/Summary/RecordSummaryMobile";
import { ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import type { IProps } from "./types";
import RecordProvider from "~/components/platform/Record/Provider";
import statusOptions from "../../../_actions/statusOptions";
import tabs from "../../../_config/tabs";

const Wrapper = ({
  record,
  record_summary,
  entity_code,
  entity_name,
}: IProps) => {
  return (
    <RecordProvider
      config={{
        entityCode: entity_code,
        entityName: entity_name!,
        identifierOption: statusOptions,
      }}
    >
      <section className="mt-[3rem] min-h-[calc(100vh-110px)] md:mt-[1rem] lg:mt-[0rem]">
        <ResizablePanelGroup direction="horizontal" className="flex">
          <div className="hidden h-full min-h-[calc(100vh-105px)] w-full border-r border-slate-100 md:block md:w-[240px] lg:w-[300px]">
            <RecordWrapperProvider>{record_summary}</RecordWrapperProvider>
          </div>
          <ResizablePanel
            defaultSize={95}
            minSize={25}
            className="min-h-60 flex-grow-[6] bg-transparent"
          >
            <HeaderTabs tabs={tabs} />
            <MainContent className="p-4">{record}</MainContent>
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
      <RecordSummaryMobile>{record_summary}</RecordSummaryMobile>
    </RecordProvider>
  );
};

export default Wrapper;