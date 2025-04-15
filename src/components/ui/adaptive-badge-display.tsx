"use client";

import * as React from "react";
import { Badge, type BadgeProps } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { XMarkIcon } from "@heroicons/react/20/solid";

export interface BadgeItem {
  id: string;
  label: string;
  badgeProps?: Omit<BadgeProps, "children">;
  onClick?: () => void;
  showCloseButton?: boolean;
}

export interface AdaptiveBadgeDisplayProps {
  badges: BadgeItem[];
  displayMode?: "expand" | "dropdown";
  containerClassName?: string;
  badgeClassName?: string;
  maxVisibleBadges?: number;
  maxHeight?: number; // For dropdown mode scrollable area
  onBadgeClick?: (badge: BadgeItem) => void;
  onBadgeClose?: (badge: BadgeItem) => void;
  showCloseButton?: boolean; // Global setting to show/hide close buttons
  useOverflowDetection?: boolean; // Enable dynamic overflow detection
  moreButtonClassName?: string; // Custom class for the "more" button
  moreButtonLabel?: string; // Custom label for the "more" button (default: "+N more")
  lessButtonLabel?: string; // Custom label for the "less" button (default: "Show less")
  emptyStateContent?: React.ReactNode; // Content to show when no badges are present
  customRenderBadge?: (badge: BadgeItem, isVisible: boolean) => React.ReactNode; // Custom badge renderer
  onMoreButtonClick?: () => void; // Callback when more button is clicked
  onLessButtonClick?: () => void; // Callback when less button is clicked
  dropdownProps?: {
    align?: "start" | "center" | "end";
    sideOffset?: number;
    className?: string;
    closeOnSelect?: boolean;
  }; // Props for the dropdown popover
}

export const AdaptiveBadgeDisplay = React.forwardRef<
  HTMLDivElement,
  AdaptiveBadgeDisplayProps
>(
  (
    {
      badges,
      displayMode = "expand",
      containerClassName,
      badgeClassName,
      maxVisibleBadges = 3,
      maxHeight = 200,
      onBadgeClick,
      onBadgeClose,
      showCloseButton = false,
      useOverflowDetection = true, // Changed to true by default
      moreButtonClassName = "",
      moreButtonLabel,
      lessButtonLabel = "See less",
      emptyStateContent = null,
      customRenderBadge,
      onMoreButtonClick,
      onLessButtonClick,
      dropdownProps = {},
    },
    ref
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const badgeRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
    const moreButtonRef = React.useRef<HTMLButtonElement>(null);
    
    const [visibleBadges, setVisibleBadges] = React.useState<BadgeItem[]>([]);
    const [hiddenBadges, setHiddenBadges] = React.useState<BadgeItem[]>([]);
    const [expanded, setExpanded] = React.useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    // Calculate visible and hidden badges
    React.useEffect(() => {
      if (!useOverflowDetection) {
        // Use the fixed maxVisibleBadges approach
        if (badges.length <= maxVisibleBadges) {
          setVisibleBadges(badges);
          setHiddenBadges([]);
        } else {
          setVisibleBadges(badges.slice(0, maxVisibleBadges));
          setHiddenBadges(badges.slice(maxVisibleBadges));
        }
        return;
      }

      // Reset when badges change
      setVisibleBadges([]);
      setHiddenBadges([]);
      
      // We'll calculate overflow in the next effect after rendering
    }, [badges, maxVisibleBadges, useOverflowDetection]);

    // Dynamic overflow detection using ResizeObserver
    React.useEffect(() => {
      if (!useOverflowDetection || !containerRef.current) return;
      
      // Function to calculate which badges fit in the container
      const calculateVisibleBadges = () => {
        const container = containerRef.current;
        if (!container) return;
        
        const containerWidth = container.clientWidth;
        const moreButtonWidth = moreButtonRef.current?.offsetWidth || 70; // Estimate if not rendered yet
        
        let availableWidth = containerWidth - 16; // Increase padding/margin allowance
        const visibleItems: BadgeItem[] = [];
        const hiddenItems: BadgeItem[] = [];
        
        // Always reserve space for the "more" button if we have more than maxVisibleBadges badges
        // This prevents layout shift when badges are added/removed
        if (badges.length > maxVisibleBadges) {
          availableWidth -= moreButtonWidth + 8; // Add gap space
        }
        
        // Calculate which badges fit
        let visibleCount = 0;
        for (const badge of badges) {
          // Check if we've reached the maxVisibleBadges limit
          if (visibleCount >= maxVisibleBadges) {
            hiddenItems.push(badge);
            continue;
          }
          
          const badgeEl = badgeRefs.current.get(badge.id);
          
          // If we can't measure this badge yet, make a better estimate based on content
          const badgeWidth = badgeEl?.offsetWidth || 
            Math.min(200, Math.max(80, badge.label.length * 8 + 32 + (showCloseButton ? 24 : 0)));
          
          if (availableWidth >= badgeWidth + 8) { // Add gap space
            visibleItems.push(badge);
            availableWidth -= badgeWidth + 8; // Account for gap
            visibleCount++;
          } else {
            hiddenItems.push(badge);
          }
        }
        
        // If all badges fit, don't show the more button
        if (hiddenItems.length === 0) {
          setVisibleBadges(badges);
          setHiddenBadges([]);
        } else {
          setVisibleBadges(visibleItems);
          setHiddenBadges(hiddenItems);
        }
      };
      
      // Initial calculation
      calculateVisibleBadges();
      
      // Set up ResizeObserver to recalculate on container size changes
      const resizeObserver = new ResizeObserver(() => {
        if (expanded) return; // Don't recalculate when expanded
        calculateVisibleBadges();
      });
      
      resizeObserver.observe(containerRef.current);
      
      // Force recalculation when badges change
      const badgesChangeHandler = () => {
        if (!expanded) {
          calculateVisibleBadges();
        }
      };
      
      // Add a MutationObserver to detect DOM changes within the container
      const mutationObserver = new MutationObserver(badgesChangeHandler);
      mutationObserver.observe(containerRef.current, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
      
      // Clean up
      return () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      };
    }, [badges, showCloseButton, expanded, useOverflowDetection, maxVisibleBadges]);

    // Update measurements after render when badges change
    React.useEffect(() => {
      if (!useOverflowDetection) return;
      
      // Use a short timeout to ensure the DOM has updated
      const timeoutId = setTimeout(() => {
        if (containerRef.current) {
          // Force a recalculation now that badges are rendered and measurable
          const event = new Event('resize');
          window.dispatchEvent(event);
        }
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }, [badges, useOverflowDetection]);

    // Handle keyboard navigation and accessibility
    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Handle keyboard navigation for badges
      if (e.key === 'Escape' && isPopoverOpen) {
        setIsPopoverOpen(false);
      }
      
      // Handle Delete/Backspace to remove badges with close buttons
      if ((e.key === 'Delete' || e.key === 'Backspace') && 
          document.activeElement instanceof HTMLElement) {
        const badgeId = document.activeElement.getAttribute('data-badge-id');
        if (badgeId) {
          const badge = [...visibleBadges, ...hiddenBadges].find(b => b.id === badgeId);
          if (badge && (badge.showCloseButton || showCloseButton)) {
            onBadgeClose?.(badge);
            e.preventDefault();
          }
        }
      }
      
      // Handle dropdown navigation with up/down keys when popover is open
      if (isPopoverOpen && displayMode === "dropdown" && 
          (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        
        const focusedBadgeId = document.activeElement instanceof HTMLElement ? 
          document.activeElement.getAttribute('data-badge-id') : null;
        
        // Find the current index in hidden badges
        const currentIndex = focusedBadgeId ? 
          hiddenBadges.findIndex(b => b.id === focusedBadgeId) : -1;
        
        let nextIndex: number;
        if (e.key === 'ArrowDown') {
          // Move to next item or wrap to first
          nextIndex = currentIndex < hiddenBadges.length - 1 ? currentIndex + 1 : 0;
        } else {
          // Move to previous item or wrap to last
          nextIndex = currentIndex > 0 ? currentIndex - 1 : hiddenBadges.length - 1;
        }
        
        // Focus the next badge
        const nextBadgeId = hiddenBadges[nextIndex]?.id;
        const popoverContent = document.querySelector('[role="dialog"]');
        const nextElement = popoverContent?.querySelector(`[data-badge-id="${nextBadgeId}"]`) as HTMLElement;
        
        if (nextElement) {
          nextElement.focus();
          // Ensure the focused element is visible in the scrollable area
          nextElement.scrollIntoView({ block: 'nearest' });
        }
        return;
      }
      
      // Enhanced keyboard navigation between badges
      if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && 
          document.activeElement instanceof HTMLElement) {
        // Only handle horizontal navigation when not in dropdown mode or dropdown is closed
        if (displayMode === "dropdown" && isPopoverOpen) return;
        
        const badgeId = document.activeElement.getAttribute('data-badge-id');
        if (badgeId) {
          e.preventDefault();
          const allBadges = [...visibleBadges, ...(expanded ? hiddenBadges : [])];
          const currentIndex = allBadges.findIndex(b => b.id === badgeId);
          
          if (currentIndex < allBadges.length - 1) {
            // Find the next badge element and focus it
            const nextBadge = allBadges[currentIndex + 1];
            const nextElement = nextBadge ? document.querySelector(`[data-badge-id="${nextBadge.id}"]`) as HTMLElement : null;
            if (nextElement) {
              nextElement.focus();
            }
          } else if (!expanded && hiddenBadges.length > 0 && moreButtonRef.current) {
            // If at the end of visible badges and there are hidden badges, focus the "more" button
            moreButtonRef.current.focus();
          }
        }
      }
      
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && 
          document.activeElement instanceof HTMLElement) {
        const badgeId = document.activeElement.getAttribute('data-badge-id');
        if (badgeId) {
          e.preventDefault();
          const allBadges = [...visibleBadges, ...(expanded ? hiddenBadges : [])];
          const currentIndex = allBadges.findIndex(b => b.id === badgeId);
          
          if (currentIndex > 0) {
            // Find the previous badge element and focus it
            const prevBadge = allBadges[currentIndex - 1];
            const prevElement = prevBadge ? document.querySelector(`[data-badge-id="${prevBadge.id}"]`) as HTMLElement : null;
            if (prevElement) {
              prevElement.focus();
            }
          }
        }
      }
      
      // Handle Home/End keys for quick navigation
      if (e.key === 'Home') {
        e.preventDefault();
        const allBadges = [...visibleBadges, ...(expanded ? hiddenBadges : [])];
        if (allBadges.length > 0) {
          const firstBadge = allBadges[0];
          const firstElement = firstBadge ? document.querySelector(`[data-badge-id="${firstBadge.id}"]`) as HTMLElement : null;
          if (firstElement) {
            firstElement.focus();
          }
        }
      }
      
      if (e.key === 'End') {
        e.preventDefault();
        const allBadges = [...visibleBadges, ...(expanded ? hiddenBadges : [])];
        if (allBadges.length > 0) {
          const lastBadge = allBadges[allBadges.length - 1];
          if (lastBadge) {
            const lastElement = document.querySelector(`[data-badge-id="${lastBadge.id}"]`) as HTMLElement;
            if (lastElement) {
              lastElement.focus();
            }
          }
        }
      } // Add missing closing brace here
      }; // End of handleKeyDown function
    
      // Toggle popover state
      const handleTogglePopover = () => {
        setIsPopoverOpen(!isPopoverOpen);
        if (!isPopoverOpen) {
          onMoreButtonClick?.();
        }
      };

      const handleToggleExpand = () => {
        setExpanded(!expanded);
        if (expanded) {
          onLessButtonClick?.();
        } else {
          onMoreButtonClick?.();
        }
      };

      // Update the renderBadge function to improve the border/ring styling
      const renderBadge = (badge: BadgeItem, additionalClasses?: string) => {
        if (customRenderBadge) {
          return customRenderBadge(badge, visibleBadges.includes(badge));
        }
        
        // Reference to store the badge element for measurements
        const setBadgeRef = (el: HTMLDivElement | null) => {
          if (el) {
            badgeRefs.current.set(badge.id, el);
          } else {
            badgeRefs.current.delete(badge.id);
          }
        };
        
        // Determine if close button should be shown
        const shouldShowCloseButton = badge.showCloseButton !== undefined 
          ? badge.showCloseButton 
          : showCloseButton;
        
        return (
          <Badge
            key={badge.id}
            ref={setBadgeRef}
            data-badge-id={badge.id}
            tabIndex={0}
            variant={badge.badgeProps?.variant || "default"}
            className={cn(
              "group relative px-2.5 py-0.5 h-6 transition-all outline-none",
              shouldShowCloseButton && "pr-6",
              "focus:ring-1 focus:ring-primary focus:ring-offset-0", // Improved ring styling
              badge.badgeProps?.className,
              badgeClassName,
              additionalClasses
            )}
            onClick={() => {
              if (badge.onClick) {
                badge.onClick();
              } else if (onBadgeClick) {
                onBadgeClick(badge);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (badge.onClick) {
                  badge.onClick();
                } else if (onBadgeClick) {
                  onBadgeClick(badge);
                }
                
                // If in dropdown mode and closeOnSelect is enabled, close the popover
                if (displayMode === "dropdown" && isPopoverOpen && dropdownProps.closeOnSelect) {
                  setIsPopoverOpen(false);
                }
              }
            }}
            role="option"
            aria-selected={false}
            aria-label={`${badge.label} badge${shouldShowCloseButton ? ', press Delete to remove' : ''}`}
            {...badge.badgeProps}
          >
            {badge.label}
            {shouldShowCloseButton && (
              <button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full inline-flex items-center justify-center opacity-70 hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onBadgeClose?.(badge);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onBadgeClose?.(badge);
                  }
                }}
                aria-label={`Remove ${badge.label}`}
                tabIndex={0}
              >
                <XMarkIcon className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </button>
            )}
          </Badge>
        );
      };
      
      // Modify the return JSX to improve dropdown and expanded UI
      return (
        <div
          ref={ref || containerRef}
          className={cn(
            "flex flex-wrap gap-2", 
            containerClassName
          )}
          style={{ 
            width: containerClassName?.includes('inline') ? 'auto' : '100%',
            position: 'relative'
          }}
          onKeyDown={handleKeyDown}
          role="listbox"
          aria-label="Badge collection"
          aria-multiselectable="false"
        >
          {/* Show empty state if no badges */}
          {badges.length === 0 && emptyStateContent && (
            <div className="w-full text-muted-foreground text-sm">
              {emptyStateContent}
            </div>
          )}
          
          {/* Always show visible badges */}
          {visibleBadges.map((badge) => renderBadge(badge))}
      
          {/* Show hidden badges based on display mode */}
          {hiddenBadges.length > 0 && (
            <>
              {displayMode === "expand" ? (
                <>
                  {!expanded ? (
                    <Button
                      ref={moreButtonRef}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-6 px-2.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-all duration-200 focus:ring-1 focus:ring-primary focus:ring-offset-0",
                        moreButtonClassName
                      )}
                      onClick={handleToggleExpand}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleToggleExpand();
                        }
                      }}
                      aria-expanded={expanded}
                      aria-controls="expanded-badges"
                      aria-label={`Show ${hiddenBadges.length} more badges`}
                    >
                      {moreButtonLabel || `More (${hiddenBadges.length})`}
                    </Button>
                  ) : (
                    <>
                      {/* Render hidden badges inline with visible badges */}
                      {hiddenBadges.map((badge, index) => 
                        renderBadge(badge, `animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300 delay-${Math.min(index * 50, 300)}`)
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-6 px-2.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-all duration-200 animate-in fade-in focus:ring-1 focus:ring-primary focus:ring-offset-0",
                          moreButtonClassName
                        )}
                        onClick={handleToggleExpand}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleToggleExpand();
                          }
                        }}
                        aria-expanded={expanded}
                        aria-controls="expanded-badges"
                        aria-label="Show fewer badges"
                      >
                        {lessButtonLabel}
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      ref={moreButtonRef}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-6  px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-all duration-200 focus:ring-1 focus:ring-primary focus:ring-offset-0",
                        moreButtonClassName
                      )}
                      onClick={handleTogglePopover}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleTogglePopover();
                        }
                      }}
                      aria-label={`Show ${hiddenBadges.length} more badges in dropdown`}
                      aria-haspopup="true"
                      aria-expanded={isPopoverOpen}
                    >
                      {moreButtonLabel || `More (${hiddenBadges.length})`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className={cn("p-0 w-auto shadow-md border border-border bg-popover animate-in fade-in zoom-in-95 duration-200", 
                    dropdownProps.className
                    )}
                    align={dropdownProps.align || "center"}
                    sideOffset={dropdownProps.sideOffset || 4}
                    onOpenAutoFocus={(e) => {
                      // Prevent default autofocus and focus the first badge instead
                      e.preventDefault();
                      if (hiddenBadges.length > 0) {
                        setTimeout(() => {
                          const firstBadge = document.querySelector(`[data-badge-id="${hiddenBadges[0]?.id}"]`) as HTMLElement;
                          if (firstBadge) {
                            firstBadge.focus();
                          }
                        }, 0);
                      }
                    }}
                  >
                    <div 
                      className="max-h-[var(--radix-popover-content-available-height)] overflow-auto"
                      style={{ maxHeight }}
                    >
                      <div 
                        className="p-2"
                        role="listbox"
                        aria-label="Hidden badges"
                      >
                        <div className="flex flex-col gap-1">
                          {hiddenBadges.map((badge) => (
                            <div key={badge.id} className="w-full">
                              {renderBadge(badge, "w-auto justify-start hover:bg-muted/50")}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </>
          )}
        </div>
      );
    }
  );

AdaptiveBadgeDisplay.displayName = "AdaptiveBadgeDisplay";
