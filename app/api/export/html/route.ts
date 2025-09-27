import { NextRequest } from 'next/server';
import { renderHtmlSnapshot } from '@/lib/export/html';
import { QueryResult, DnDModel, ReportPurpose } from '@/types/report';

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as {
    result: QueryResult;
    model: DnDModel;
    datasetName?: string;
    purpose: ReportPurpose;
  };

  const html = renderHtmlSnapshot(payload);
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': 'attachment; filename="report.html"',
    },
  });
}
