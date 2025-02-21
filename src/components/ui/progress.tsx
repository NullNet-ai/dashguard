'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '~/lib/utils';

interface ProgressProps {
  type?: 'linear' | 'radial';
  value: number;
  min?: number;
  max?: number;
  maxLimit?: number;
  primaryColor?: string;
  secondaryColor?: string;
  showLabel?: boolean;
  label?: string | React.ReactNode | ((percentage: number) => React.ReactNode);
  labelColor?: string;
  labelPosition?: 'start' | 'start-outside' | 'follow' | 'end' | 'end-outside';
  colorThresholds?: { percentage: number; color: string; textColor?: string }[];
  className?: string;
}

const Progress = ({
  type = 'linear',
  value,
  min = 0,
  max = 100,
  maxLimit,
  primaryColor = '#3b82f6',
  secondaryColor = '#e2e8f0',
  showLabel = true,
  label,
  labelColor = 'white',
  labelPosition = 'end',
  colorThresholds,
  className,
}: ProgressProps) => {
  const rawPercentage = max > min ? ((value - min) / (max - min)) * 100 : 0;
  let percentage = Math.min(rawPercentage, maxLimit ?? 100);
  percentage = Math.max(percentage, 0);

  let currentColor = primaryColor;
  let currentTextColor = labelColor !== 'white' ? labelColor : type === 'linear' ? 'white' : 'black';
  
  if (colorThresholds?.length) {
    const sorted = [...colorThresholds].sort((a, b) => a.percentage - b.percentage);
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i] && percentage >= sorted[i]!.percentage) {
        currentColor = sorted[i]!.color;
        if (sorted[i]!.textColor) {
          currentTextColor = sorted[i]!.textColor ?? labelColor;
        }
        break;
      }
    }
  }

  const labelContent = showLabel ? (
    typeof label === 'function' ? label(percentage) : label ?? `${Math.round(percentage)}%`
  ) : null;

  if (type === 'radial') {
    return (
      <AnimatedCircularProgressBar
        className={className}
        value={percentage}
        min={0}
        max={100}
        gaugePrimaryColor={currentColor}
        gaugeSecondaryColor={secondaryColor}
        label={labelContent}
        textColor={currentTextColor}
      />
    );
  }

  return (
    <LinearProgress
      className={className}
      value={percentage}
      label={labelContent}
      labelPosition={labelPosition}
      primaryColor={currentColor}
      secondaryColor={secondaryColor}
      labelColor={currentTextColor}
    />
  );
};

export { Progress };

interface LinearProgressProps {
  className?: string;
  value: number;
  label?: React.ReactNode;
  labelPosition?: 'start' | 'start-outside' | 'follow' | 'end' | 'end-outside';
  primaryColor: string;
  secondaryColor: string;
  labelColor?: string;
}

const LinearProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  LinearProgressProps
>(({ className, value, label, labelPosition = 'end', primaryColor, secondaryColor, labelColor }, ref) => {
  return (
    <div className="flex items-center gap-2">
      {labelPosition === 'start-outside' && (
        <span style={{ color: labelColor }}>{label}</span>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn('relative h-5 w-full overflow-hidden rounded-full', className)}
        style={{ backgroundColor: secondaryColor }}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 transition-all"
          style={{
            backgroundColor: primaryColor,
            transform: `translateX(-${100 - (value || 0)}%)`,
          }}
        >
          {labelPosition === 'follow' && (
            <span className="flex items-center justify-end px-4" style={{ color: labelColor }}>
              {label}
            </span>
          )}
        </ProgressPrimitive.Indicator>
        {(labelPosition === 'start' || labelPosition === 'end') && (
          <span
            className={cn(
              'absolute inset-0 flex items-center px-4',
              labelPosition === 'start' ? 'justify-start' : 'justify-end'
            )}
            style={{ color: labelColor }}
          >
            {label}
          </span>
        )}
      </ProgressPrimitive.Root>
      {labelPosition === 'end-outside' && (
        <span style={{ color: labelColor }}>{label}</span>
      )}
    </div>
  );
});
LinearProgress.displayName = 'LinearProgress';

interface RadialProgressProps {
  className?: string;
  value: number;
  min: number;
  max: number;
  gaugePrimaryColor: string;
  gaugeSecondaryColor: string;
  label?: React.ReactNode;
  textColor?: string;
}

const AnimatedCircularProgressBar = ({
  className,
  value,
  min = 0,
  max = 100,
  gaugePrimaryColor,
  gaugeSecondaryColor,
  label,
  textColor = '#000000',
}: RadialProgressProps) => {
  const circumference = 2 * Math.PI * 45;
  const currentPercent = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("relative size-40 text-2xl font-semibold", className)}>
      <svg fill="none" className="size-full" strokeWidth="10" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={gaugeSecondaryColor}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={0}
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={gaugePrimaryColor}
          strokeDasharray={`${(currentPercent / 100) * circumference} ${circumference}`}
          strokeDashoffset={0}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke 0.5s ease' }}
        />
      </svg>
      <span 
        className="absolute inset-0 flex items-center justify-center"
        style={{ color: textColor }}
      >
        {label ?? Math.round(currentPercent)}
      </span>
    </div>
  );
};