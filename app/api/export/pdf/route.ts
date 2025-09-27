import { NextRequest } from 'next/server';
import { QueryResult, DnDModel, ReportPurpose } from '@/types/report';

const escapePdfText = (text: string) => text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const buildPdf = (lines: string[]): Buffer => {
  const content = lines
    .map((line, index) => `BT /F1 12 Tf 40 ${770 - index * 18} Td (${escapePdfText(line)}) Tj ET`)
    .join('\n');
  const contentBytes = Buffer.from(content, 'utf8');

  const objects: string[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('<< /Type /Pages /Count 1 /Kids [3 0 R] >>');
  objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>');
  objects.push(`<< /Length ${contentBytes.length} >>\nstream\n${content}\nendstream`);
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  objects.forEach((body, index) => {
    const offset = Buffer.byteLength(pdf, 'utf8');
    offsets.push(offset);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
};

export async function POST(request: NextRequest) {
  const { result, model, datasetName, purpose } = (await request.json()) as {
    result: QueryResult;
    model: DnDModel;
    datasetName?: string;
    purpose: ReportPurpose;
  };

  const lines: string[] = [];
  lines.push(`Purpose: ${purpose}`);
  lines.push(`Dataset: ${datasetName ?? 'N/A'}`);
  lines.push(`Dimensions: ${model.dims.map((dim) => dim.name).join(', ') || 'All'}`);
  lines.push(`Measures: ${model.measures.map((measure) => measure.name).join(', ') || 'None'}`);
  lines.push('');
  lines.push('Rows:');
  result.rows.slice(0, 12).forEach((row, idx) => {
    const formatted = result.columns
      .map((column) => `${column}: ${row[column as keyof typeof row]}`)
      .join(' | ');
    lines.push(`${idx + 1}. ${formatted}`);
  });

  const pdf = buildPdf(lines);
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="report.pdf"',
    },
  });
}
