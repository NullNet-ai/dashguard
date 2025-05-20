import * as React from "react";
import { Button } from "~/components/ui/button";
import { AutosizeTextarea } from "~/components/ui/autosize-textarea";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import { FaceSmileIcon } from "@heroicons/react/20/solid";
import { cn } from "~/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import dynamic from "next/dynamic";
import { useRef } from "react";
// Import the required types from emoji-picker-react
import type { Theme, EmojiStyle, EmojiClickData } from "emoji-picker-react";

// Improve lazy loading with better configuration
const EmojiPicker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-4 h-[350px] w-[320px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
);

// Update the MessageInputBox component to accept emojiPickerConfig
// Only showing the relevant parts that need to be changed

export interface MessageInputBoxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * The current value of the input
   */
  value?: string;
  
  /**
   * Callback when input value changes
   */
  onChange?: (value: string) => void;
  
  /**
   * Placeholder text for the textarea
   */
  placeholder?: string;
  
  /**
   * Callback when the comment is submitted
   */
  onSubmit?: () => void;
  
  /**
   * Text for the submit button
   */
  submitButtonText?: string;
  
  /**
   * Callback when attachment button is clicked
   */
  onAttachmentClick?: () => void;
  
  /**
   * Callback when emoji button is clicked
   */
  onEmojiClick?: () => void;
  
  /**
   * Disable the input
   */
  disabled?: boolean;
  
  /**
   * Additional class name for the container
   */
  className?: string;
  
  /**
   * Additional class name for the textarea
   */
  textareaClassName?: string;
  
  /**
   * Additional class name for the actions container
   */
  actionsClassName?: string;
  
  /**
   * Additional class name for the submit button
   */
  submitButtonClassName?: string;
  
  /**
   * Show or hide the submit button
   */
  showSubmitButton?: boolean;
  
  /**
   * Maximum height for the textarea
   */
  maxHeight?: number;
  
  /**
   * Minimum height for the textarea
   */
  minHeight?: number;
  
  /**
   * Maximum number of lines for the textarea
   */
  maxLines?: number;
  
  /**
   * Show character count
   */
  showCharCount?: boolean;
  
  /**
   * Maximum character count
   */
  maxCharCount?: number;
  
  /**
   * Configuration for the emoji picker
   */
  emojiPickerConfig?: {
    searchDisabled?: boolean;
    skinTonesDisabled?: boolean;
    width?: number;
    height?: number;
    previewConfig?: {
      showPreview?: boolean;
    };
    lazyLoadEmojis?: boolean;
    searchPlaceHolder?: string;
    theme?: Theme;
    emojiStyle?: EmojiStyle;
  };
}

export const MessageInputBox = React.forwardRef<HTMLDivElement, MessageInputBoxProps>(
  ({
    value = "",
    onChange,
    placeholder = "Add your comment...",
    onSubmit,
    submitButtonText = "Comment",
    onAttachmentClick,
    onEmojiClick,
    disabled = false,
    className,
    textareaClassName,
    actionsClassName,
    submitButtonClassName,
    showSubmitButton = true,
    maxHeight = 300,
    minHeight = 80,
    maxLines,
    showCharCount = false,
    maxCharCount,
    emojiPickerConfig,
    ...props
  }, ref) => {
    const [isEmojiOpen, setIsEmojiOpen] = React.useState(false);
    const [isEmojiLoaded, setIsEmojiLoaded] = React.useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit?.();
    };
    
    // Updated emoji handler to work with emoji-picker-react
    const handleEmojiSelect = (emojiData: EmojiClickData) => {
      if (onChange && typeof value === 'string') {
        onChange(value + emojiData.emoji);
        setIsEmojiOpen(false); // Close the popover after selection
      }
    };

    // Preload emoji picker when hovering over the button
    const handleEmojiButtonHover = () => {
      if (!isEmojiLoaded) {
        // This will trigger the dynamic import
        setIsEmojiLoaded(true);
      }
    };

    return (
      <div 
        ref={ref} 
        className={cn("mt-1 border rounded-md bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary", className)}
        {...props}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-3 pb-0">
            <AutosizeTextarea
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              disabled={disabled}
              maxHeight={maxHeight}
              minHeight={minHeight}
              maxLines={maxLines}
              showCharCount={showCharCount}
              maxCharCount={maxCharCount}
              disableResize
              className={cn(
                "text-md border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                textareaClassName
              )}
            />
          </div>
          <div className={cn("px-3 py-2 pt-0 flex justify-between items-center", actionsClassName)}>
            <div className="flex gap-2">
              {onAttachmentClick && (
                <button 
                  type="button"
                  className="text-muted-foreground hover:text-gray-700"
                  onClick={onAttachmentClick}
                  disabled={disabled}
                >
                  <PaperClipIcon className="size-5" />
                </button>
              )}
              
              <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
                <PopoverTrigger asChild>
                  <button 
                    type="button"
                    className="text-muted-foreground hover:text-gray-700"
                    disabled={disabled}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEmojiOpen(!isEmojiOpen);
                      setIsEmojiLoaded(true);
                      onEmojiClick?.();
                    }}
                    onMouseEnter={handleEmojiButtonHover}
                  >
                    <FaceSmileIcon className="size-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  ref={popoverRef}
                  className="p-0 w-auto h-auto" 
                  align="start" 
                  side="top"
                  sideOffset={5}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  {(isEmojiOpen || isEmojiLoaded) && (
                    <div className="emoji-picker-wrapper">
                      <EmojiPicker
                        onEmojiClick={handleEmojiSelect}
                        searchDisabled={emojiPickerConfig?.searchDisabled ?? false}
                        skinTonesDisabled={emojiPickerConfig?.skinTonesDisabled ?? false}
                        width={emojiPickerConfig?.width ?? 320}
                        height={emojiPickerConfig?.height ?? 400}
                        previewConfig={emojiPickerConfig?.previewConfig ?? {
                          showPreview: true
                        }}
                        lazyLoadEmojis={emojiPickerConfig?.lazyLoadEmojis ?? true}
                        searchPlaceHolder={emojiPickerConfig?.searchPlaceHolder ?? "Search emoji..."}
                        theme={emojiPickerConfig?.theme ?? ("light" as Theme)}
                        emojiStyle={emojiPickerConfig?.emojiStyle ?? ("native" as EmojiStyle)}
                      />
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            {showSubmitButton && (
              <Button 
                type="submit" 
                size="sm"
                disabled={disabled || !value.trim()}
                className={submitButtonClassName}
              >
                {submitButtonText}
              </Button>
            )}
          </div>
        </form>
      </div>
    );
  }
);

MessageInputBox.displayName = "MessageInputBox";