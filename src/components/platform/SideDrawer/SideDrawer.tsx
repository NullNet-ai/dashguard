import { type ReactNode } from 'react'
import { SideDrawerView } from './SideDrawerView';

// This component handles the layout adjustments when a side drawer is pinned
export function SideDrawer({ children }: { children: ReactNode }) {
  return (
    <section className='flex relative'>
      <div 
        className='flex-1'
      >
        {children}
      </div>
      <SideDrawerView />
    </section>
  );
}
