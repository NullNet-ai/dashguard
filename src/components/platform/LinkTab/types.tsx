export interface TabItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean; // Add disabled property
}

export interface LinkTabContextType {
  tabs: TabItem[];
  variant?: "default" | "pills" | "underline";
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export interface LinkTabProps extends LinkTabContextType {
  className?: string;
  persistKey?: string;
  defaultHref?: string;
}
