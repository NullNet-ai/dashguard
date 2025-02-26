import MainContent from '~/components/platform/Record/MainContent'
import RecordProvider from '~/components/platform/Record/Provider'
import RecordWrapperProvider from '~/components/platform/Record/providers/RecordWrapperProvider'
import RecordSummaryMobile from '~/components/platform/Record/Summary/RecordSummaryMobile'
import HeaderTabs from '~/components/platform/Record/Tabs/HeaderTabs'
import RecordMenuOptionsProvider from '~/components/RecordMenuOptionProvider/RecordMenuOptionsProvider'
import { ResizablePanel, ResizablePanelGroup } from '~/components/ui/resizable'
import { api } from '~/trpc/server'

import type { IProps } from './types'

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
      id: 'organization_account',
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
    status: record_details?.account_status,
  })

  return (
    <RecordMenuOptionsProvider menu_options={statusOptions} entity_field='account_status' formKey='account_details'>
      <RecordProvider
        config={{
          entityCode: entity_code,
          entityName: entity_name!,
        }}
      >
        <section className='mt-[3rem] min-h-[calc(100vh-110px)] md:mt-[1rem] lg:mt-[0rem]'>
          <ResizablePanelGroup className='flex' direction='horizontal'>
            <div className='hidden h-full min-h-[calc(100vh-105px)] w-full border-r border-slate-100 md:block md:w-[240px] lg:w-[300px]'>
              <RecordWrapperProvider>{record_summary}</RecordWrapperProvider>
            </div>
            <ResizablePanel
              className='min-h-60 flex-grow-[6] bg-transparent'
              defaultSize={95}
              minSize={25}
            >
              <HeaderTabs tabs={tabs} />
              <MainContent className='p-4'>{record}</MainContent>
            </ResizablePanel>
          </ResizablePanelGroup>
        </section>
        <RecordSummaryMobile>{record_summary}</RecordSummaryMobile>
      </RecordProvider>
    </RecordMenuOptionsProvider>

  )
}

export default Wrapper
