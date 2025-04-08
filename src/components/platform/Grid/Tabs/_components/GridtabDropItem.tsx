
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, formatGridTabName } from '~/lib/utils';
import GridMenuDropClient from './GridMenuDropClient';

type InnerTabitemProps = {
  tab: any
  pathname?: string
  dropItems: any
  isActive: boolean
  onSelect?: () => void
  shownItems: any[]
  onClickItem?: (tab?: any) => void
};

const GridtabDropItem = ({
  tab,
  pathname,
  onSelect,
  shownItems,
  onClickItem
}: InnerTabitemProps) => {
  const newPathname = usePathname()
  const [, , entityName] = (pathname || '').split('/');
  const [, , , , code] = (newPathname || '').split('/')




  const tabNameRole = tab.name === 'user_role' ? 'role' : tab.name.split(' ').join('-').toLowerCase();
  return (
    <>
      <Link
        data-test-id={
          'apptab-' + tabNameRole
        }
        onClick={(e) => {
          e?.preventDefault()
          e?.stopPropagation
          // handleClickLink(tab?.id)
          onClickItem?.(tab)
          onSelect?.()
        }}
        href={tab.href + (tab.href.includes('?') ? '&' : '?') + 'dropdown=true'}
        aria-current={tab?.current ? 'page' : undefined}
        className={cn(
          tab?.current ? 'text-primary' : 'text-default/70', 'whitespace-nowrap px-1 pr-1 text-sm font-medium', 'flex items-center space-x-2 flex-1', 'hover:border-t-primary hover:text-primary',
        )}
      >
        {formatGridTabName(tabNameRole)}
      </Link>
      <div className="absolute right-0 h-[50%] hidden w-[1px] bg-gray-300 dark:bg-gray-600" />
      <GridMenuDropClient 
          tab={tab} 
          filter_id={tab?.id} 
          current={!!tab.href.match(pathname)}
          tabs={shownItems}
          entity={entityName || ''}
          />
    </>
  );
};

export default GridtabDropItem;
