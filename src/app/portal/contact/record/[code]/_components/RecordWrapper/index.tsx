import RecordWrapperProvider from "~/components/platform/Record/providers/RecordWrapperProvider";
import HeaderTabs from "~/components/platform/Record/Tabs/HeaderTabs";
import MainContent from "~/components/platform/Record/MainContent";
import RecordSummaryMobile from "~/components/platform/Record/Summary/RecordSummaryMobile";
import { ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import type { IProps } from "./types";
import RecordProvider from "~/components/platform/Record/Provider";
import Options from "../../../_components/IdentifierOption";
import { handleChangeStatus } from "../../../_actions";

const Wrapper = (props: IProps) => {
  const { record, record_summary, entity_code, entity_name, is_applicant } =
    props;

  const tabs = [
    {
      id: "dashboard",
      name: "Dashboard",
      tabName: "dashboard?categories=",
    },
    {
      id: "contact",
      name: "Contact",
      tabName: "contact?categories=",
    },
    {
      id: "organization",
      name: "Organization",
      tabName: "organization?categories=",
    },
    {
      id: "account",
      name: "Account",
      tabName: "account?categories=",
    },
  ];

  return (
    <RecordProvider
      config={{
        entityCode: entity_code,
        entityName: entity_name!,
        identifierOption: is_applicant
          ? [
              {
                label: "Screening",
                onClick: handleChangeStatus.bind(null, "Screening"),
              },
              {
                label: "Assessment Test",
                onClick: handleChangeStatus.bind(null, "Assessment Test"),
              },
              {
                label: "Interview",
                onClick: handleChangeStatus.bind(null, "Interview"),
              },
              {
                label: "Pending",
                onClick: handleChangeStatus.bind(null, "Pending"),
              },
              {
                label: "Hired",
                onClick: handleChangeStatus.bind(null, "Hired"),
              },
              {
                label: "Failed",
                onClick: handleChangeStatus.bind(null, "Failed"),
              },
              {
                label: "On Hold",
                onClick: handleChangeStatus.bind(null, "On Hold"),
              },
              {
                label: "Job",
                onClick: handleChangeStatus.bind(null, "Job Offered"),
              },
            ]
          : undefined,
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
      {/* <Tabs>{tabs} </Tabs>
      <MainContent>{children}</MainContent> */}
      <RecordSummaryMobile>{record_summary}</RecordSummaryMobile>
    </RecordProvider>
  );
};

export default Wrapper;
