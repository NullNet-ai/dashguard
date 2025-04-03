export interface IPropsTabList {
  name: string;
  href: string;
  current: boolean;
  [key: string]: any;
}

export interface InnerTabsProps  {
  variant?: 'dropdown' | 'drawer'
}
