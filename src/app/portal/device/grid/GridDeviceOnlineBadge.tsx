'use client';
import React from 'react';

import { Badge, type BadgeProps } from '~/components/ui/badge';

interface GridDeviceOnlineBadgeProps {
  online: boolean;
}

const formatLabel = (value: string) => {
  const normalized = value.replace(/[_-]+/g, ' ').trim().toLowerCase();
  if (!normalized) return value;
  return normalized
    .split(/\s+/)
    .map((word) => (word ? word[0]!.toUpperCase() + word.slice(1) : ''))
    .join(' ');
};

export function GridBadge({
  label,
  variant,
  className,
}: {
  label: string;
  variant?: BadgeProps['variant'];
  className?: string;
}) {
  return (
    <Badge className={className} variant={variant}>
      {formatLabel(label)}
    </Badge>
  );
}

export function GridSessionStatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  if (normalized === 'active') {
    return <GridBadge label={status} variant="success" />;
  }

  if (normalized === 'idle') {
    return <GridBadge label={status} variant="caution" />;
  }

  if (normalized === 'terminated') {
    return <GridBadge label={status} variant="destructive" />;
  }

  if (normalized === 'expired') {
    return (
      <GridBadge
        className="border-transparent bg-gray-400/10 text-gray-600"
        label={status}
        variant="outline"
      />
    );
  }

  return <GridBadge label={status} variant="outline" />;
}

export default function GridDeviceOnlineBadge({
  online,
}: GridDeviceOnlineBadgeProps) {
  return (
    <span
      data-test-id="device-online-badge"
      data-online={online ? 'true' : 'false'}
    >
      <GridBadge
        label={online ? 'Online' : 'Offline'}
        variant={online ? 'success' : 'destructive'}
      />
    </span>
  );
}
