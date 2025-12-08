import MainContent from '~/components/platform/Record/MainContent'
import RecordProvider from '~/components/platform/Record/Provider'
import RecordWrapperProvider from '~/components/platform/Record/providers/RecordWrapperProvider'
import RecordSummaryMobile from '~/components/platform/Record/Summary/RecordSummaryMobile'
import HeaderTabs from '~/components/platform/Record/Tabs/HeaderTabs'
import { ResizablePanel, ResizablePanelGroup } from '~/components/ui/resizable'

import statusOptions from '../../../_actions/statusOptions'
import tabs from '../../../_config/tabs'

import type { IProps } from './types'
import RecordContainer from './_component/RecordContainer'

const Wrapper = ({
  record,
  record_summary,
  entity_code,
  entity_name,
  is_applicant,
  enableTimeline,
  metadata,
}: IProps) => {
  return (
    <RecordProvider
      config={{
        entityCode: entity_code,
        entityName: entity_name!,
        identifierOption: is_applicant ? statusOptions : undefined,
        // showRecordSummary:false,
        // showToolbar: false,
        enableTimeline,
        metadata,
      }}
    >
      <RecordWrapperProvider>
        <section className="up mt-0 h-[calc(100vh-85px)] lg:mt-[0rem]">
          <ResizablePanelGroup direction="horizontal" className="flex gap-2 p-2">
            <RecordContainer>
              {record_summary}
            </RecordContainer>
            <ResizablePanel
              defaultSize={95}
              minSize={25}
              className="flex flex-col gap-2 min-h-60 flex-grow-[6] bg-transparent"
            >
              <HeaderTabs tabs={tabs} />
              <MainContent application="record">
                {record}
              </MainContent>
            </ResizablePanel>
          </ResizablePanelGroup>
        </section>
        <RecordSummaryMobile>{record_summary}</RecordSummaryMobile>
      </RecordWrapperProvider>
    </RecordProvider>
  )
};

export default Wrapper
