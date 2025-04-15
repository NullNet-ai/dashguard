"use client"
import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { ChevronDownIcon } from "lucide-react";
import React, { type ElementType, useEffect, useState } from "react";
import { usePopper } from "react-popper";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import InfiniteScroll from 'react-infinite-scroll-component';

export interface ComboSelectOption {
    label: string;
    value: string;
    status?: 'online' | 'offline' | 'busy' | 'away';
    avatar?: string; // URL for avatar image
    avatarFallback?: string; // Fallback text for avatar (initials, etc.)
    secondaryText?: string; // Secondary text like username/handle
}

// Status color configuration
const statusColors = {
    online: "bg-success", // Green for online status
    offline: "bg-gray-300", // Gray for offline status
    busy: "bg-danger", // Red for busy status
    away: "bg-warning" // Yellow/Orange for away status
};

export interface ComboSelectProps {
    options: ComboSelectOption[];
    value?: ComboSelectOption | null;
    onChange: (value: ComboSelectOption | null) => void;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    searchable?: boolean;
    icon?: ElementType;
    className?: string;
    error?: boolean;
    showCheckmarks?: boolean;
    checkmarkPosition?: 'left' | 'right';
    showStatus?: boolean; // New prop to toggle status indicators
    showAvatars?: boolean; // New prop to toggle avatar display
    avatarSize?: "2xs" | "xs" | "sm"; // Size options for avatars

    // New props for FormSelect integration
    renderCreateOption?: React.ReactNode; // Custom render for "Create New" option
    renderEmptyState?: React.ReactNode; // Custom render for empty state
    onQueryChange?: (query: string) => void; // Callback for query changes
    testId?: string; // For data-test-id attributes
    infiniteScroll?: {
        enabled: boolean;
        initialLimit?: number;
        loadMoreStep?: number;
        hasMore?: boolean;
        loadingIndicator?: React.ReactNode;
        scrollableTarget?: string;
        scrollThreshold?: number;
        endMessage?: React.ReactNode;
    };
        // New prop to directly call the create record function
        onCreateRecord?: (query?: string) => Promise<void>;
}

export function ComboSelect({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    disabled = false,
    readOnly = false,
    searchable = true,
    icon: SelectIcon,
    className,
    error = false,
    showCheckmarks = true,
    checkmarkPosition = 'right',
    showStatus = false,
    showAvatars = false,
    avatarSize = "xs",
    renderCreateOption,
    renderEmptyState,
    onQueryChange,
    testId,
    infiniteScroll,
    onCreateRecord,
}: ComboSelectProps) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    // InfiniteScroll state
    const initialLimit = infiniteScroll?.initialLimit || 50;
    const loadMoreStep = infiniteScroll?.loadMoreStep || 50;
    const [displayLimit, setDisplayLimit] = useState(initialLimit);
    const hasMore = infiniteScroll?.hasMore !== false;

    const [referenceElement, setReferenceElement] = useState<any>(null);
    const [popperElement, setPopperElement] = useState<any>(null);

    const { styles, attributes, update } = usePopper(referenceElement, popperElement, {
        placement: "bottom-start",
        modifiers: [
            {
                name: "preventOverflow",
                options: {
                    rootBoundary: "viewport",
                    boundary: "clippingParents",
                    padding: 8,
                },
            },
            {
                name: "flip",
                options: {
                    fallbackPlacements: ["top", "right", "left"],
                    padding: 8,
                },
            },
            {
                name: "offset",
                options: {
                    offset: [0, 0],
                },
            },
            {
                name: "computeStyles",
                options: {
                    gpuAcceleration: true,
                },
            },
        ],
    });

    // Update popper position when opening
    useEffect(() => {
        if (open && update) {
            setTimeout(() => {
                update();
            }, 0);
        }
    }, [open, update]);

    // Call onQueryChange callback when query changes
    useEffect(() => {
        if (onQueryChange) {
            onQueryChange(query);
        }
    }, [query, onQueryChange]);

    const filteredOptions = query === ""
        ? options
        : options.filter((option) =>
            option.label.toLowerCase().includes(query.toLowerCase().trim())
        );

    const inputReadOnly = !searchable || readOnly || disabled;

          // Handle key down events in the input
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (!open) return !open;
            
            // If there are filtered options, select the first one
            if (filteredOptions.length > 0) {
                const firstOption = filteredOptions[0];
                onChange(firstOption ?? null);
                setQuery("");
                return;
            }
            
            // If no options match but we have a query and create is enabled
            if (query && !filteredOptions.length) {
                // If we have a direct create function, use it
                if (onCreateRecord) {
                    onCreateRecord(query).catch(err => {
                        console.error("Error creating record:", err);
                    });
                    return;
                }
                
                // Fallback to clicking the create button if it exists
                if (renderCreateOption) {
                    const createButton = document.querySelector('[data-test-id$="-opt-create-new-"]') as HTMLButtonElement;
                    if (createButton) {
                        createButton.click();
                    }
                }
            }
        }
    };
    return (
        <Combobox
            as="div"
            value={value}
            onChange={(newValue) => {
                setQuery("");
                onChange(newValue);
            }}
            disabled={disabled}
        >
            <div className={cn("relative", className)} data-test-id={testId}>
                {SelectIcon && (
                    <SelectIcon
                        className={cn(
                            "absolute left-2 top-2 size-5 text-muted-foreground",
                            {
                                "opacity-50": disabled,
                            },
                        )}
                        aria-hidden="true"
                    />
                )}

                {/* Avatar in input field when a value is selected */}
                {showAvatars && value && (
                    <div className={cn(
                        "absolute top-1/2 -translate-y-1/2 flex items-center",
                        SelectIcon ? "left-8" : "left-2"
                    )}>
                        <Avatar
                            size={avatarSize}
                            statusProps={showStatus && value.status ? {
                                status: value.status as "online" | "offline" | "busy" | "away",
                                position: "bottom-right",
                                size: avatarSize
                            } : undefined}
                        >
                            {value.avatar && <AvatarImage src={value.avatar} alt={value.label} />}
                            {value.avatarFallback && <AvatarFallback>{value.avatarFallback}</AvatarFallback>}
                        </Avatar>
                    </div>
                )}

                {/* Status indicator in input field - only show if NOT using avatars */}
                {showStatus && value?.status && !showAvatars && (
                    <div
                        className={cn(
                            "absolute h-2 w-2 rounded-full top-1/2 -translate-y-1/2",
                            statusColors[value.status as keyof typeof statusColors] || "bg-muted",
                            SelectIcon ? "left-8" : "left-2"
                        )}
                    />
                )}

                <ComboboxInput
                    placeholder={placeholder}
                    readOnly={inputReadOnly}
                    disabled={disabled}
                    autoComplete='off'
                    ref={setReferenceElement}
                    className={cn(
                        "block w-full  rounded-md border-border py-[5px] md:text-md text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary disabled:border-gray-300 disabled:bg-secondary disabled:text-gray-400 sm:text-sm/6",
                        {
                            "outline-destructive": error,
                            "border-destructive": error,
                            "cursor-text": readOnly,
                        },
                        // Apply right padding if checkmark is on right
                        checkmarkPosition === 'right' ? "pr-12" : "",
                        // Apply left padding only if there's a value and checkmark is on left
                        (checkmarkPosition === 'left' && value) ? "pl-12" : "",
                        // Additional left padding for icon
                        SelectIcon ? "pl-8" : "pl-2",
                        // Additional padding for status indicator
                        (showStatus && value?.status) ? (SelectIcon ? "pl-12" : "pl-6") : "",
                        // Additional padding for avatar
                        (showAvatars && value) ? (SelectIcon ? "pl-16" : "pl-10") : "",
                        // Hide the input text when we have a value with secondary text
                        value?.secondaryText ? "text-transparent" : ""
                    )}
                    onClick={() => {
                        if (disabled || readOnly) return;
                        setOpen(true);
                    }}
                    onChange={(event) => {
                        setQuery(event.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        setTimeout(() => setOpen(false), 100);
                    }}
                    displayValue={(option: ComboSelectOption) => {
                        if (!option) return "";
                        return option.label;
                    }}
                    data-test-id={testId ? `${testId}-input` : undefined}
                />

                {/* Custom display for label + secondary text */}
                {value?.secondaryText && (
                    <div className={cn(
                        "absolute inset-0 flex flex-wrap items-center pointer-events-none",
                        // Apply the same padding as the input to align content
                        checkmarkPosition === 'right' ? "pr-12" : "",
                        (checkmarkPosition === 'left' && value) ? "pl-12" : "",
                        SelectIcon ? "pl-8" : "pl-2",
                        (showStatus && value?.status) ? (SelectIcon ? "pl-12" : "pl-6") : "",
                        (showAvatars && value) ? (SelectIcon ? "pl-16" : "pl-10") : ""
                    )}>
                        <div className="flex flex-wrap items-center w-full">
                            <span className="text-foreground sm:text-sm  md:text-md">
                                {value.label}
                            </span>
                            <span className="ml-1 text-muted-foreground text-xs">
                                {value.secondaryText}
                            </span>
                        </div>
                    </div>
                )}

                <ComboboxButton
                    disabled={disabled}
                    className={cn(
                        "inset-y-0 right-0 flex w-full items-center rounded-r-md focus:outline-none",
                        {
                            "cursor-default": readOnly,
                        },
                    )}
                    data-test-id={testId ? `${testId}-button` : undefined}
                >
                    <ChevronDownIcon
                        className={cn(
                            "absolute right-2 top-2.5 size-5 text-muted-foreground",
                            {
                                "opacity-50": disabled || readOnly,
                            },
                        )}
                        aria-hidden="true"
                    />
                </ComboboxButton>
                {!(disabled || readOnly) && (
                    <ComboboxOptions                    
                        static={open}
                        ref={setPopperElement}
                        style={{
                            ...styles.popper,
                            width: referenceElement?.offsetWidth,
                        }}
                        {...attributes.popper}
                        className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-0 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm md:text-md"
                        portal={true}
                        data-test-id={testId ? `${testId}-options` : undefined}
                    >
                        {infiniteScroll?.enabled ? (
                            <div
                                id={infiniteScroll.scrollableTarget || "select-scrollable-div"}
                                className="max-h-60 overflow-auto"
                            >
                                {/* Import InfiniteScroll at the top of the file if using this feature */}
                                <InfiniteScroll
                                    dataLength={Math.min(filteredOptions.length, displayLimit)}
                                    next={() => setDisplayLimit(prev => prev + loadMoreStep)}
                                    hasMore={hasMore && filteredOptions.length > displayLimit}
                                    loader={infiniteScroll.loadingIndicator || <div className="p-2">Loading...</div>}
                                    scrollableTarget={infiniteScroll.scrollableTarget || "select-scrollable-div"}
                                    scrollThreshold={infiniteScroll.scrollThreshold || 0.8}
                                    endMessage={
                                        infiniteScroll.endMessage || (
                                            filteredOptions.length > 0 ? (
                                                <div className="flex justify-center py-2">
                                                    <p className="text-center text-sm md:text-md text-gray-500">
                                                        No more options
                                                    </p>
                                                </div>
                                            ) : null
                                        )
                                    }
                                >
                                    {filteredOptions.slice(0, displayLimit).map((option) => (
                                        <ComboboxOption
                                            key={option.value}
                                            value={option}
                                            className={cn(
                                                "group flex items-center justify-between py-2 cursor-default select-none text-md text-foreground data-[focus]:bg-primary data-[focus]:text-white data-[focus]:outline-none",
                                                "px-2"
                                            )}
                                            data-test-id={testId ? `${testId}-option-${option.value}` : undefined}
                                        >
                                            {/* Left side container with avatar, status, checkmark and label */}
                                            <div className="flex items-center">
                                                {/* Avatar display with integrated status */}
                                                {showAvatars && (
                                                    <div className="mr-2 flex-shrink-0 flex items-center">
                                                        <Avatar
                                                            size={avatarSize}
                                                            statusProps={showStatus && option.status ? {
                                                                status: option.status as "online" | "offline" | "busy" | "away",
                                                                position: "bottom-right",
                                                                size: avatarSize
                                                            } : undefined}
                                                        >
                                                            {option.avatar && <AvatarImage src={option.avatar} alt={option.label} />}
                                                            {option.avatarFallback && <AvatarFallback>{option.avatarFallback}</AvatarFallback>}
                                                        </Avatar>
                                                    </div>
                                                )}

                                                {/* Status indicator - only show if NOT using avatars */}
                                                {showStatus && option.status && !showAvatars && (
                                                    <div
                                                        className={cn(
                                                            "h-2 w-2 rounded-full mr-2 flex-shrink-0",
                                                            statusColors[option.status as keyof typeof statusColors] || "bg-muted"
                                                        )}
                                                    />
                                                )}

                                                {/* Left positioned checkmark */}
                                                {showCheckmarks && checkmarkPosition === 'left' && (
                                                    <CheckIcon
                                                        className={cn(
                                                            "h-5 w-5 text-primary mr-2 flex-shrink-0",
                                                            value ? "block" : "hidden",
                                                            value?.value === option.value ? "opacity-100" : "opacity-0",
                                                            "group-data-[focus]:text-white"
                                                        )}
                                                        aria-hidden="true"
                                                    />
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-1">
                                                        <span className="text-md">
                                                            {option.label}
                                                        </span>
                                                        {option.secondaryText && (
                                                            <span className="text-xs text-muted-foreground group-data-[focus]:text-white/70">
                                                                {option.secondaryText}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right positioned checkmark */}
                                            {showCheckmarks && checkmarkPosition === 'right' && (
                                                <CheckIcon
                                                    className={cn(
                                                        "h-5 w-5 text-primary ml-2",
                                                        value ? "block" : "hidden",
                                                        value?.value === option.value ? "opacity-100" : "opacity-0",
                                                        "group-data-[focus]:text-white"
                                                    )}
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </ComboboxOption>
                                    ))}
                                </InfiniteScroll>
                            </div>
                        ) : (
                            <>
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option) => (
                                        <ComboboxOption
                                            key={option.value}
                                            value={option}
                                            className={cn(
                                                "group flex items-center justify-between py-2 cursor-default select-none text-md text-foreground data-[focus]:bg-primary data-[focus]:text-white data-[focus]:outline-none",
                                                "px-2"
                                            )}
                                            data-test-id={testId ? `${testId}-option-${option.value}` : undefined}
                                        >
                                            {/* Left side container with avatar, status, checkmark and label */}
                                            <div className="flex items-center">
                                                {/* Avatar display with integrated status */}
                                                {showAvatars && (
                                                    <div className="mr-2 flex-shrink-0 flex items-center">
                                                        <Avatar
                                                            size={avatarSize}
                                                            statusProps={showStatus && option.status ? {
                                                                status: option.status as "online" | "offline" | "busy" | "away",
                                                                position: "bottom-right",
                                                                size: avatarSize
                                                            } : undefined}
                                                        >
                                                            {option.avatar && <AvatarImage src={option.avatar} alt={option.label} />}
                                                            {option.avatarFallback && <AvatarFallback>{option.avatarFallback}</AvatarFallback>}
                                                        </Avatar>
                                                    </div>
                                                )}

                                                {/* Status indicator - only show if NOT using avatars */}
                                                {showStatus && option.status && !showAvatars && (
                                                    <div
                                                        className={cn(
                                                            "h-2 w-2 rounded-full mr-2 flex-shrink-0",
                                                            statusColors[option.status as keyof typeof statusColors] || "bg-muted"
                                                        )}
                                                    />
                                                )}

                                                {/* Left positioned checkmark */}
                                                {showCheckmarks && checkmarkPosition === 'left' && (
                                                    <CheckIcon
                                                        className={cn(
                                                            "h-5 w-5 text-primary mr-2 flex-shrink-0",
                                                            value ? "block" : "hidden",
                                                            value?.value === option.value ? "opacity-100" : "opacity-0",
                                                            "group-data-[focus]:text-white"
                                                        )}
                                                        aria-hidden="true"
                                                    />
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-1">
                                                        <span className=" text-md">
                                                            {option.label}
                                                        </span>
                                                        {option.secondaryText && (
                                                            <span className="text-xs text-muted-foreground group-data-[focus]:text-white/70">
                                                                {option.secondaryText}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right positioned checkmark */}
                                            {showCheckmarks && checkmarkPosition === 'right' && (
                                                <CheckIcon
                                                    className={cn(
                                                        "h-5 w-5 text-primary ml-2",
                                                        value ? "block" : "hidden",
                                                        value?.value === option.value ? "opacity-100" : "opacity-0",
                                                        "group-data-[focus]:text-white"
                                                    )}
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </ComboboxOption>
                                    ))
                                ) : renderEmptyState}

                                {/* Render custom create option if provided */}
                                {renderCreateOption}
                            </>
                        )}
                    </ComboboxOptions>
                )}
            </div>
        </Combobox>
    );
}