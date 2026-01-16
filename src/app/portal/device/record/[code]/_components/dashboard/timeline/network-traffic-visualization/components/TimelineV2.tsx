import React, { useMemo } from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';

// import dummyTimeline from '../data/dummy_timeline';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { FlagIcon } from '@heroicons/react/20/solid'

export default function GridVirtualizerFixed(props: any) {
  let { flowData, formatted } = props;
  // formatted = dummyTimeline

  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const lastAutoScrollKeyRef = React.useRef<string | null>(null);
  const didInitAutoFocusRef = React.useRef(false);

  const enableFocusCurrentTime = false;
  const enableAutoFocusOnNewData = true;

  const rowVirtualizer = useVirtualizer({
    count: formatted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 20,
    overscan: 5,
  });

  function getMaxBandwidth(data: any[]) {
    let maxBandwidth = 0;
    if (!data) return 0;
    data.forEach((record: Record<string, any>) => {
      const bandwidth = parseInt(record?.bandwidth, 10);
      if (bandwidth > maxBandwidth) {
        maxBandwidth = bandwidth;
      }
    });
    return maxBandwidth;
  }

  function getColorForValue(value: number, maxBandwidth: number) {
    const range = maxBandwidth / 3;
    if (value === undefined || value <= 0) return '#fff';
    if (value >= maxBandwidth) return '#00364b';
    if (value > 2 * range) return '#1d576e';
    if (value > range) return '#325e6f';
    return '#556971';
  }

  function parseTimeMs(value: any) {
    if (value == null) return null;
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value < 1e12 ? value * 1000 : value;
    }
    const str = String(value).trim();
    if (!str) return null;

    const fullDateTimeMatch = str.match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/,
    );
    if (fullDateTimeMatch) {
      const y = fullDateTimeMatch[1]!;
      const mo = fullDateTimeMatch[2]!;
      const d = fullDateTimeMatch[3]!;
      const h = fullDateTimeMatch[4]!;
      const mi = fullDateTimeMatch[5]!;
      const s = fullDateTimeMatch[6]!;
      const ms = Date.UTC(
        parseInt(y, 10),
        parseInt(mo, 10) - 1,
        parseInt(d, 10),
        parseInt(h, 10),
        parseInt(mi, 10),
        parseInt(s, 10),
      );
      return Number.isNaN(ms) ? null : ms;
    }

    if (/^\d{2}:\d{2}:\d{2}$/.test(str)) {
      const now = new Date();
      const [h, m, s] = str.split(':').map((v) => parseInt(v, 10));
      const ms = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        h,
        m,
        s,
      );
      return Number.isNaN(ms) ? null : ms;
    }

    const d = new Date(str);
    if (!Number.isNaN(d.getTime())) return d.getTime();

    const n = Number(str);
    if (Number.isFinite(n)) return n < 1e12 ? n * 1000 : n;

    return null;
  }

  const timeAxisRow = useMemo(() => {
    const rows = Array.isArray(formatted) ? formatted : [];
    if (rows.length === 0) return [];

    const nowMs = Date.now();
    let bestRow = rows[0] ?? [];
    let bestScore = Number.POSITIVE_INFINITY;

    for (const row of rows) {
      if (!Array.isArray(row) || row.length === 0) continue;
      const hasBucketTime = row.some((v) => v && v.bucketTime != null);
      const timeKey = hasBucketTime ? 'bucketTime' : 'time';

      const startMs = parseTimeMs(row[0]?.[timeKey]);
      const endMs = parseTimeMs(row[row.length - 1]?.[timeKey]);
      if (startMs == null || endMs == null) continue;

      const min = Math.min(startMs, endMs);
      const max = Math.max(startMs, endMs);
      const score = nowMs < min ? min - nowMs : nowMs > max ? nowMs - max : 0;

      if (score < bestScore) {
        bestRow = row;
        bestScore = score;
        if (score === 0) break;
      }
    }

    return bestRow;
  }, [formatted]);

  const columnCount = (timeAxisRow?.length || 0) + 1;
  const lastAxisPoint = timeAxisRow?.[timeAxisRow.length - 1];
  const lastAxisStamp = lastAxisPoint?.bucketTime ?? lastAxisPoint?.time;
  
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: columnCount,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (index === 0 ? 200 : 15),
    overscan: 5,
  });

  function getCurrentTimeIndex(timeSeriesRow: any[]) {
    if (!timeSeriesRow || timeSeriesRow.length === 0) return null;
    const hasBucketTime = timeSeriesRow.some((v) => v && v.bucketTime != null);
    const timeKey = hasBucketTime ? 'bucketTime' : 'time';

    const first = String(timeSeriesRow[0]?.[timeKey] ?? '');
    const last = String(timeSeriesRow[timeSeriesRow.length - 1]?.[timeKey] ?? '');
    const secondsOnly =
      timeSeriesRow.length === 60 && /^\d{1,2}$/.test(first) && /^\d{1,2}$/.test(last);

    if (secondsOnly) return new Date().getUTCSeconds();

    const nowMs = Date.now();
    let bestIndex = timeSeriesRow.length - 1;
    let bestDiff = Number.POSITIVE_INFINITY;
    for (let i = 0; i < timeSeriesRow.length; i++) {
      const ms = parseTimeMs(timeSeriesRow[i]?.[timeKey]);
      if (ms == null) continue;
      const diff = Math.abs(ms - nowMs);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIndex = i;
      }
    }
    return bestIndex;
  }

  function isColumnIndexVisible(columnIndex: number) {
    const items = columnVirtualizer.getVirtualItems();
    const start = items[0]?.index;
    const end = items[items.length - 1]?.index;
    if (start == null || end == null) return false;
    return columnIndex >= start && columnIndex <= end;
  }

  function focusCurrentTime() {
    if (!formatted || formatted.length === 0) return;
    if (!parentRef.current) return;

    const timeIndex = getCurrentTimeIndex(timeAxisRow);
    if (timeIndex == null) return;

    const columnIndex = Math.max(1, Math.min(timeIndex + 1, columnCount - 1));
    if (isColumnIndexVisible(columnIndex)) return;

    columnVirtualizer.scrollToIndex(columnIndex, { align: 'center' });
  }

  function focusRightMost() {
    if (!formatted || formatted.length === 0) return;
    if (!parentRef.current) return;
    if (columnCount <= 1) return;
    columnVirtualizer.scrollToIndex(columnCount - 1, { align: 'end' });
  }

  React.useLayoutEffect(() => {
    const autoScrollKey = `${columnCount}:${String(lastAxisStamp ?? '')}`;

    if (!didInitAutoFocusRef.current) {
      didInitAutoFocusRef.current = true;
      lastAutoScrollKeyRef.current = autoScrollKey;
      return;
    }

    if (!enableAutoFocusOnNewData) return;
    if (lastAutoScrollKeyRef.current === autoScrollKey) return;
    lastAutoScrollKeyRef.current = autoScrollKey;

    const raf = requestAnimationFrame(() => {
      if (enableFocusCurrentTime) {
        focusCurrentTime();
      } else {
        focusRightMost();
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [columnCount, lastAxisStamp, enableAutoFocusOnNewData, enableFocusCurrentTime]);

  if (!formatted || formatted.length === 0) return null;
  
  return (
    <>
      <div
        ref={parentRef}
        className="List custom-scrollbar mt-10"
        style={{
          height: 500,
          width: `1110px`,
          overflow: 'auto',
          border: '1px solid #ddd',
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: `${columnVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <React.Fragment key={virtualRow.key}>
              {columnVirtualizer.getVirtualItems().map((virtualColumn) => (
                <div
                  key={virtualColumn.key}
                  //   className={
                  //     virtualColumn.index % 2
                  //       ? virtualRow.index % 2 === 0
                  //         ? 'ListItemOdd'
                  //         : 'ListItemEven'
                  //       : virtualRow.index % 2
                  //         ? 'ListItemOdd'
                  //         : 'ListItemEven'
                  //   }
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${virtualColumn.size}px`,
                    height: `${virtualRow.size}px`,
                    transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                  }}
                >
                  {virtualColumn.index === 0 ? (
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 8,
                        paddingRight: 8,
                        borderRight: '1px solid #eee',
                        background: '#fff',
                      }}
                    >
                      <div className="flex min-w-[200px] items-center gap-2 text-xs font-semibold">
                        <TooltipProvider>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger>
                              <div className="flex items-center gap-2">
                                {flowData?.[virtualRow.index]?.flag
                                  ? flowData?.[virtualRow.index]?.flag ===
                                    '/unknown-flag.svg'
                                    ? (
                                        <div
                                          className="flex size-4 items-center justify-center"
                                          style={{
                                            backgroundColor: '#efefef',
                                          }}
                                        >
                                          <FlagIcon className="size-2" />
                                        </div>
                                      )
                                    : (
                                        <img
                                          alt="Flag"
                                          src={flowData?.[virtualRow.index]?.flag}
                                          className="h-[15px] w-[30px]"
                                        />
                                      )
                                  : null}
                                <span
                                  className={
                                    flowData?.[virtualRow.index]?.active
                                      ? 'text-red-600'
                                      : 'text-black'
                                  }
                                >
                                  {flowData?.[virtualRow.index]?.source_ip}
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
                      </div>
                    </div>
                  ) : (
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger>
                          <div
                            className="size-4"
                            style={{
                              backgroundColor: getColorForValue(
                                formatted[virtualRow.index][
                                  virtualColumn.index - 1
                                ].bandwidth,
                                getMaxBandwidth(formatted[virtualRow.index]),
                              ),
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="z-[9999]">
                          <div className="text-xs">
                            <div>
                              <strong>Time:</strong>{' '}
                              {
                                formatted[virtualRow.index][
                                  virtualColumn.index - 1
                                ].bucketTime || formatted[virtualRow.index][
                                  virtualColumn.index - 1
                                ].time
                              }
                            </div>
                            <div>
                              <strong>Bandwidth:</strong>{' '}
                              {formatted[virtualRow.index][
                                virtualColumn.index - 1
                              ].bandwidth > 1024
                                ? (
                                    formatted[virtualRow.index][
                                      virtualColumn.index - 1
                                    ].bandwidth / 1024
                                  ).toFixed(2) + ' KB'
                                : formatted[virtualRow.index][
                                    virtualColumn.index - 1
                                  ].bandwidth + ' bytes'}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
