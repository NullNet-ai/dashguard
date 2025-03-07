import type React from 'react'
import { type ReactNode } from 'react'
export interface ISideDrawerContextProps {
  state: {
    isOpen: boolean
    config: ISideDrawerConfig | null
    isPinned: boolean // Add isPinned to state
  }
  actions: IActions
}

// Add to your types file where IActions is defined
export interface IActions {
  openSideDrawer: (config: ISideDrawerConfig | string) => void;
  closeSideDrawer: () => void;
  togglePinSideDrawer: () => void;
  saveCurrentState: (config: ISideDrawerConfig) => void; // Add this line
}

export interface ISideDrawerConfig {
  header: ReactNode
  sideDrawerWidth?: string
  body: {
    component: React.ComponentType<any> | Promise<() => Element>;
    componentProps?: Record<string, any>
  }
  onCloseSideDrawer?: () => void
  onPinStateChange?: (isPinned: boolean) => void
  overlayEnabled?: boolean
  closeOnOutsideClick?: boolean
  resizable?: boolean
  showResizeHandle?: boolean
  minResizeWidth?: string
  maxResizeWidth?: string
  isPinnable?: boolean
  drawerType?: string // Add this property
}
