'use client';

import React, { useMemo, useState } from 'react';
import moment from 'moment-timezone';
import { cn } from '~/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

const COL_COUNT = 60;
const CELL_HEIGHT = 18;
const MAJOR_TICK_COUNT = 4;
const DISPLAY_DELAY_SECONDS = 15;

interface CoreData {
  core: string;
  usage: number;
}

interface TimelinePoint {
  timestamp: string;
  [key: string]: any;
}

interface CoreTimelineProps {
  data: TimelinePoint[];
  cores: CoreData[];
}

function coreNum(coreStr: string): number {
  const num = parseInt(coreStr.replace(/\D/g, ''), 10);
  console.assert(!Number.isNaN(num), `Invalid core string: ${coreStr}`);
  return Number.isNaN(num) ? 0 : num;
}

// Per-10% intensity scale: green (0%) → orange (50%) → red (100%).
// Bucket to the 10% step, then interpolate hue piecewise.
function getCpuColor(pct: number): string {
  if (!pct || pct <= 0) return '#fff';
  const step = Math.max(0, Math.min(90, Math.floor(pct / 10) * 10));
  const hue =
    step <= 50
      ? 130 - (step / 50) * (130 - 33) // green → orange
      : 33 - ((step - 50) / 50) * 33; // orange → red
  return `hsl(${Math.round(hue)}, 75%, 48%)`;
}

function evenlySpacedIndices(length: number, count: number): Set<number> {
  const n = Math.min(count, length);
  if (n <= 1) return new Set([0]);
  const last = length - 1;
  return new Set(
    Array.from({ length: n }, (_, k) => Math.round((k * last) / (n - 1))),
  );
}

const CoreTimeline = ({ data, cores }: CoreTimelineProps) => {
  const [mode, setMode] = useState<'now' | 'history'>('now');

  const sortedCores = useMemo(
    () => [...cores].sort((a, b) => coreNum(a.core) - coreNum(b.core)),
    [cores],
  );

  // Real second-anchored slots: index 59 = now, index 0 = now-59s. A point lands
  // in its true second's slot; seconds with no reading stay null (no carry-forward).
  const slotLabels = useMemo(
    () =>
      Array.from({ length: COL_COUNT }, (_, k) =>
        moment()
          .subtract(DISPLAY_DELAY_SECONDS + (COL_COUNT - 1 - k), 'seconds')
          .format('HH:mm:ss'),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  );

  const cells = useMemo<(TimelinePoint | null)[]>(() => {
    const byTime = new Map(data.map((point) => [point.timestamp, point]));
    return slotLabels.map((label) => byTime.get(label) ?? null);
  }, [data, slotLabels]);

  const majorIndices = useMemo(
    () => evenlySpacedIndices(COL_COUNT, MAJOR_TICK_COUNT),
    [],
  );

  const newestPoint = data[data.length - 1] ?? null;

  const pctLabels = useMemo(
    () =>
      Array.from(
        { length: COL_COUNT },
        (_, k) => `${Math.round((k / (COL_COUNT - 1)) * 100)}%`,
      ),
    [],
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="w-full">
        <div className="flex justify-start pb-4">
          <div className="flex items-center gap-2 pl-1.5 text-xs">
            <span className="whitespace-nowrap">View By:</span>
            <Select
              value={mode}
              onValueChange={(value) => setMode(value as 'now' | 'history')}
            >
              <SelectTrigger className="h-[34px] w-32 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-sm">
                <SelectItem value="now">Now</SelectItem>
                <SelectItem value="history">Last 60s</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ruler row */}
        <div className="grid grid-cols-[250px_1fr] items-end border-b border-slate-100 pb-1">
          <div className="flex items-center pb-1" />
          <div className="relative">
            <div className="absolute left-0 right-0 top-1 mx-[1px] h-px bg-slate-200" />
            <div
              className="grid items-end border-x border-slate-400"
              style={{
                gridTemplateColumns: `repeat(${COL_COUNT}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: COL_COUNT }, (_, idx) => {
                const isMajor = majorIndices.has(idx);
                const label = isMajor
                  ? mode === 'now'
                    ? pctLabels[idx]
                    : slotLabels[idx]
                  : '';
                return (
                  <div
                    key={idx}
                    className={cn(
                      'relative flex items-end justify-center border-l',
                      isMajor ? 'h-4 border-slate-400' : 'h-3 border-slate-200',
                    )}
                  >
                    {label && (
                      <span className="absolute -top-5 whitespace-nowrap text-[11px] text-slate-500">
                        {label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Core rows */}
        {sortedCores.map((core) => {
          const coreKey = `core_${core.core}`;
          const currentUsage = newestPoint
            ? Number(newestPoint[coreKey] ?? 0)
            : 0;

          return (
            <div
              key={core.core}
              className="grid"
              style={{
                gridTemplateColumns: `250px repeat(${COL_COUNT}, minmax(0, 1fr))`,
              }}
            >
              <div className="flex items-center gap-2 border-b border-r border-slate-100 py-1 pl-2 text-xs font-semibold text-slate-700">
                {coreNum(core.core)}
              </div>
              {Array.from({ length: COL_COUNT }, (_, idx) => {
                if (mode === 'now') {
                  const bucketPct = ((idx + 1) / COL_COUNT) * 100;
                  const filled = currentUsage >= (idx / COL_COUNT) * 100;
                  return (
                    <div
                      key={idx}
                      className="flex w-full items-center justify-center border-b border-l border-dotted border-slate-100"
                    >
                      <div
                        className="w-full"
                        style={{
                          height: CELL_HEIGHT,
                          backgroundColor: filled
                            ? getCpuColor(bucketPct)
                            : '#fff',
                        }}
                      />
                    </div>
                  );
                }

                const point = cells[idx] ?? null;
                const usage = point ? Number(point[coreKey] ?? 0) : 0;
                return (
                  <div
                    key={idx}
                    className="flex w-full items-center justify-center border-b border-l border-dotted border-slate-100"
                  >
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger className="w-full">
                        <div
                          className="w-full"
                          style={{
                            height: CELL_HEIGHT,
                            backgroundColor: point
                              ? getCpuColor(usage)
                              : '#fff',
                          }}
                        />
                      </TooltipTrigger>
                      {point && (
                        <TooltipContent side="top" className="z-[9999]">
                          <div className="space-y-0.5 text-xs">
                            <div>
                              <span className="font-medium text-slate-600">
                                Core:
                              </span>{' '}
                              <span className="font-semibold">
                                {coreNum(core.core)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-slate-600">
                                Time:
                              </span>{' '}
                              {point.timestamp}
                            </div>
                            <div>
                              <span className="font-medium text-slate-600">
                                Usage:
                              </span>{' '}
                              <span className="font-semibold">
                                {usage.toFixed(1)}%
                              </span>
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
};

export default CoreTimeline;
