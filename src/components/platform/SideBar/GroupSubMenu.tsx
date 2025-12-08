'use client';

import { type ISidebarMenu } from './type';
import {
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '~/components/ui/sidebar';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

import * as _ICON from '@heroicons/react/24/outline';
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/outline';
import { testIDFormatter } from '~/utils/formatter';
import useScreenType from '~/hooks/use-screen-type';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { cn } from '~/lib/utils';
import { truncate } from 'lodash';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

interface IProps {
  subItem: ISidebarMenu;
  item: ISidebarMenu;
  index: number;
}

function GroupSubMenu(props: IProps) {
  const { subItem, index, item } = props ?? {};

  const { open, openMobile } = useSidebar();
  const sType = useScreenType();
  const router = useRouter();
  const pathname = usePathname();
  const [, , entity, application] = pathname?.split('/');

  const refs = useRef<any[]>([]);
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});

  const SUB_ICON =
    // @ts-expect-error - TS doesn't know about dynamic imports
    _ICON?.[subItem?.icon] ?? ChevronUpDownIcon;

  const formattedTitle = (subItem.title ?? '')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  // Determine if this submenu item is favorited
  const isFavorite = favorites[subItem.title ?? ''] || false;

  // Toggle favorite for a specific submenu item
  const toggleFavorite = (e: React.MouseEvent, itemTitle: string) => {
    e.preventDefault(); // Prevent navigation when clicking the star
    setFavorites((prev) => ({
      ...prev,
      [itemTitle]: !prev[itemTitle],
    }));
  };

  const isActive = useMemo(() => {
    const [, , entityName] = (subItem?.url || '')?.split('/');
    return entityName === entity;
  }, [entity, application]);

  const getMenuLink = async (item: any) => {
    // Extract entity from item.url
    const pathParts = item.url?.split('/');
    const entityName = pathParts?.length >= 3 ? pathParts[2] : null;

    // Check if entityName exists
    if (entityName) {
      // get from local storage
      const entity_last_paths = localStorage.getItem(
        `last_visited_url:${entityName}`,
      );

      // If we have a last path for this entity, return it
      if (entity_last_paths) {
        return entity_last_paths;
      }
    }

    // Otherwise, return the original item.url
    return item.url || '#';
  };

  return (
    <SidebarMenuSubItem
      key={subItem?.title}
      ref={(el: any) => (refs.current[index] = el!)}
      className='mb-2'
    >
      {(() => {
        const maxLength = 20;
        const shouldShowTooltip = subItem?.title && subItem.title.length > maxLength;
        const displayText = shouldShowTooltip ? truncate(subItem.title, { length: maxLength }) : subItem.title;

        const subMenuButton = (
          <SidebarMenuSubButton
            open={open}
            asChild
            className={`py-1 ${isActive && 'bg-muted text-primary'}`}
          >
            <Link
              className={cn('ml-8 group/item flex items-center gap-2 text-slate-700', {
                'bg-slate-50 text-primary lg:hover:text-primary': isActive,
                'ml-0': !open
              })}
              href={'#'}
              data-test-id={testIDFormatter(
                `sdnavmenu-sub-menu-itm-${item.title ?? 'default'}-${formattedTitle}-link`,
              )}
              onClick={async (e) => {
                e.preventDefault();
                const redirectedUrl = await getMenuLink(subItem || '');
                router.push(redirectedUrl);
              }}
            >
              {subItem?.icon && (
                <SUB_ICON
                  className={cn('mr-1 !size-6 text-slate-400',
                    {
                      'text-primary': isActive,
                    }
                  )}
                />
              )}
              {((open && (sType === 'sm' || sType === 'md' || sType === 'xs')) ||
                openMobile ||
                (open && !openMobile)) && (
                <span className="grow text-nowrap font-medium text-md leading-6">
                  {displayText}
                </span>
              )}
            </Link>
          </SidebarMenuSubButton>
        )

        return shouldShowTooltip ? (
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                {subMenuButton}
              </TooltipTrigger>
              <TooltipContent side="top">
                {subItem.title}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : subMenuButton;
      })()}
    </SidebarMenuSubItem>
  );
}

export default GroupSubMenu;



// favorite star button
// <>
//   {open ? (
//     <>
//       {isFavorite ? (
//         <SolidStarIcon
//           onClick={(e) => toggleFavorite(e, subItem?.title ?? '')}
//           data-test-id={testIDFormatter(
//             `sdnavmenu-sub-menu-itm-${item.title ?? 'default'}-${formattedTitle}-fav-btn`,
//           )}
//           className="cursor-pointer !text-yellow-400 opacity-0 transition-opacity duration-300 ease-in-out group-hover/item:opacity-100"
//         />
//       ) : (
//         <StarIcon
//           onClick={(e) => toggleFavorite(e, subItem?.title ?? '')}
//           className="cursor-pointer !text-yellow-400 opacity-0 transition-opacity duration-300 ease-in-out group-hover/item:opacity-100"
//         />
//       )}
//     </>
//   ) : null}
// </>