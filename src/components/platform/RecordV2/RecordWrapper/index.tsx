import RecordWrapperProvider from "~/components/platform/RecordV2/providers/RecordWrapperProvider"
import HeaderTabs from "~/components/platform/RecordV2/Tabs/HeaderTabs"
import MainContent from "~/components/platform/RecordV2/MainContent"
import RecordSummaryMobile from "~/components/platform/RecordV2/Summary/RecordSummaryMobile"
import { ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable"
import type { IProps } from "./types"
import RecordProvider from "~/components/platform/RecordV2/Provider"

const Wrapper = (props: IProps) => {
    
  const { record, record_summary, customProps, tabs } = props

  const {
    config
  } = customProps || {};

    return (
        <RecordProvider
        config={config!}
        >
        <section className="min-h-[calc(100vh-110px)] md:mt-[2.5rem] lg:mt-[0.5rem] mt-8">
        <ResizablePanelGroup direction="horizontal" className="flex">
          <div className="h-full hidden md:block w-full md:w-[240px] lg:w-[300px] border-r border-slate-100 min-h-[calc(100vh-105px)]">
              <RecordWrapperProvider>
                {record_summary}
              </RecordWrapperProvider>
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
      <RecordSummaryMobile>
        {record_summary}
      </RecordSummaryMobile>
      </RecordProvider>
    )
}

export default Wrapper