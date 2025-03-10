import type React from 'react'
export interface ISideDrawerContextProps {
  state: {
    isOpen: boolean
    config: ISideDrawerConfig | null
  }
  actions: IActions
}

export interface IActions {
  openSideDrawer: (config: ISideDrawerConfig) => void
  closeSideDrawer: () => void
}

export interface ISideDrawerConfig {
  title: string
  header: React.ReactNode
  sideDrawerWidth?: string
  body: {
    component: React.ComponentType<any>
    componentProps?: Record<string, any>
  }
  onCloseSideDrawer?: () => void
  overlayEnabled?: boolean
  closeOnOutsideClick?: boolean
}
