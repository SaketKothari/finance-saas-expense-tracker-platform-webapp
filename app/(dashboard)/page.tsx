import { Suspense } from 'react';
import { DataGrid } from '@/components/data-grid';
import { DataCharts } from '@/components/data-charts';

export default function DashboardPage() {
  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Suspense fallback={<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8 h-32" />}>
        <DataGrid />
      </Suspense>
      <Suspense fallback={<div className="grid grid-cols-1 lg:grid-cols-6 gap-8 h-96" />}>
        <DataCharts />
      </Suspense>
    </div>
  );
}
