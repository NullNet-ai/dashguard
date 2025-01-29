export interface ISideBarProps {
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  mainMenuConfig?: ISidebarMenu[];
  footerMenuConfig?: ISidebarMenu[];
  headerMenuConfig?: ISidebarMenu[];
  className?: string;
  screenType?: string;
}

export interface ISidebarMenu {
  groupTitle?: string;
  title?: string;
  icon?: string;
  isActive?: boolean;
  url?: string;
  items?: ISidebarMenu[];
  separator?: boolean;
  groups?: ISidebarMenu[];
}
