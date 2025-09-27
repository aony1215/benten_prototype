import { ReportStepId } from '@/types/report';

export interface ReportStep {
  id: ReportStepId;
  title: string;
  subtitle: string;
}

export const reportSteps: ReportStep[] = [
  {
    id: 'ingest',
    title: 'データを準備しましょう',
    subtitle: 'CSVやサンプルデータを取り込んで、分析の土台を作ります。',
  },
  {
    id: 'fields',
    title: '見たい項目を選びましょう',
    subtitle: '指標やディメンションをドラッグ＆ドロップで配置します。',
  },
  {
    id: 'visualize',
    title: 'グラフでストーリーを確認',
    subtitle: 'チャートで傾向をつかみ、気づきをメモします。',
  },
  {
    id: 'tips',
    title: 'おすすめのコツをチェック',
    subtitle: '目的とKPIsに合わせたヒントを参考に設定を磨きます。',
  },
  {
    id: 'output',
    title: '仕上げて共有しましょう',
    subtitle: 'PDFやPPTX、HTMLとして優しく共有できます。',
  },
];

export const getStepIndex = (id: ReportStepId) => reportSteps.findIndex((step) => step.id === id);

export const getNextStep = (id: ReportStepId): ReportStepId | null => {
  const index = getStepIndex(id);
  if (index < 0) return null;
  return reportSteps[index + 1]?.id ?? null;
};

export const getPrevStep = (id: ReportStepId): ReportStepId | null => {
  const index = getStepIndex(id);
  if (index < 0) return null;
  return reportSteps[index - 1]?.id ?? null;
};
