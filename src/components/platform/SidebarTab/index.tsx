'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { cn } from '~/lib/utils';
import { type SidebarTabItem } from './types';
import { ChevronLeft, ChevronRight, CodeXml } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { SidebarTabProvider } from './Provider';
import { Card } from '~/components/ui/card';
import Image from 'next/image';

const PROVIDER_SIZE_MAP = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'lg',
} as const satisfies Record<NonNullable<SidebarTabProps['size']>, 'sm' | 'md' | 'lg'>;

interface TruncatedLabelProps {
  text: string;
  show: boolean;
}

const TruncatedLabel = React.memo(({ text, show }: TruncatedLabelProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  const isOverflowing = () => {
    const el = ref.current;
    return el ? el.scrollWidth > el.clientWidth : false;
  };

  const onEnter = () => {
    if (!show) return;
    setOpen(isOverflowing());
  };

  const onLeave = () => setOpen(false);

  const span = (
    <span ref={ref} className="truncate" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {text}
    </span>
  );

  if (!show) return span;

  return (
    <Tooltip open={open}>
      <TooltipTrigger asChild>{span}</TooltipTrigger>
      <TooltipContent side="top">{text}</TooltipContent>
    </Tooltip>
  );
});

TruncatedLabel.displayName = 'TruncatedLabel';


interface SidebarTabProps {
  tabs: SidebarTabItem[];
  defaultValue?: string;
  persistKey?: string;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  tablistClassName?: string;
  isStickyContainer?: boolean;
  stickyClassName?: string;
  stickyTop?: number;
  headerLabel?: string;
  forceDefault?: boolean;
  onStateChanged?: (tabId: string) => void;
  refreshOnTabChange?: boolean;
  refreshOnTabChangeTabs?: string[];
}

export default function SidebarTab({
  tabs,
  defaultValue,
  persistKey,
  position = 'right',
  size = 'md',
  className,
  tablistClassName,
  isStickyContainer,
  stickyClassName,
  stickyTop,
  headerLabel,
  forceDefault = false,
  onStateChanged,
  refreshOnTabChange = false,
  refreshOnTabChangeTabs,
}: SidebarTabProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(
    defaultValue ?? tabs[0]?.id ?? ''
  );

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => true);

  const toggleCollapsed = useCallback(() => setIsCollapsed((prev) => !prev), []);

  useEffect(() => {
    if (!persistKey) return;
    const saved = window.localStorage.getItem(`tab-${persistKey}`);
    if (saved && tabs.some((t) => t.id === saved)) {
      setActiveTab(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistKey]);

  useEffect(() => {
    if (!persistKey) return;
    if (activeTab) {
      window.localStorage.setItem(`tab-${persistKey}`, activeTab);
    }
  }, [activeTab, persistKey]);

  useEffect(() => {
    if (defaultValue && forceDefault) {
      setActiveTab(defaultValue);
    }
  }, [defaultValue, forceDefault]);

  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    onStateChanged?.(activeTab);

    if (!refreshOnTabChange) return;
    if (Array.isArray(refreshOnTabChangeTabs) && !refreshOnTabChangeTabs.includes(activeTab)) {
      return;
    }

    router.refresh();
  }, [activeTab, onStateChanged, refreshOnTabChange, refreshOnTabChangeTabs, router]);

  const providerSize = PROVIDER_SIZE_MAP[size];
  const [computedStickyTop, setComputedStickyTop] = useState<number>(0);

  useEffect(() => {
    if (!isStickyContainer) return;
    if (typeof window === 'undefined') return;

    if (typeof stickyTop === 'number') {
      setComputedStickyTop(stickyTop);
      return;
    }

    const headerEl = document.getElementById('dashboard-sticky-header');
    const update = () => {
      const h = headerEl?.offsetHeight ?? 0;
      setComputedStickyTop(h + 0);
    };
    update();

    let ro: ResizeObserver | null = null;
    if (headerEl && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => update());
      ro.observe(headerEl);
    }

    const onResize = () => update();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (ro && headerEl) ro.unobserve(headerEl);
    };
  }, [isStickyContainer, stickyTop]);

  return (
    <SidebarTabProvider
      value={{
        tabs,
        variant: 'pills',
        size: providerSize,
        orientation: 'vertical',
        position,
        defaultValue,
        rotateText: false,
        activeTab,
        setActiveTab,
        isCollapsed,
        setIsCollapsed,
      }}
    >
      <div className={cn('relative w-full transition-[width] duration-200 ease-in-out', className)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex gap-2">
            <Card
              className={cn(
                'p-2 h-max transition-[width,max-width] duration-200 ease-in-out space-y-2 w-full max-w-48 z-[60]',
                isStickyContainer && `sticky top-0 ${stickyClassName}`,
                isCollapsed && 'w-full max-w-16',
              )}
              style={isStickyContainer ? { top: computedStickyTop } : undefined}
            >
              <div
                className={cn('flex items-center', {
                  'justify-center': isCollapsed,
                  'justify-end': !isCollapsed && !headerLabel,
                  'justify-between': !isCollapsed && !!headerLabel,
                })}
              >
                {headerLabel && !isCollapsed && (
                  <span className="text-xs font-semibold text-muted-foreground">{headerLabel}</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  Icon={isCollapsed ? ChevronRight : ChevronLeft}
                  tooltipContent={isCollapsed ? 'Expand' : 'Collapse'}
                  onClick={toggleCollapsed}
                />
              </div>

              <TooltipProvider delayDuration={200}>
                <TabsList
                  orientation="vertical"
                  className={cn('rounded-lg w-full gap-1 bg-muted/40 p-1', tablistClassName)}
                >
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;

                    const trigger = (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        size={providerSize}
                        aria-label={tab.label}
                        variant="pills"
                        disabled={tab.disabled}
                        className={cn(
                          'relative justify-start gap-2 rounded-md px-3 py-2 h-[34px]',
                        )}
                          style={{
                            backgroundColor: activeTab === tab.id ? '#3b82f6' : '',
                            color: activeTab === tab.id ? '#fff' : '',
                          }}
                      >
                        {typeof tab.icon === 'string' ? (
                          <Image
                            className={cn('min-w-4', isActive && 'filter brightness-0 invert')}
                            width={16}
                            height={16}
                            src={`/fileIcons/Outline${tab.icon}`}
                            alt={tab.label}
                          />
                        ) : (
                          <span className="w-4">{tab.icon ?? <CodeXml size={16} />}</span>
                        )}

                        {!isCollapsed && <TruncatedLabel text={tab.label} show />}
                      </TabsTrigger>
                    );

                    return isCollapsed ? (
                      <Tooltip key={tab.id}>
                        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
                        <TooltipContent side="right">{tab.label}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <React.Fragment key={tab.id}>{trigger}</React.Fragment>
                    );
                  })}
                </TabsList>
              </TooltipProvider>
            </Card>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="w-full pb-1">
                {activeTab === tab.id ? tab.content : null}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </SidebarTabProvider>
  );
}
