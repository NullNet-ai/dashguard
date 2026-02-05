import React, { useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { FlagIcon } from '@heroicons/react/20/solid';

const COLUMN_COUNT = 60;
const BW_SIZE = 18;

function truncateIP(ip: string, maxLength = 23) {
  if (!ip || ip.length <= maxLength) return ip;
  return ip.slice(0, maxLength - 3) + '...';
}

function getColorForValue(value: number, maxBandwidth: number) {
  if (!value || value <= 0) return '#fff';
  const range = maxBandwidth / 3;
  if (value >= maxBandwidth) return '#00364b';
  if (value > 2 * range) return '#1d576e';
  if (value > range) return '#325e6f';
  return '#556971';
}

export default function GridVirtualizerFixed(props: any) {
  const { flowData, formatted } = props;
  const parentRef = React.useRef<HTMLDivElement | null>(null);


  const rowVirtualizer = useVirtualizer({
    count: formatted?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 25,
    overscan: 5, // slightly higher = smoother fast scroll
  });

  const rowMeta = useMemo(() => {
    return (formatted ?? []).map((row: any[]) => {
      let maxBandwidth = 0;
      let lastValueIndex: number | null = null;

      for (let i = 0; i < row.length; i++) {
        const bw = Number(row[i]?.bandwidth) || 0;
        if (bw > maxBandwidth) maxBandwidth = bw;
        if (bw > 0) lastValueIndex = i;
      }

      return { maxBandwidth, lastValueIndex };
    });
  }, [formatted]);

  if (!formatted?.length) return null;

  return (
    <TooltipProvider>
      <div
        ref={parentRef}
        className="rounded-md border border-slate-100 h-[502px] overflow-hidden"
        style={{ willChange: 'transform' }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowIndex = virtualRow.index;
          const rowData = formatted[rowIndex] ?? [];
          const meta = rowMeta[rowIndex];

          return (
            <div
              key={virtualRow.key}
              className="grid grid-cols-[180px_repeat(60,minmax(0,1fr))]"
              style={{ height: virtualRow.size }}
            >

              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger>
              <div className="flex items-center gap-2 pl-1 text-xs bg-slate-50 border-y border-slate-100">
                {flowData?.[rowIndex]?.flag ? (
                  flowData[rowIndex].flag === '/unknown-flag.svg' ? (
                    <div className="flex h-[15px] min-w-[30px] items-center justify-center bg-[#efefef]">
                      <FlagIcon className="size-2.5" />
                    </div>
                  ) : (
                    <img
                      src={flowData[rowIndex].flag}
                      alt="Flag"
                      className="h-[15px] min-w-[30px]"
                    />
                  )
                ) : null}

                <span
                  className={
                    flowData?.[rowIndex]?.active || flowData?.[rowIndex]?.isNew
                      ? 'text-red-600'
                      : 'text-black'
                  }
                >
                  {truncateIP(flowData?.[rowIndex]?.source_ip || '')}
                </span>
              </div>
              </TooltipTrigger>
                                          <TooltipContent side="top">
                                            <div className="text-sm">
                                              <div>
                                                <strong>Country:</strong>{' '}
                                                {flowData?.[virtualRow.index]?.name}
                                              </div>
                                              <div>
                                                <strong>Source IP:</strong>{' '}
                                                {flowData?.[virtualRow.index]?.source_ip}
                                              </div>
                                              {flowData?.[virtualRow.index]?.active &&
                                                flowData?.[virtualRow.index]?.lastBandwidth && (
                                                  <div>
                                                    <strong>New Bandwidth:</strong>{' '}
                                                    {flowData?.[virtualRow.index]?.lastBandwidth}
                                                  </div>
                                                )}
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>


              {Array(COLUMN_COUNT)
                .fill(0)
                .map((_, colIndex) => {
                  const cell = rowData[colIndex];
                  const bw = Number(cell?.bandwidth) || 0;

                  return (
                    <div
                      key={colIndex}
                      className="border-y border-slate-100 flex items-center justify-center"
                    >
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger>
                          <div
                            className="shrink-0"
                            style={{
                              width: BW_SIZE,
                              height: BW_SIZE,
                              backgroundColor: getColorForValue(
                                bw,
                                meta.maxBandwidth,
                              ),
                            }}
                          />
                        </TooltipTrigger>

                        {cell && (
                          <TooltipContent side="top" className="z-[9999]">
                            <div className="text-xs">
                              <div>
                                <strong>Time:</strong>{' '}
                                {cell.bucketTime ?? cell.time}
                              </div>
                              <div>
                                <strong>Bandwidth:</strong>{' '}
                                {bw > 1024
                                  ? (bw / 1024).toFixed(2) + ' KB'
                                  : bw + ' bytes'}
                              </div>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
