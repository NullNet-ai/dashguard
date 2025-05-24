/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';
import * as _ICON from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { Fragment, useMemo, useState } from 'react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '~/components/ui/sidebar';
import useScreenType from '~/hooks/use-screen-type';
import { testIDFormatter } from '~/utils/formatter';

import { type ISidebarMenu } from './type';
import { getPathLink } from './actions';
interface IProps {
  item: ISidebarMenu;
  screenType?: string;
}

export default function Menu({ item, screenType }: IProps) {
  const pathname = usePathname();
  // eslint-disable-next-line no-unsafe-optional-chaining
  const router = useRouter();
  const [, , entity, application] = pathname?.split('/');
  const [isFavorite, setIsFavorite] = useState(false);
  const { open, setOpenMobile } = useSidebar();
  const stype = useScreenType();
  const isMobile =
    screenType !== 'lg' && screenType !== 'xl' && screenType !== '2xl';

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
  };

  const { ChevronRightIcon, ChevronUpDownIcon } = _ICON;

  // eslint-disable-next-line import/namespace
  const ICON =
    item?.icon && item.icon in _ICON
      ? // eslint-disable-next-line import/namespace
        _ICON[item.icon as keyof typeof _ICON]
      : ChevronUpDownIcon;

  const isActive = useMemo(() => {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const [, , entityName] = (item?.url || '')?.split('/');
    return entityName === entity;
  }, [entity, application]);

  const getMenuLink = async(item: any) => {
    // Extract entity from item.url
    const pathParts = item.url?.split('/');
    const entityName = pathParts?.length >= 3 ? pathParts[2] : null;
  
    // Check if entityName exists
    if (entityName) {
      // Call the query to get the last visited path for this entity
      const entity_last_paths = localStorage.getItem('entity-last-paths');
      const entity_last_paths_obj = entity_last_paths? JSON.parse(entity_last_paths) : {};
      const lastPath = entity_last_paths_obj[entityName];
      
      // If we have a last path for this entity, return it
      if (lastPath) {
        return lastPath;
      }
    }
  
    // Otherwise, return the original item.url
    return item.url || '#';
  };
  return (
    <SidebarMenu className="px-2">
      <Collapsible
        key={item.title}
        asChild={true}
        defaultOpen={item.isActive}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          {item?.items?.length ? (
            <>
              <CollapsibleTrigger asChild={true}>
                <SidebarMenuButton tooltip={!isMobile ? item.title : undefined}>
                  <ICON className="mr-2 h-5 w-5" />
                  <span>{item.title}</span>
                  <Link
                    href={'#'}
                    className="flex items-center gap-2"
                    data-test-id={testIDFormatter(`sidebar-menu-${item.title}`)}
                    onClick={async(e) => {
                      e.preventDefault();
                      const redirectedUrl = await getMenuLink(item || '');
                      router.push(redirectedUrl);
                      setOpenMobile(false);
                    }}
                  >
                    <span className="font-semibold">{item.title}</span>
                  </Link>
                  {!!item?.items?.length && (
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {!!item?.items?.length && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild={true}
                          data-test-id={testIDFormatter(
                            `sidebar-menu-${item.title ?? 'default'}-${subItem.title}`,
                          )}
                        >
                          <Link
                            href={'#'}
                            data-test-id={testIDFormatter(
                              `sidebar-menu-${item.title ?? 'default'}-${subItem.title}-link`,
                            )}
                            onClick={async(e) => {
                              e.preventDefault();
                              const redirectedUrl = await getMenuLink(item || '');
                              router.push(redirectedUrl);
                              setOpenMobile(false);
                            }}
                          >
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </>
          ) : (
            <Link
              // href={getMenuLink(item || '')}
              href={'#'}
              className={`group/item flex items-center gap-2 ${isActive && 'bg-muted text-primary'} ${open ? '' : 'justify-center bg-transparent'} `}
              data-test-id={testIDFormatter(`sdnavmenu-itm-${item.title}`)}
              onClick={async(e) => {
                e.preventDefault();
                const redirectedUrl = await getMenuLink(item || '');
                router.push(redirectedUrl);
                setOpenMobile(false);
              }}
            >
              <SidebarMenuButton
                tooltip={!isMobile ? item.title : undefined}
                data-test-id={testIDFormatter(
                  `sdnavmenu-itm-${item.title}-btn`,
                )}
              >
                <ICON className="mr-2 h-5 w-5" />
                {open || stype === 'sm' || stype === 'md' || stype === 'xs' ? (
                  <span className="font-semibold">{item.title}aaaa</span>
                ) : null}
                <>
                  {' '}
                  {!open ? (
                    isFavorite ? (
                      <SolidStarIcon
                        onClick={toggleFavorite}
                        data-test-id={testIDFormatter(
                          `sdnavmenu-itm-${item.title}-fav-btn`,
                        )}
                        className="ml-auto cursor-pointer text-yellow-400 opacity-0 transition-opacity duration-300 ease-in-out group-hover/item:opacity-100"
                      />
                    ) : (
                      <StarIcon
                        onClick={toggleFavorite}
                        data-test-id={testIDFormatter(
                          `sdnavmenu-itm-${item.title}-fav-btn`,
                        )}
                        className="ml-auto cursor-pointer text-yellow-400 opacity-0 transition-opacity duration-300 ease-in-out group-hover/item:opacity-100"
                      />
                    )
                  ) : null}
                </>
              </SidebarMenuButton>
            </Link>
          )}
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  );
}
