"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const MainApp = dynamic(() => import('@/components/MainApp').then(mod => mod.MainApp), {
  ssr: false,
  loading: () => (
    <div className="main-grid">
      <Skeleton className="panel" style={{ gridArea: 'importer' }} />
      <Skeleton className="panel" style={{ gridArea: 'calculator' }} />
      <Skeleton className="panel" style={{ gridArea: 'graphing' }} />
      <Skeleton className="panel" style={{ gridArea: 'spreadsheet' }} />
    </div>
  ),
});

export default function Home() {
  return <MainApp />;
}
