import React, { useMemo, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEventEmitter } from '~/context/EventEmitterProvider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { FlagIcon } from '@heroicons/react/20/solid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

const BW_SIZE = 18;

function truncateIP(ip: string, maxLength = 25) {
  if (!ip || ip.length <= maxLength) return ip;
  return ip.slice(0, maxLength - 3) + '...';
}

function getColorForValue(value: number, maxBandwidth: number) {
  if (!value || value <= 0) return '#fff';
  if (!maxBandwidth || maxBandwidth <= 0) return '#65A1C7';

  const HIGH = '#3F5F7E';
  const MEDIUM = '#B4D3ED';
  const LOW = '#65A1C7';

  const ratio = value / maxBandwidth;

  if (ratio >= 1) return HIGH;
  if (ratio > 2 / 3) return MEDIUM;
  return LOW;
}

export default function GridVirtualizerFixed(props: any) {
  const { flowData, formatted } = props;
  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const eventEmitter = useEventEmitter();
  const [inlineFilter, setInlineFilter] = useState('');
  const [sortKey, setSortKey] = useState<string>('');

  useEffect(() => {
    const handleInlineFilter = (filter: string) => {
      setInlineFilter(filter);
    };

    eventEmitter.on('timeline_inline_filter', handleInlineFilter);
    return () => {
      eventEmitter.off('timeline_inline_filter', handleInlineFilter);
    };
  }, [eventEmitter]);

  useEffect(() => {
    const handleSortKey = (key: string) => {
      setSortKey(key);
    };
    eventEmitter.on('timeline_sort_key', handleSortKey);
    return () => {
      eventEmitter.off('timeline_sort_key', handleSortKey);
    };
  }, [eventEmitter]);

  const displayRows = useMemo(() => {
    const pairs = (flowData || []).map((fd: any, i: number) => ({ flow: fd, row: (formatted || [])[i] }));
    const q = (inlineFilter || '').toLowerCase();
    const filtered = q
      ? pairs.filter((p: { flow: any; row: any }) =>
          String(p?.flow?.source_ip || '').toLowerCase().includes(q),
        )
      : pairs;
    if (!sortKey) return filtered;
    const sorted = [...filtered].sort((a: any, b: any) => {
      if (sortKey === 'country') {
        const av = String(a?.flow?.name || '').toLowerCase();
        const bv = String(b?.flow?.name || '').toLowerCase();
        return av.localeCompare(bv);
      }
      if (sortKey === 'source_ip') {
        const av = String(a?.flow?.source_ip || '').toLowerCase();
        const bv = String(b?.flow?.source_ip || '').toLowerCase();
        return av.localeCompare(bv);
      }
      return 0;
    });
    return sorted;
  }, [flowData, formatted, inlineFilter, sortKey]);

  const rowVirtualizer = useVirtualizer({
    count: displayRows?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 25,
    overscan: 5, // slightly higher = smoother fast scroll
  });

  const maxBandwidth = useMemo(() => {
    let maxBandwidth = 0;

    for (const pair of displayRows ?? []) {
      for (let i = 0; i < pair.row.length; i++) {
        const bw = Number(pair.row[i]?.bandwidth) || 0;
        if (bw > maxBandwidth) maxBandwidth = bw;
      }
    }

    return maxBandwidth;
  }, [displayRows]);

  if (!displayRows?.length) return null;

  return (
    <TooltipProvider>
      <div
        ref={parentRef}
        className="h-[602px] overflow-hidden border-collapse border-y border-slate-100 pt-[2px]"
        style={{ willChange: 'transform' }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowIndex = virtualRow.index;
          const pair = displayRows[rowIndex] ?? { flow: null, row: [] };
          const rowData = pair.row ?? [];

          return (
            <div
              key={virtualRow.key}
              className="grid"
              style={{ 
                height: virtualRow.size ,
                gridTemplateColumns: `250px repeat(${formatted[0].length}, minmax(0, 1fr))`,
              }}
            >

              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2 pl-2 py-1 text-xs border-b border-r border-slate-100">
                      {pair.flow?.flag ? (
                        pair.flow.flag === '/unknown-flag.svg' ? (
                          <div className="flex h-[15px] min-w-[30px] items-center justify-center bg-[#efefef]">
                            <FlagIcon className="size-2.5" />
                          </div>
                        ) : (
                          <img
                            src={pair.flow.flag}
                            alt="Flag"
                            className="h-[15px] min-w-[30px]"
                          />
                        )
                      ) : null}

                      <span
                        className={
                          pair.flow?.active || pair.flow?.isNew
                            ? 'text-red-600'
                            : 'text-black'
                        }
                      >
                        {truncateIP(pair.flow?.source_ip || '')}
                      </span>
                    </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <div className="text-sm">
                        <div>
                          <strong>Country:</strong>{' '}
                          {pair.flow?.name}
                        </div>
                        <div>
                          <strong>Source IP:</strong>{' '}
                          {pair.flow?.source_ip}
                        </div>
                        {pair.flow?.active &&
                          pair.flow?.lastBandwidth && (
                            <div>
                              <strong>New Bandwidth:</strong>{' '}
                              {pair.flow?.lastBandwidth}
                            </div>
                          )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

              {Array(formatted[0].length)
                .fill(0)
                .map((_, colIndex) => {
                  const cell = rowData[colIndex];
                  const bw = Number(cell?.bandwidth) || 0;

                  return (
                    <div
                      key={colIndex}
                      className="border-b border-dotted border-slate-100 flex items-center justify-center w-full"
                    >
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger className="w-full">
                          <div
                            className="shrink-0 w-full"
                            style={{
                              height: BW_SIZE,
                              backgroundColor: getColorForValue(
                                bw,
                                maxBandwidth,
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
