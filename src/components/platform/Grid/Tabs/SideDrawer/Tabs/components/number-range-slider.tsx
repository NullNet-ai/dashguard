import React, { useState, useEffect } from 'react';
import { Slider } from '~/components/ui/slider';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';

interface NumberRangeSliderProps {
  value?: [number, number];
  onChange: (range: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  showInputs?: boolean;
  showSlider?: boolean;
}

export function NumberRangeSlider({
  value = [0, 100],
  onChange,
  min = 0,
  max,
  step = 1,
  className,
  showInputs = true,
  showSlider = true,
}: NumberRangeSliderProps) {

  // Handle undefined values in the initial value array - no fallback defaults
  const safeValue: [number, number] = [
    typeof value[0] === 'number' ? value[0] : (min ?? 0),
    typeof value[1] === 'number' ? value[1] : (max ?? 0)
  ];
  
  const [localValue, setLocalValue] = useState<[number, number]>(safeValue);
  const [inputValues, setInputValues] = useState({
    min: value[0] !== undefined ? safeValue[0].toString() : '',
    max: value[1] !== undefined ? safeValue[1].toString() : '',
  });
  
  // Track validation state for visual feedback
  const [isInvalid, setIsInvalid] = useState(false);
  const [showErrorBubble, setShowErrorBubble] = useState(false);

  // Use infinite max when max is undefined
  const effectiveMax = max ?? Number.MAX_SAFE_INTEGER;
  const hasMaxLimit = max !== undefined;

  useEffect(() => {
    // Only update if the value prop actually changed (not on every render)
    const safePropValue: [number, number] = [
      typeof value[0] === 'number' ? value[0] : (min ?? 0),
      typeof value[1] === 'number' ? value[1] : (max ?? 0)
    ];
    
    // Only update if values actually changed to prevent overwriting user input
    if (safePropValue[0] !== localValue[0] || safePropValue[1] !== localValue[1]) {
      setLocalValue(safePropValue);
      setInputValues({
        min: value[0] !== undefined ? safePropValue[0].toString() : '',
        max: value[1] !== undefined ? safePropValue[1].toString() : '',
      });
    }
  }, [value, min, max]); // Remove localValue from dependency to prevent infinite loops

  const handleSliderChange = (newValue: number[]) => {
    const range: [number, number] = [newValue[0] || min, newValue[1] || effectiveMax];
    setLocalValue(range);
    setInputValues({
      min: range[0].toString(),
      max: range[1].toString(),
    });
    onChange(range);
  };

  const handleInputChange = (type: 'min' | 'max', inputValue: string) => {
    // Always update the input display value
    setInputValues(prev => ({ ...prev, [type]: inputValue }));
    
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      let newRange: [number, number];
      
      if (type === 'min') {
        newRange = [numValue, localValue[1]];
      } else {
        newRange = [localValue[0], numValue];
      }
      
      // Check if range is invalid for visual feedback
      const isRangeInvalid = newRange[0] > newRange[1];
      setIsInvalid(isRangeInvalid);
      
      // Show error bubble if range becomes invalid
      if (isRangeInvalid && !isInvalid) {
        setShowErrorBubble(true);
        // Auto-hide bubble after 3 seconds
        setTimeout(() => setShowErrorBubble(false), 3000);
      }
      
      setLocalValue(newRange);
      onChange(newRange);
    }
  };

  const handleInputBlur = (type: 'min' | 'max') => {
    // On blur, enforce the limits and sync with actual values
    const currentInputValue = inputValues[type];
    const numValue = parseFloat(currentInputValue);
    
    if (currentInputValue === '' || isNaN(numValue)) {
      // If empty or invalid, restore the current localValue
      setInputValues(prev => ({
        ...prev,
        [type]: type === 'min' ? localValue[0].toString() : localValue[1].toString()
      }));
      setIsInvalid(false);
    } else {
      let newRange: [number, number] = [localValue[0], localValue[1]];
      
      if (type === 'min') {
        // Clamp min to bounds
        const clampedMin = Math.max(min, Math.min(numValue, hasMaxLimit ? effectiveMax : numValue));
        newRange = [clampedMin, localValue[1]];
        
        // If min > max, adjust max to equal min (preserve user's min intent)
        if (clampedMin > localValue[1]) {
          newRange = [clampedMin, clampedMin];
        }
      } else {
        // Clamp max to bounds
        const clampedMax = hasMaxLimit ? Math.min(effectiveMax, Math.max(numValue, min)) : Math.max(numValue, min);
        newRange = [localValue[0], clampedMax];
        
        // If max < min, adjust min to equal max (preserve user's max intent)
        if (clampedMax < localValue[0]) {
          newRange = [clampedMax, clampedMax];
        }
      }
      
      // Update both the input display and the actual values
      setInputValues({
        min: newRange[0].toString(),
        max: newRange[1].toString()
      });
      
      setLocalValue(newRange);
      onChange(newRange);
      setIsInvalid(false);
      setShowErrorBubble(false);
    }
  };

  const formatLabel = (val: number | undefined) => {
    if (val === undefined) return '';
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {showSlider && (
        <div className="px-2">
          <Slider
            value={localValue}
            onValueChange={handleSliderChange}
            min={min}
            max={effectiveMax}
            step={step}
            className="w-full"
            label={formatLabel}
            labelPosition="top"
          />
        </div>
      )}
      
      {showInputs && (
        <div className="space-y-2 relative">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="number"
                value={inputValues.min}
                onChange={(e) => handleInputChange('min', e.target.value)}
                onBlur={() => handleInputBlur('min')}
                placeholder=""
                className={cn("text-center", isInvalid && "border-red-500 focus:border-red-500")}
                min={min}
                max={hasMaxLimit ? effectiveMax : undefined}
              />
            </div>
            <span className="text-muted-foreground">to</span>
            <div className="flex-1">
              <Input
                type="number"
                value={inputValues.max}
                onChange={(e) => handleInputChange('max', e.target.value)}
                onBlur={() => handleInputBlur('max')}
                placeholder=""
                className={cn("text-center", isInvalid && "border-red-500 focus:border-red-500")}
                min={min}
                max={hasMaxLimit ? effectiveMax : undefined}
              />
            </div>
          </div>
          {/* Error bubble - positioned outside the flex container */}
          {showErrorBubble && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 z-[9999] w-max">
              <div className="bg-red-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg relative">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45"></div>
                Maximum value must be greater than or equal to minimum value
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}