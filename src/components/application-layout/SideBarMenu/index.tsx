import { cookies } from 'next/headers'
import Image from 'next/image'
import React from 'react'

import AppSideBar from '~/components/platform/SideBar'
import { api } from '~/trpc/server'

import Clock from './Clock'
import { MainMenuConfig } from './config'
import SideUserInfo from './UserInfo'

const getInitials = (name: string) => {
  const matches = name.match(/\b\w/g) || []
  return ((matches.shift() || '') + (matches.pop() || '')).toUpperCase()
}

export default async function SideBarMenu() {
  const mainConfig = await MainMenuConfig()

  const { contact } = await api.record.getSessionInfo()
  const { first_name, last_name, email } = contact
  const initials = getInitials(`${first_name} ${last_name}`)
  const user_name = `${first_name} ${last_name}`
  const cookieStore = cookies()
  const screenType = cookieStore.get('screen-type')

  return (
    <AppSideBar
      footerComponent={
        <SideUserInfo email={email} initials={initials} screenType={screenType?.value} user_name={user_name} />
      }
      headerComponent={(
        <div className="flex items-center justify-start py-1.5 text-sm lg:justify-center">
          <Image
            alt="Company Logo"
            className="h-8 w-auto"
            height={50}
            src="/tailwindLogo.svg"
            width={50}
          />
          <Clock />
        </div>
      )}
      mainMenuConfig={mainConfig}
      screenType={screenType?.value}
    />
  )
}
