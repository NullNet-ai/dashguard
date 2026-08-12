import MainContent from '~/components/platform/Record/MainContent'
import RecordProvider from '~/components/platform/Record/Provider'
import RecordWrapperProvider from '~/components/platform/Record/providers/RecordWrapperProvider'
import RecordSummaryMobile from '~/components/platform/Record/Summary/RecordSummaryMobile'
import HeaderTabs from '~/components/platform/Record/Tabs/HeaderTabs'
import RecordMenuOptionsProvider from '~/components/RecordMenuOptionProvider/RecordMenuOptionsProvider'
import { ResizablePanel, ResizablePanelGroup } from '~/components/ui/resizable'
import { api } from '~/trpc/server'

import type { IProps } from './types'
import RecordContainer from './_component/RecordContainer'

const Wrapper = async ({
  record,
  record_summary,
  entity_code,
  entity_name,
  record_details,
}: IProps) => {
  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      tabName: 'dashboard?categories=',
    },
    {
      id: 'account_organization',
      name: 'Account',
      tabName: 'account?categories=',
    },
    ...(record_details?.categories?.includes('Internal User')
      ? [
          {
            id: 'contact',
            name: 'Contact',
            tabName: 'contact?categories=',
          },
        ]
      : []),
    {
      id: 'communication',
      name: 'Communication',
      tabName: 'communication?categories=',
    },
  ]

  const statusOptions = await api.record.getOptionsByCurrentState({
    code: entity_code,
    categories: record_details?.categories,
    status: record_details?.account_organization_status,
    email: record_details?.email,
  })

  return (
    <RecordMenuOptionsProvider menu_options={statusOptions} entity_field='account_organization_status' formKey='account_details'>
      <RecordProvider
        config={{
          entityCode: entity_code,
          entityName: entity_name!,
        }}
      >
        <section className='mt-0 h-[calc(100vh-85px)]'>
          <ResizablePanelGroup direction="horizontal" className="flex gap-2 p-2">
           <RecordWrapperProvider>
                <RecordContainer>
                  {record_summary}
                </RecordContainer>
              </RecordWrapperProvider>
            <ResizablePanel
              className='flex flex-col gap-2 min-h-60 flex-grow-[6] bg-transparent'
              defaultSize={95}
              minSize={25}
            >
              <HeaderTabs tabs={tabs} />
              <MainContent>{record}</MainContent>
            </ResizablePanel>
          </ResizablePanelGroup>
        </section>
        <RecordSummaryMobile>{record_summary}</RecordSummaryMobile>
      </RecordProvider>
    </RecordMenuOptionsProvider>

  )
}

export default Wrapper
