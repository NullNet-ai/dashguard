'use client';
import * as React from 'react';
import { cn } from '~/lib/utils';
import { useImperativeHandle } from 'react';

interface UseAutosizeTextAreaProps {
  textAreaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  minHeight?: number;
  maxHeight?: number;
  triggerAutoSize: string;
  maxLines?: number;
  lineWrapping?: boolean;
}

export const useAutosizeTextArea = ({
  textAreaRef,
  triggerAutoSize,
  maxHeight = Number.MAX_SAFE_INTEGER,
  minHeight = 0,
  maxLines,
  lineWrapping = true,
}: UseAutosizeTextAreaProps) => {
  const [init, setInit] = React.useState(true);
  
  React.useEffect(() => {
    const offsetBorder = 6;
    const textAreaElement = textAreaRef.current;
    if (textAreaElement) {
      // Initial setup
      if (init) {
        textAreaElement.style.minHeight = `${minHeight + offsetBorder}px`;
        if (maxHeight > minHeight) {
          textAreaElement.style.maxHeight = `${maxHeight}px`;
        }
        
        // Configure line wrapping
        textAreaElement.style.overflowWrap = lineWrapping ? 'break-word' : 'normal';
        textAreaElement.style.wordWrap = lineWrapping ? 'break-word' : 'normal';

        setInit(false);
      }

      // Reset height to calculate actual scroll height
      textAreaElement.style.height = `${minHeight + offsetBorder}px`;
      const scrollHeight = textAreaElement.scrollHeight;
      
      // Handle max height and line limit
      if (maxLines) {
        const lineHeight = parseInt(window.getComputedStyle(textAreaElement).lineHeight);
        const maxLinesHeight = lineHeight * maxLines;
        
        if (scrollHeight > maxLinesHeight) {
          textAreaElement.style.height = `${maxLinesHeight + offsetBorder}px`;
          textAreaElement.style.overflow = 'auto';
        } else {
          textAreaElement.style.height = `${scrollHeight + offsetBorder}px`;
          textAreaElement.style.overflow = 'hidden';
        }
      } else if (scrollHeight > maxHeight) {
        textAreaElement.style.height = `${maxHeight}px`;
        textAreaElement.style.overflow = 'auto';
      } else {
        textAreaElement.style.height = `${scrollHeight + offsetBorder}px`;
        textAreaElement.style.overflow = 'hidden';
      }
    }
  }, [triggerAutoSize, maxLines, lineWrapping, textAreaRef, init, minHeight, maxHeight]);
};


export type AutosizeTextAreaRef = {
  textArea: HTMLTextAreaElement;
  maxHeight: number;
  minHeight: number;
  focus: () => void;
};

type AutosizeTextAreaProps = {
  maxHeight?: number;
  minHeight?: number;
  icon?: React.ElementType;
  maxLines?: number;
  lineWrapping?: boolean;
  showCharCount?: boolean;
  maxCharCount?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const AutosizeTextarea = React.forwardRef<AutosizeTextAreaRef, AutosizeTextAreaProps>(
  (
    {
      maxHeight = Number.MAX_SAFE_INTEGER,
      minHeight = 3,
      className,
      onChange,
      value,
      icon: Icon,
      maxLines,
      lineWrapping = true,
      showCharCount = false,
      maxCharCount,
      ...props
    }: AutosizeTextAreaProps,
    ref: React.Ref<AutosizeTextAreaRef>,
  ) => {
    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [triggerAutoSize, setTriggerAutoSize] = React.useState('');
    const [charCount, setCharCount] = React.useState(0);

    useAutosizeTextArea({
      textAreaRef,
      triggerAutoSize: triggerAutoSize,
      maxHeight,
      minHeight,
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
      <div className="relative flex flex-col">
        <div className="relative flex items-center">
          {Icon && <Icon className="absolute left-1.5 top-2 h-5 w-5 text-muted-foreground" />}
          <textarea
            {...props}
            value={value}
            ref={textAreaRef}
            className={cn(
              'flex w-full rounded-md border border-input bg-background px-3 py-2 text-md ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted ',
              Icon ? 'ps-7' : 'px-3',
              className,
            )}
            onChange={handleChange}
          />
        </div>
        {(showCharCount || maxCharCount) && (
          <div className="text-xs text-muted-foreground flex justify-start mt-1">
            {showCharCount && (
              <span >
                {charCount}{maxCharCount ? ` / ${maxCharCount}` : ''}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

AutosizeTextarea.displayName = 'AutosizeTextarea';

export default AutosizeTextarea;