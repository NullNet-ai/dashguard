import { type ISidebarMenu } from '~/components/platform/SideBar/type'
import { getGridLink } from '~/lib/grid-get-link'

const menu = {
  title: 'Accounts',
  url: getGridLink({
    mainEntity: 'organization_account',
  }),
  icon: 'UserGroupIcon',
} as ISidebarMenu

export default menu
