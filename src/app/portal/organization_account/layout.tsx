import React, { Fragment } from 'react'

import InnerTabs from '~/components/platform/Tab/InnerTabList'

interface Props {
  children?: React.ReactNode
}

const Layout = (props: Props) => {
  return (
    <>
      <InnerTabs />
      {props.children}
    </>
  )
}

export default Layout
