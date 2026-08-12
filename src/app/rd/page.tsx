'use client';

import dynamic from 'next/dynamic';

const RDClient = dynamic(() => import('./client'), { ssr: false });

export default function RDPage() {
  return <RDClient />;
}
