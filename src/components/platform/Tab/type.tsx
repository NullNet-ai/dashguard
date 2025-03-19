export interface IPropsTabList {
  name: string;
  href: string;
  current: boolean;
}

export interface InnerTabsProps  {
  variant?: 'dropdown' | 'drawer'
}
