export interface TabItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface LinkTabContextType {
  tabs: TabItem[];
  variant?: "default" | "pills" | "underline";
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "vertical";
}

export interface LinkTabProps extends LinkTabContextType {
  className?: string;
  persistKey?: string;
  defaultHref?: string;
}
