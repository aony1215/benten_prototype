import { ReportHeader } from '@/components/report/ReportHeader';
import { DataIngest } from '@/components/report/DataIngest';
import { FieldPicker } from '@/components/report/FieldPicker';
import { ChartGrid } from '@/components/report/ChartGrid';
import { TipsPanel } from '@/components/report/TipsPanel';
import { ExportBar } from '@/components/report/ExportBar';
import { ReportProvider } from '@/store/reportStore';
import { loadKpis } from '@/lib/duck/kpi';
import { loadTipRules } from '@/lib/tips/loader';

export const dynamic = 'force-dynamic';

export default function ReportPage() {
  const kpis = loadKpis();
  const tipRules = loadTipRules();

  return (
    <ReportProvider kpis={kpis} tipRules={tipRules}>
      <div className="min-h-screen bg-slate-100">
        <ReportHeader />
        <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
          <DataIngest />
          <FieldPicker />
          <ChartGrid />
          <TipsPanel />
          <ExportBar />
        </main>
      </div>
    </ReportProvider>
  );
}
