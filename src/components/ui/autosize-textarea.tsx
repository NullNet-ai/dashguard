'use client';
import * as React from 'react';
import { cn } from '~/lib/utils';
import { useImperativeHandle } from 'react';

interface UseAutosizeTextAreaProps {
  textAreaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  minHeight?: number;
  maxHeight?: number;
  minWidth?: number;  
  maxWidth?: number;  
  triggerAutoSize: string;
  maxLines?: number;
  lineWrapping?: boolean;
}

export type AutosizeTextAreaRef = {
  textArea: HTMLTextAreaElement;
  maxHeight: number;
  minHeight: number;
  focus: () => void;
};

// Update the props type
type AutosizeTextAreaProps = {
  maxHeight?: number;
  minHeight?: number;
  maxWidth?: number;
  minWidth?: number;
  icon?: React.ElementType;
  maxLines?: number;
  lineWrapping?: boolean;
  showCharCount?: boolean;
  maxCharCount?: number;
  disableResize?: boolean; // New prop to disable manual resizing
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

// Remove the custom resize event listeners effect
export const useAutosizeTextArea = ({
  textAreaRef,
  triggerAutoSize,
  maxHeight = Number.MAX_SAFE_INTEGER,
  minHeight = 0,
  maxWidth = Number.MAX_SAFE_INTEGER,
  minWidth = 0,
  maxLines,
  lineWrapping = true,
}: UseAutosizeTextAreaProps) => {
  const [init, setInit] = React.useState(true);
  const [manuallyResized, setManuallyResized] = React.useState(false);
  
  // Reset manuallyResized when triggerAutoSize changes
  React.useEffect(() => {
    setManuallyResized(false);
  }, [triggerAutoSize]);
  
  // Add resize observer to detect manual resizing
  React.useEffect(() => {
    const textAreaElement = textAreaRef.current;
    if (!textAreaElement) return;
    
    let lastHeight = textAreaElement.offsetHeight;
    
    const resizeObserver = new ResizeObserver((entries) => {
      // If height changed significantly and not due to our own adjustments
      if (entries[0]?.target?.clientHeight && Math.abs(entries[0].target.clientHeight - lastHeight) > 10) {
        setManuallyResized(true);
        lastHeight = entries[0].target.clientHeight;
      }
    });
    
    resizeObserver.observe(textAreaElement);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [textAreaRef]);
  
  // Original effect for auto-sizing
  React.useEffect(() => {
    const offsetBorder = 2; // Reduced from 6 to prevent excessive padding
    const textAreaElement = textAreaRef.current;
    if (textAreaElement) {
      // Initial setup
      if (init) {
        // Apply min/max constraints directly
        textAreaElement.style.minHeight = `${minHeight}px`;
        textAreaElement.style.maxHeight = maxHeight !== Number.MAX_SAFE_INTEGER ? `${maxHeight}px` : 'none';
        
        // Set initial width to 100% of parent
        textAreaElement.style.width = '100%';
        textAreaElement.style.minWidth = `${minWidth}px`;
        textAreaElement.style.maxWidth = maxWidth !== Number.MAX_SAFE_INTEGER ? `${maxWidth}px` : 'none';
        
        // Configure line wrapping
        textAreaElement.style.overflowWrap = lineWrapping ? 'break-word' : 'normal';
        textAreaElement.style.wordWrap = lineWrapping ? 'break-word' : 'normal';

        setInit(false);
      }
  
      // Skip height adjustment if manually resized
      if (!manuallyResized) {
        // Reset height to calculate actual scroll dimensions
        textAreaElement.style.height = 'auto';
    
        const scrollHeight = textAreaElement.scrollHeight;
        
        // Handle max height and line limit
        if (maxLines) {
          const lineHeight = parseInt(window.getComputedStyle(textAreaElement).lineHeight) || 20; // Fallback to 20px
          const maxLinesHeight = lineHeight * maxLines;
          
          if (scrollHeight > maxLinesHeight) {
            textAreaElement.style.height = `${Math.min(maxLinesHeight, maxHeight)}px`;
            textAreaElement.style.overflowY = 'auto';
          } else if (scrollHeight < minHeight) {
            textAreaElement.style.height = `${minHeight}px`;
            textAreaElement.style.overflowY = 'hidden';
          } else {
            textAreaElement.style.height = `${scrollHeight + offsetBorder}px`;
            textAreaElement.style.overflowY = 'hidden';
          }
        } else if (scrollHeight > maxHeight) {
          textAreaElement.style.height = `${maxHeight}px`;
          textAreaElement.style.overflowY = 'auto';
        } else if (scrollHeight < minHeight) {
          textAreaElement.style.height = `${minHeight}px`;
          textAreaElement.style.overflowY = 'hidden';
        } else {
          textAreaElement.style.height = `${scrollHeight + offsetBorder}px`;
          textAreaElement.style.overflowY = 'hidden';
        }
      }
    }
  }, [triggerAutoSize, maxLines, lineWrapping, textAreaRef, init, minHeight, maxHeight, minWidth, maxWidth, manuallyResized]);
};

// Update the component props
export const AutosizeTextarea = React.forwardRef<AutosizeTextAreaRef, AutosizeTextAreaProps>(
  (
    {
      maxHeight = Number.MAX_SAFE_INTEGER,
      minHeight = 3,
      maxWidth = Number.MAX_SAFE_INTEGER,
      minWidth = 0,
      className,
      onChange,
      value,
      icon: Icon,
      maxLines,
      lineWrapping = true,
      showCharCount = false,
      maxCharCount,
      disabled,
      readOnly,
      disableResize = false, // Default to false to maintain current behavior
      ...props
    }: AutosizeTextAreaProps,
    ref: React.Ref<AutosizeTextAreaRef>,
  ) => {
    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [triggerAutoSize, setTriggerAutoSize] = React.useState('');
    const [charCount, setCharCount] = React.useState(0);

    // Add a resize observer to enforce max height/width constraints
    React.useEffect(() => {
      const textAreaElement = textAreaRef.current;
      if (!textAreaElement) return;
      
      const resizeObserver = new ResizeObserver(() => {
        // Enforce max height constraint
        if (maxHeight !== Number.MAX_SAFE_INTEGER && textAreaElement.clientHeight > maxHeight) {
          textAreaElement.style.height = `${maxHeight}px`;
        }
        
        // Enforce max width constraint
        if (maxWidth !== Number.MAX_SAFE_INTEGER && textAreaElement.clientWidth > maxWidth) {
          textAreaElement.style.width = `${maxWidth}px`;
        }
      });
      
      resizeObserver.observe(textAreaElement);
      
      return () => {
        resizeObserver.disconnect();
      };
    }, [maxHeight, maxWidth]);

    useAutosizeTextArea({
      textAreaRef,
      triggerAutoSize: triggerAutoSize,
      maxHeight,
      minHeight,
      maxWidth,
      minWidth,
      maxLines,
      lineWrapping,
    });

    useImperativeHandle(ref, () => ({
      textArea: textAreaRef.current as HTMLTextAreaElement,
      focus: () => textAreaRef?.current?.focus(),
      maxHeight,
      minHeight,
    }));

    React.useEffect(() => {
      setTriggerAutoSize(value as string);
      
      // Update character count
      if (showCharCount) {
        setCharCount((value as string)?.length || 0);
      }
    }, [props?.defaultValue, value, showCharCount]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const inputValue = e.target.value;
      
      // Handle maximum character count if specified
      if (maxCharCount && inputValue.length > maxCharCount) {
        return;
      }

      setTriggerAutoSize(inputValue);
      
      // Update character count
      if (showCharCount) {
        setCharCount(inputValue.length);
      }

      onChange?.(e);
    };

    return (
      <div className={cn(
        "relative flex flex-col",
        disabled && "pointer-events-none" // Only apply pointer-events-none for disabled, not readonly
      )}>
        <div className="relative flex items-center w-full">
          {Icon && <Icon className={cn(
            "absolute left-1.5 top-2 h-5 w-5 text-muted-foreground",
            (disabled || readOnly) && "opacity-50"
          )} />}
          <textarea
            {...props}
            value={value}
            ref={textAreaRef}
            disabled={disabled}
            readOnly={readOnly}
            style={{ 
              resize: (disabled || readOnly || disableResize) ? 'none' : 'both',
              width: '100%',
              cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
              maxHeight: maxHeight !== Number.MAX_SAFE_INTEGER ? `${maxHeight}px` : undefined,
              maxWidth: maxWidth !== Number.MAX_SAFE_INTEGER ? `${maxWidth}px` : undefined,
            }}
            className={cn(
              'rounded-md border border-input bg-background px-3 py-2 text-md ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-primary',
              Icon ? 'ps-7' : 'px-3',
              disabled && "opacity-50 bg-muted",
              className,
            )}
            onChange={handleChange}
          />
        </div>
        {(showCharCount || maxCharCount) && (
          <div className={cn(
            "text-xs text-foreground flex justify-start mt-1",
            (disabled || readOnly) && "opacity-50"
          )}>
            {showCharCount && (
              <span>
                {charCount}{maxCharCount ? ` / ${maxCharCount}` : ''}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

AutosizeTextarea.displayName = 'AutosizeTextarea';

export default AutosizeTextarea;
