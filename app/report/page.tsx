import { ReportHeader } from '@/components/report/ReportHeader';
import { ReportProvider } from '@/store/reportStore';
import { loadKpis } from '@/lib/duck/kpi';
import { loadTipRules } from '@/lib/tips/loader';
import { ReportWizard } from '@/components/report/ReportWizard';

export const dynamic = 'force-dynamic';

export default function ReportPage() {
  const kpis = loadKpis();
  const tipRules = loadTipRules();

  return (
    <ReportProvider kpis={kpis} tipRules={tipRules}>
      <div className="min-h-screen bg-slate-100">
        <ReportHeader />
        <ReportWizard />
      </div>
    </ReportProvider>
  );
}
