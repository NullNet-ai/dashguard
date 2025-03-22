import { headers } from 'next/headers'

import { api } from '~/trpc/server'

import InnerTabItems from './InnerTabItems'
import { type IPropsTabList, type InnerTabsProps } from './type'

const getSessionTabs = async () => {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const fullSearchQueryParams = headerList.get('x-full-search-query-params') || ''
  const [, portal, mainEntity, application, identifier]
    = pathname.split('/') || 'New Tab'
  const currentContext = '/' + portal + '/' + mainEntity
  const stateTabs = (await api.tab
    .getSubTabs({
      current_context: currentContext,
    })
    .then((res) => {
      return res?.tabs ?? []
    })
    .catch(() => {
      return []
    })) as IPropsTabList[]

  const grid = stateTabs.find(item => item.name === 'Grid')
  const hasIdentifier = stateTabs?.find(item => item.name === identifier)
  const newTabs = stateTabs.map((tab) => {
    let path
    let href
    const main = `/${portal}/${mainEntity}/${application}/${identifier}`
    const [, , , _application, _current] = tab.href.split('/')

    if (tab?.name === 'Grid') {
      path = pathname
      href = tab.href.replace(/\/\d+$/, '')
    }
    else if (
      _application === 'record'
      && !_current?.includes('current_tab')
    ) {
      path = `${main}/${fullSearchQueryParams}`;
      href = `${tab.href}/${fullSearchQueryParams}`;
    }
    else {
      path = `${main}`
      href = tab.href
    }

    return {
      name: tab.name,
      href,
      current: href.match(path) ? true : false,
    }
  })

  if (application === 'grid' && !grid) {
    newTabs.unshift({
      name: 'Grid',
      href: pathname,
      current: true,
    })
  }

  if (application === 'wizard' && !hasIdentifier && identifier) {
    newTabs.splice(1, 0, {
      name: identifier,
      href: pathname,
      current: true,
    })
  }

  if (application === 'record' && !hasIdentifier && identifier) {
    newTabs.splice(1, 0, {
      name: identifier,
      href: `${pathname}?${fullSearchQueryParams}`,
      current: true,
    })
  }

  await api.tab.insertSubTabs({
    current_context: currentContext,
    tabs: newTabs,
  })

  await api.grid.defaultGridTab({
    application: application || '',
    entity: mainEntity || '',
  })

  await api.grid.getCustomGridTabs({
    application: application || '',
    entity: mainEntity || '',
  })
  return newTabs.filter(Boolean)
}

const InnerTabs = async ({
  variant = 'dropdown'
} : InnerTabsProps ) => {
  const newTabs = await getSessionTabs()
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  return <InnerTabItems pathname={pathname} tabs={newTabs} variant={variant}/>
}

export default InnerTabs
