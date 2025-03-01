'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '~/lib/utils';

interface BaseProgressProps {
  value: number;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  maxLimit?: number;
  primaryColor?: string;
  secondaryColor?: string;
  showLabel?: boolean;
  label?: string | React.ReactNode | ((percentage: number) => React.ReactNode);
  colorThresholds?: { percentage: number; color: string }[];
  className?: string;
}

interface LinearProgressConfig extends BaseProgressProps {
  type?: 'linear';
  labelPosition?: 'start' | 'start-outside' | 'follow' | 'end' | 'end-outside';
  labelColor?: string;
}

interface RadialProgressConfig extends BaseProgressProps {
  type: 'radial';
  labelPosition?: 'center' | 'inside' | 'outside';
  textColor?: string;
}

type ProgressProps = LinearProgressConfig | RadialProgressConfig;

const Progress = (props: ProgressProps) => {
  const {
    type = 'linear',
    value,
    min = 0,
    max = 100,
    maxLimit,
    primaryColor = '#3b82f6',
    secondaryColor = '#e2e8f0',
    showLabel = true,
    label,
    colorThresholds,
    className,
    size,
  } = props;

  const labelPosition = type === 'radial' 
    ? (props as RadialProgressConfig).labelPosition ?? 'center'
    : (props as LinearProgressConfig).labelPosition ?? 'end';

  const labelColor = type === 'linear' 
    ? (props as LinearProgressConfig).labelColor ?? 'white'
    : undefined;

  const textColor = type === 'radial'
    ? (props as RadialProgressConfig).textColor ?? 'black'
    : undefined;

  const rawPercentage = max > min ? ((value - min) / (max - min)) * 100 : 0;
  let percentage = Math.min(rawPercentage, maxLimit ?? 100);
  percentage = Math.max(percentage, 0);

  let currentColor = primaryColor;
  if (colorThresholds?.length) {
    const sorted = [...colorThresholds].sort((a, b) => a.percentage - b.percentage);
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (percentage >= (sorted[i]?.percentage ?? -1)) {
        currentColor = sorted[i]?.color ?? primaryColor;
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
        textColor={textColor}
        labelPosition={labelPosition as RadialProgressConfig['labelPosition']}
        showLabel={showLabel}
        size={size ?? 'lg'}
      />
    );
  }

  return (
    <LinearProgress
      className={className}
      value={percentage}
      label={labelContent}
      labelPosition={labelPosition as LinearProgressConfig['labelPosition']}
      primaryColor={currentColor}
      secondaryColor={secondaryColor}
      labelColor={labelColor}
      size={size ?? "md"}
    />
  );
};

interface LinearProgressProps {
  className?: string;
  value: number;
  label?: React.ReactNode;
  labelPosition?: 'start' | 'start-outside' | 'follow' | 'end' | 'end-outside';
  primaryColor: string;
  secondaryColor: string;
  labelColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LinearProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  LinearProgressProps
>(({ className, value, label, labelPosition = 'end', primaryColor, secondaryColor, labelColor,  size = 'md',  }, ref) => {
  const linearSizes = {
    sm: { root: 'h-4', label: 'text-sm' },
    md: { root: 'h-5', label: 'text-md' },
    lg: { root: 'h-8', label: 'text-lg' },
  }[size];
  return (
    <div className="flex items-center gap-2">
      {labelPosition === 'start-outside' && <span style={{ color: labelColor }} className='text-md'>{label}</span>}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn('relative h-5 w-full overflow-hidden rounded-full', linearSizes.root,className)}
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
            <span className={cn("flex items-center justify-end px-4",linearSizes.label)} style={{ color: labelColor }}>
              {label}
            </span>
          )}
        </ProgressPrimitive.Indicator>
        {(labelPosition === 'start' || labelPosition === 'end') && (
          <span
            className={cn(
              'absolute inset-0 flex items-center px-4 ',
              labelPosition === 'start' ? 'justify-start' : 'justify-end',
              linearSizes.label
            )}
            style={{ color: labelColor }}
          >
            {label}
          </span>
        )}
      </ProgressPrimitive.Root>
      {labelPosition === 'end-outside' && <span style={{ color: labelColor }} className={cn(linearSizes.label)}>{label}</span>}
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
  labelPosition?: 'center' | 'inside' | 'outside';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AnimatedCircularProgressBar = ({
  className,
  value,
  size='lg',
  min = 0,
  max = 100,
  gaugePrimaryColor,
  gaugeSecondaryColor,
  label,
  textColor = '#000000',
  showLabel = true,
}: RadialProgressProps) => {
  const circumference = 2 * Math.PI * 45;
  const currentPercent = ((value - min) / (max - min)) * 100;
  const radialSizes = {
    sm: { container: 'size-16', label: 'text-md' },
    md: { container: 'size-24', label: 'text-xl' },
    lg: { container: 'size-32', label: 'text-2xl' },
  }[size];

  return (
    <div className={cn("relative size-40  font-semibold",radialSizes.container, className)}>
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
      {showLabel && (
        <span 
          className={cn("absolute inset-0 flex items-center justify-center",radialSizes.label)}
          style={{ color: textColor }}
        >
          {label ?? Math.round(currentPercent)}
        </span>
      )}
    </div>
  );
};

export { Progress };