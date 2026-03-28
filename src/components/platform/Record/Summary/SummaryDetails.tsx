import * as React from 'react';
import { CardComponent as Card } from '~/components/ui/card/index';
import { testIDFormatter } from '~/utils/formatter';
import { Separator } from '~/components/ui/separator';
import { truncate } from 'lodash';
import { cn } from '~/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';

interface SummaryFieldItem {
  key: string;
  value: string;
  customValue?:
    | ((data: any) => React.ReactNode)
    | (({ value }: { value: string }) => React.ReactNode);
  className?: string;
  truncated?: () => {
    string_limit?: number;
    path: string[];
  };
}

interface SummaryDetailsCardProps {
  header_title?: string;
  items?: SummaryFieldItem[];
  className?: string;
  data?: any;
  scrollable?: boolean;
  maxHeight?: number | string;
}

interface SummaryDetailsProps {
  config: SummaryDetailsCardProps | SummaryDetailsCardProps[];
  data?: any;
}

function SummaryFieldRow({
  item,
  data,
}: {
  item: SummaryFieldItem;
  data?: any;
}) {
  const { key, value = '', customValue, truncated, className } = item;

  const { string_limit = 30, path = [] } = truncated?.() || {};

  const shouldTruncateKey = path.includes('key');
  const shouldTruncateValue =
    path.includes('value') || (!path.length && typeof value === 'string');

  const displayKey = shouldTruncateKey
    ? truncate(key, { length: string_limit })
    : key;

  const rawValue = customValue
    ? data
      ? customValue(data)
      : customValue({ value })
    : data && typeof value === 'string' && value in data
      ? data[value] || 'None'
      : value || 'None';

  const isValueTruncated =
    typeof rawValue === 'string' &&
    shouldTruncateValue &&
    rawValue.length >= string_limit;
  const displayValue =
    typeof rawValue === 'string' && shouldTruncateValue
      ? truncate(rawValue, { length: string_limit })
      : rawValue;

  const baseTestId = testIDFormatter(`rcrd-sum-details-${value}`);

  return (
    <div
      className={cn('flex justify-between gap-2 text-sm', className)}
      data-test-id={baseTestId}
    >
      {displayKey && (
        <span
          className="whitespace-nowrap text-slate-500"
          data-test-id={`${baseTestId}-label`}
        >
          {displayKey}&nbsp;
        </span>
      )}
      {isValueTruncated ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="break-all text-slate-700"
                data-test-id={`${baseTestId}-value`}
              >
                {displayValue}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xl" side="top" align="start">
              <p>{rawValue}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span
          className="break-all text-slate-700"
          data-test-id={`${baseTestId}-value`}
        >
          {displayValue}
        </span>
      )}
    </div>
  );
}

function SummaryDetailsCard({
  header_title,
  items = [],
  className,
  data,
  scrollable,
  maxHeight,
}: SummaryDetailsCardProps) {
  const contentMaxHeight =
    typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight || '16rem';
  return (
    <Card
      className={className}
      data-test-id={testIDFormatter('rcrd-sum-details-container')}
    >
      <div className={cn('flex flex-col gap-1 py-3', scrollable ? 'h-auto' : undefined)}>
        {header_title && (
          <p className="text-md font-medium text-foreground px-3">{header_title}</p>
        )}
        <span className='px-3'>
          <Separator
            data-test-id={testIDFormatter('rcrd-sum-details-separator')}
          />
        </span>
        {scrollable ? (
          <div className="flex flex-col gap-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pl-3 pr-1" style={{ maxHeight: contentMaxHeight }}>
            {items.map((item, index) => (
              <SummaryFieldRow
                key={`${item.key}-${index}`}
                item={item}
                data={data}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1 px-3">
            {items.map((item, index) => (
              <SummaryFieldRow
                key={`${item.key}-${index}`}
                item={item}
                data={data}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function SummaryDetails({ config, data }: SummaryDetailsProps) {
  const configs = Array.isArray(config) ? config : [config];

  return (
    <div className="flex flex-col gap-2">
      {configs.map((cfg, index) => (
        <SummaryDetailsCard
          key={`summary-details-${index}`}
          {...cfg}
          data={data}
        />
      ))}
    </div>
  );
}
