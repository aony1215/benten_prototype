import { QueryResult, DnDModel, ReportPurpose } from '@/types/report';

export const renderHtmlSnapshot = ({
  result,
  model,
  datasetName,
  purpose,
}: {
  result: QueryResult;
  model: DnDModel;
  datasetName?: string;
  purpose: ReportPurpose;
}) => {
  const rowsHtml = result.rows
    .map((row) => {
      const cells = result.columns
        .map((column) => `<td>${typeof row[column] === 'number' ? Number(row[column]).toLocaleString() : row[column] ?? ''}</td>`)
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const columnsHtml = result.columns.map((column) => `<th>${column}</th>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Report Snapshot</title>
<style>
body { font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 24px; background: #f8fafc; }
header { margin-bottom: 24px; }
h1 { margin: 0; font-size: 24px; }
table { width: 100%; border-collapse: collapse; margin-top: 16px; }
th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 14px; }
th { background: #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px; }
.badge { display: inline-block; padding: 4px 8px; border-radius: 9999px; background: #0f172a; color: white; font-size: 12px; }
.summary { margin-top: 16px; color: #475569; font-size: 14px; }
</style>
</head>
<body>
<header>
<h1>Immersive Report Snapshot</h1>
<div class="summary">
<p class="badge">Purpose: ${purpose}</p>
<p>Dataset: ${datasetName ?? 'N/A'} | Dimensions: ${model.dims.map((dim) => dim.name).join(', ') || 'All'} | Measures: ${
    model.measures.map((measure) => measure.name).join(', ') || 'None'
  }</p>
</div>
</header>
<section>
<table>
<thead><tr>${columnsHtml}</tr></thead>
<tbody>${rowsHtml}</tbody>
</table>
</section>
</body>
</html>`;
};
