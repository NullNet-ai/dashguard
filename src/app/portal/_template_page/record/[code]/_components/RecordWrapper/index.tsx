import RecordWrapperProvider from "~/components/platform/Record/providers/RecordWrapperProvider";
import HeaderTabs from "~/components/platform/Record/Tabs/HeaderTabs";
import MainContent from "~/components/platform/Record/MainContent";
import RecordSummaryMobile from "~/components/platform/Record/Summary/RecordSummaryMobile";
import { ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import type { IProps } from "./types";
import RecordProvider from "~/components/platform/Record/Provider";
import { handleChangeStatus } from "../../../_actions";
import { upperFirst } from "lodash";

const Wrapper = (props: IProps) => {
  const { record, record_summary, entity_code, entity_name } = props;

  const tabs = [
    {
      id: "dashboard",
      name: "Dashboard",
      tabName: "dashboard?categories=",
    },
    {
      id: entity_name,
      name: upperFirst(entity_name),
      tabName: "contact?categories=",
    },
  ];

  return (
    <RecordProvider
      config={{
        entityCode: entity_code,
        entityName: entity_name!,
        identifierOption: [
          {
            label: "Identifier Option One",
            onClick: handleChangeStatus.bind(null, "Passed"),
          },
          {
            label: "Identifier Option Two",
            onClick: handleChangeStatus.bind(null, "Test"),
          },
        ],
      }}
    >
      <section className="mt-8 min-h-[calc(100vh-110px)] md:mt-[2.5rem] lg:mt-[0.5rem]">
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
