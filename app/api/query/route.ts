import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { sql, datasetId } = await request.json();
  return Response.json({
    sql,
    datasetId,
    rows: [],
    columns: [],
    message: 'DuckDB native fallback not available in demo environment. Using browser engine instead.',
  });
}
