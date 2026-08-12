'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment-timezone';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Loader } from '~/components/ui/loader';
import { api } from '~/trpc/react';

import { formatBytes } from '../pie-chart/function/formatBytes';
import { IFormProps } from '../types';
import MetricChart from './components/MetricChart';
import CoreTimeline from './components/CoreTimeline';
import { parseCoreUsage } from './utils/parse';

const REFRESH_INTERVAL_MS = 1_000;
const WINDOW_SECONDS = 60;
const FETCH_DELAY_SECONDS = 10;
const DISPLAY_DELAY_SECONDS = 15;
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const transformRow = (row: Record<string, any>, timestamp: string) => {
  const memPct = row.total_memory
    ? (row.used_memory / row.total_memory) * 100
    : 0;
  const diskUsed = row.total_disk_space - row.available_disk_space;
  const diskPct = row.total_disk_space
    ? (diskUsed / row.total_disk_space) * 100
    : 0;
  const cores = parseCoreUsage(row.cpu_usage);
  const temperature = parseCoreUsage(row.temperature);
  const perCore = cores.reduce<Record<string, number>>((acc, core) => {
    acc[`core_${core.core}`] = core.usage;
    return acc;
  }, {});

  return {
    timestamp,
    num_cpus: row.num_cpus,
    cpu_pct: Number(row.global_cpu_usage ?? 0),
    mem_pct: memPct,
    disk_pct: diskPct,
    read_bytes: Number(row.read_bytes ?? 0),
    written_bytes: Number(row.written_bytes ?? 0),
    used_memory: row.used_memory,
    total_memory: row.total_memory,
    disk_used: diskUsed,
    total_disk_space: row.total_disk_space,
    cores,
    temperature,
    ...perCore,
  };
};

const SHOW_DISK_IO = false; // ponytail: hidden until read_bytes/written_bytes have real data

const System = ({ params }: IFormProps) => {
  const deviceId = params?.id ?? '';
  const getByDevice = api.systemResource.getByDevice.useMutation();

  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const loadingRef = useRef(false);
  const isUnmountedRef = useRef(false);

  const poll = useCallback(async () => {
    if (!deviceId || loadingRef.current) return;
    loadingRef.current = true;
    try {
      const to = moment
        .utc()
        .subtract(FETCH_DELAY_SECONDS, 'seconds')
        .format('YYYY-MM-DD HH:mm:ss');
      const from = moment
        .utc()
        .subtract(DISPLAY_DELAY_SECONDS + WINDOW_SECONDS, 'seconds')
        .format('YYYY-MM-DD HH:mm:ss');

      const rows = await getByDevice.mutateAsync({
        device_id: deviceId,
        time_range: [from, to],
      });
      if (isUnmountedRef.current) return;

      setFilteredData(
        (rows ?? []).map((row: Record<string, any>) =>
          transformRow(
            row,
            moment.utc(row.timestamp).tz(timezone).format('HH:mm:ss'),
          ),
        ),
      );
      setIsLoading(false);
      setLastUpdated(Date.now());
    } finally {
      loadingRef.current = false;
    }
  }, [deviceId, getByDevice]);

  useEffect(() => {
    isUnmountedRef.current = false;
    poll();
    const interval = window.setInterval(poll, REFRESH_INTERVAL_MS);
    return () => {
      isUnmountedRef.current = true;
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  const latest = filteredData[filteredData.length - 1];
  const hasTemperature = filteredData.some(
    (row) => row.temperature?.length > 0,
  );

  if (isLoading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <Loader
          className="h-8 w-8 bg-primary text-primary"
          label=""
          variant="spinner"
        />
      </div>
    );
  }

  if (!filteredData.length) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center text-sm text-muted-foreground">
        No system resource data reported for this device yet.
      </div>
    );
  }

  const sortedCores = latest?.cores
    ? [...latest.cores].sort((a, b) => {
        const aNum = parseInt(a.core.replace(/\D/g, ''), 10);
        const bNum = parseInt(b.core.replace(/\D/g, ''), 10);
        return aNum - bNum;
      })
    : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">
                CPU Usage
              </CardTitle>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {latest ? `${latest.cpu_pct.toFixed(1)}%` : '—'}
            </div>
            {lastUpdated && (
              <div className="mt-1 text-[11px] text-muted-foreground">
                Updated {Math.round((Date.now() - lastUpdated) / 1000)}s ago
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">
                Memory
              </CardTitle>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {latest
                ? `${latest.mem_pct.toFixed(1)}% (${formatBytes(latest.used_memory)} / ${formatBytes(latest.total_memory)})`
                : '—'}
            </div>
            {lastUpdated && (
              <div className="mt-1 text-[11px] text-muted-foreground">
                Updated {Math.round((Date.now() - lastUpdated) / 1000)}s ago
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">
                Disk
              </CardTitle>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {latest
                ? `${latest.disk_pct.toFixed(1)}% (${formatBytes(latest.disk_used)} / ${formatBytes(latest.total_disk_space)})`
                : '—'}
            </div>
            {lastUpdated && (
              <div className="mt-1 text-[11px] text-muted-foreground">
                Updated {Math.round((Date.now() - lastUpdated) / 1000)}s ago
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">CPU Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricChart
            data={filteredData}
            lines={[
              {
                dataKey: 'cpu_pct',
                label: 'CPU %',
                color: 'hsl(var(--chart-1))',
              },
            ]}
            dynamicYAxis
            valueFormatter={(v) => `${Number(v).toFixed(1)}%`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Memory Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricChart
            data={filteredData}
            lines={[
              {
                dataKey: 'mem_pct',
                label: 'Memory %',
                color: 'hsl(var(--chart-2))',
              },
            ]}
            dynamicYAxis
            valueFormatter={(v) => `${Number(v).toFixed(1)}%`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Disk Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricChart
            data={filteredData}
            lines={[
              {
                dataKey: 'disk_pct',
                label: 'Disk %',
                color: 'hsl(var(--chart-3))',
              },
            ]}
            dynamicYAxis
            valueFormatter={(v) => `${Number(v).toFixed(1)}%`}
          />
        </CardContent>
      </Card>

      {SHOW_DISK_IO && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Disk I/O</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricChart
              data={filteredData}
              lines={[
                {
                  dataKey: 'read_bytes',
                  label: 'Read',
                  color: 'hsl(var(--chart-4))',
                },
                {
                  dataKey: 'written_bytes',
                  label: 'Written',
                  color: 'hsl(var(--chart-5))',
                },
              ]}
              dynamicYAxis
              valueFormatter={(v) => formatBytes(Number(v))}
            />
          </CardContent>
        </Card>
      )}

      {hasTemperature && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricChart
              data={filteredData.map((row) => ({
                timestamp: row.timestamp,
                temperature: row.temperature[0]?.usage ?? 0,
              }))}
              lines={[
                {
                  dataKey: 'temperature',
                  label: 'Temp (°C)',
                  color: 'hsl(var(--chart-1))',
                },
              ]}
              valueFormatter={(v) => `${Number(v).toFixed(1)}°C`}
            />
          </CardContent>
        </Card>
      )}

      {sortedCores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Per-Core CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <CoreTimeline data={filteredData} cores={sortedCores} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default System;
