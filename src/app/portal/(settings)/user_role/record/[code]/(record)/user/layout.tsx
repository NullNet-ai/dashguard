import React, { type ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default function Layout(props: { user_details: ReactNode }) {
  return <div className="space-y-2">{props.user_details}</div>;
}
