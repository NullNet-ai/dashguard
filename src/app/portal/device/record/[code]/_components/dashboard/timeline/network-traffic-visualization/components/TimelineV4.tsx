import React, { useMemo, useState, useEffect } from 'react';
import { useEventEmitter } from '~/context/EventEmitterProvider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { FlagIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Skeleton } from '~/components/ui/skeleton';

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
  const eventEmitter = useEventEmitter();
  const [inlineFilter, setInlineFilter] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    top_traffic: true,
    recent_ip: true,
  });
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    const handleLoading = (loading: boolean) => {
      setIsLoading(Boolean(loading));
    };
    eventEmitter.on('timeline_loading', handleLoading);
    return () => {
      eventEmitter.off('timeline_loading', handleLoading);
    };
  }, [eventEmitter]);

  const sections = useMemo(() => {
    const pairs = (flowData || []).map((fd: any, i: number) => ({ flow: fd, row: (formatted || [])[i] }));
    const q = (inlineFilter || '').toLowerCase();
    const filtered = q
      ? pairs.filter((p: { flow: any; row: any }) =>
          String(p?.flow?.source_ip || '').toLowerCase().includes(q),
        )
      : pairs;

    // Top Traffic: top 5 by total_active_packets, then total_bandwidth as tiebreaker
    const topTraffic = [...filtered]
      .sort((a: any, b: any) => {
        const pA = Number(a?.flow?.total_active_packets) || 0;
        const pB = Number(b?.flow?.total_active_packets) || 0;
        if (pB !== pA) return pB - pA;
        const bwA = Number(a?.flow?.total_bandwidth) || 0;
        const bwB = Number(b?.flow?.total_bandwidth) || 0;
        return bwB - bwA;
      })
      .slice(0, 5);

    // Recent IP: first 10, with sort logic applied
    let recentIP = filtered.slice(0, 10);
    if (sortKey) {
      recentIP = [...recentIP].sort((a: any, b: any) => {
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
    }

    return [
      { key: 'top_traffic', label: 'Top Traffic', rows: topTraffic },
      { key: 'recent_ip', label: 'Recent IP', rows: recentIP },
    ];
  }, [flowData, formatted, inlineFilter, sortKey]);

  const maxBandwidth = useMemo(() => {
    let max = 0;
    for (const section of sections) {
      for (const pair of section.rows) {
        for (const cell of pair.row || []) {
          const bw = Number(cell?.bandwidth) || 0;
          if (bw > max) max = bw;
        }
      }
    }
    return max;
  }, [sections]);

  const hasAnyRows = sections.some((s) => s.rows.length > 0);
  if (!hasAnyRows || !formatted?.[0]?.length) return null;

  const colCount = formatted[0].length;

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderRow = (pair: any, rowKey: string | number) => {
    const rowData = pair.row ?? [];
    return (
      <div
        key={rowKey}
        className="grid"
        style={{
          gridTemplateColumns: `250px repeat(${colCount}, minmax(0, 1fr))`,
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
                {pair.flow?.active && pair.flow?.lastBandwidth && (
                  <div>
                    <strong>New Bandwidth:</strong>{' '}
                    {pair.flow?.lastBandwidth}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {Array(colCount)
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
                        backgroundColor: getColorForValue(bw, maxBandwidth),
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
  };

  return (
    <TooltipProvider>
      <div className="h-[calc(100vh-280px)] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4 p-2">
            {['Top Traffic', 'Recent IP'].map((label, sIdx) => (
              <div key={sIdx}>
                <div className="sticky top-0 z-10 w-full px-2 py-1">
                  <Skeleton className="h-6 w-40" />
                </div>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid"
                    style={{ gridTemplateColumns: `250px repeat(${Math.min(colCount || 20, 20)}, minmax(0, 1fr))` }}
                  >
                    <div className="flex items-center gap-2 pl-2 py-1 border-b border-r border-slate-100">
                      <Skeleton className="h-4 w-28" />
                    </div>
                    {Array.from({ length: Math.min(colCount || 20, 20) }).map((__, j) => (
                      <div key={j} className="border-b border-dotted border-slate-100 flex items-center justify-center w-full">
                        <Skeleton className="w-full" style={{ height: BW_SIZE }} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          sections.map((section, i) => (
            <div key={section.key}>
              <button
                className={`w-full flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-50 border-[1px] border-slate-200 hover:bg-slate-100 sticky top-0 z-10 ${i === 1 ? '-mt-[1px]' : ''}`}
                onClick={() => toggleSection(section.key)}
              >
                {expandedSections[section.key]
                  ? <ChevronDownIcon className="size-3.5 shrink-0" />
                  : <ChevronRightIcon className="size-3.5 shrink-0" />}
                {section.label}
              </button>

              {expandedSections[section.key] &&
                section.rows.map((pair: any, i: number) =>
                  renderRow(pair, `${section.key}-${i}`),
                )}
            </div>
          ))
        )}
      </div>
    </TooltipProvider>
  );
}
