import React, { type ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default function Layout(props: { device_group: ReactNode }) {
  return <div className="space-y-2">{props.device_group}</div>;
}
