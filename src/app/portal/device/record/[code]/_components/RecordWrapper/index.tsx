import RecordWrapperProvider from "~/components/platform/Record/providers/RecordWrapperProvider";
import HeaderTabs from "~/components/platform/Record/Tabs/HeaderTabs";
import MainContent from "~/components/platform/Record/MainContent";
import RecordSummaryMobile from "~/components/platform/Record/Summary/RecordSummaryMobile";
import { ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import type { IProps } from "./types";
import RecordProvider from "~/components/platform/Record/Provider";
import statusOptions from "../../../_actions/statusOptions";
import tabs from "../../../_config/tabs";
import RecordContainer from './_component/RecordContainer';

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
        identifierOption: [],
      }}
    >
      <RecordWrapperProvider>
        <section className='mt-0 h-[calc(100vh-85px)]'>
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
        <RecordSummaryMobile>{record_summary}</RecordSummaryMobile>
      </RecordWrapperProvider>
    </RecordProvider>
  );
};

export default Wrapper;
