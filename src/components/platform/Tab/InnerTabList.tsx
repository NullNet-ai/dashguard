import { headers } from 'next/headers'

import { api } from '~/trpc/server'

import { toCapitalize } from '~/lib/capitalize'
import InnerTabItems from './InnerTabItems'
import { type IPropsTabList, type InnerTabsProps } from './type'
import { pluralize } from '~/server/utils/pluralize'

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
    })) as any[]
  const grid = stateTabs.find(item => item.name === 'Grid')
  const hasIdentifier = stateTabs?.find(item => item.name === identifier)

  let entity
  switch(mainEntity) {
    case 'user_role':
      entity = 'role'
      break
    case 'organization_account':
      entity = 'account'
      break
    default:
      entity = mainEntity
  }


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
      ...tab,
      name: tab.name,
      href,
      label: tab.name === 'Grid' ? `All ${toCapitalize(pluralize(entity || ''))}` : tab.name,
      current: href.match(path) ? true : false,
    }
  })

  if (application === 'grid' && !grid) {
    newTabs.unshift({
      name: 'Grid',
      href: pathname,
      current: true,
      label : `All ${toCapitalize(pluralize(entity || ''))}s`,

    })
  }

  if (application === 'wizard' && !hasIdentifier && identifier) {
    newTabs.splice(1, 0, {
      name: identifier,
      href: pathname,
      current: true,
      label : identifier,
    })
  }

  if (application === 'record' && !hasIdentifier && identifier) {
    newTabs.splice(1, 0, {
      name: identifier,
      href: `${pathname}?${fullSearchQueryParams}`,
      current: true,
      label : identifier,
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

  const withIDTabs = newTabs.map((tab) => {
      return {
        ...tab,
      id: tab.name,
      }
    }) 

  return <InnerTabItems pathname={pathname} tabs={withIDTabs} variant={variant}/>
}

export default InnerTabs

// const pathname = headerList.get('x-pathname') || ''

// const [, , entity, , ]
//   = pathname.split('/') || 'New Tab'

// const withIDTabs = newTabs.map((tab) => {
  
//   if(lowerCase(tab.name) === 'grid') {
//     return {
//      ...tab,
//      id: tab.name,
//      label: `All ${capitalize(pluralize(entity || ''))}`
//     }
//   }
//   return {
//     ...tab,
//    id: tab.name,
//   }
// }) 