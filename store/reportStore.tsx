'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  DatasetInfo,
  DnDModel,
  QueryResult,
  ReportPurpose,
  TipMatch,
  KpiDef,
  TipRule,
  RunContext,
  ReportStepId,
} from '@/types/report';
import { DuckClient, getDuckClient } from '@/lib/duck/client';

export interface FieldDefinition {
  name: string;
  type: 'dimension' | 'measure';
}

interface ReportState {
  dataset?: DatasetInfo;
  model: DnDModel;
  purpose: ReportPurpose;
  result?: QueryResult;
  previousResult?: QueryResult;
  diffMode: boolean;
  logs: string[];
  isRunning: boolean;
  tips: TipMatch[];
  availableFields: FieldDefinition[];
  kpiSelections: string[];
  comments: Record<string, string>;
  client: DuckClient;
  kpis: KpiDef[];
  tipRules: TipRule[];
  activeStep: ReportStepId;
}

const initialModel: DnDModel = {
  dims: [],
  measures: [],
  filters: {},
  sort: [],
  limit: undefined,
};

const cloneModel = (model: DnDModel): DnDModel => ({
  dims: [...model.dims],
  measures: [...model.measures],
  filters: { ...model.filters },
  sort: model.sort ? [...model.sort] : [],
  limit: model.limit,
});

const resolveInitialStep = (client: DuckClient): ReportStepId => {
  const dataset = client.getDataset();
  if (!dataset) {
    return 'ingest';
  }
  const meta = client.getRunMeta();
  if (meta?.model?.measures?.length || meta?.model?.dims?.length) {
    return 'visualize';
  }
  return 'fields';
};

const initialState = (client: DuckClient, kpis: KpiDef[], tipRules: TipRule[]): ReportState => ({
  dataset: client.getDataset(),
  model: client.getRunMeta()?.model ? cloneModel(client.getRunMeta()!.model) : cloneModel(initialModel),
  purpose: client.getRunMeta()?.purpose ?? 'QBR',
  result: undefined,
  previousResult: client.getPreviousResult(),
  diffMode: false,
  logs: [],
  isRunning: false,
  tips: [],
  availableFields: client.getDataset()?.columns ?? [],
  kpiSelections: [],
  comments: {},
  client,
  kpis,
  tipRules,
  activeStep: resolveInitialStep(client),
});

type Action =
  | { type: 'setDataset'; dataset: DatasetInfo }
  | { type: 'setPurpose'; purpose: ReportPurpose }
  | { type: 'setModel'; model: DnDModel }
  | { type: 'setResult'; result: QueryResult; previous?: QueryResult }
  | { type: 'toggleDiff'; diff: boolean }
  | { type: 'addLog'; message: string }
  | { type: 'setRunning'; running: boolean }
  | { type: 'setTips'; tips: TipMatch[] }
  | { type: 'setKpiSelections'; ids: string[] }
  | { type: 'updateComments'; id: string; text: string }
  | { type: 'setAvailableFields'; fields: FieldDefinition[] }
  | { type: 'setStep'; step: ReportStepId };

const reducer = (state: ReportState, action: Action): ReportState => {
  switch (action.type) {
    case 'setDataset':
      return {
        ...state,
        dataset: action.dataset,
        availableFields: action.dataset.columns,
        logs: [...state.logs, `データセット「${action.dataset.name}」を読み込みました。`],
        activeStep: 'fields',
      };
    case 'setPurpose':
      return {
        ...state,
        purpose: action.purpose,
      };
    case 'setModel':
      return {
        ...state,
        model: action.model,
        activeStep: state.activeStep === 'ingest' ? 'fields' : state.activeStep,
      };
    case 'setResult':
      return {
        ...state,
        result: action.result,
        previousResult: action.previous ?? state.previousResult,
        isRunning: false,
        activeStep: state.activeStep === 'fields' ? 'visualize' : state.activeStep,
      };
    case 'toggleDiff':
      return {
        ...state,
        diffMode: action.diff,
      };
    case 'addLog':
      return {
        ...state,
        logs: [...state.logs, action.message],
      };
    case 'setRunning':
      return {
        ...state,
        isRunning: action.running,
      };
    case 'setTips':
      return {
        ...state,
        tips: action.tips,
      };
    case 'setKpiSelections':
      return {
        ...state,
        kpiSelections: action.ids,
      };
    case 'updateComments':
      return {
        ...state,
        comments: { ...state.comments, [action.id]: action.text },
      };
    case 'setAvailableFields':
      return {
        ...state,
        availableFields: action.fields,
      };
    case 'setStep':
      return {
        ...state,
        activeStep: action.step,
      };
    default:
      return state;
  }
};

const ReportContext = createContext<{
  state: ReportState;
  dispatch: React.Dispatch<Action>;
  runModel: (model?: DnDModel) => Promise<void>;
  setModel: (model: DnDModel) => void;
  applyTip: (tip: TipMatch) => void;
} | null>(null);

export const ReportProvider = ({
  children,
  kpis,
  tipRules,
}: {
  children: React.ReactNode;
  kpis: KpiDef[];
  tipRules: TipRule[];
}) => {
  const client = useMemo(() => {
    const duck = getDuckClient();
    duck.prime({ kpis, tips: tipRules });
    return duck;
  }, [kpis, tipRules]);

  const [state, dispatch] = useReducer(reducer, undefined, () => initialState(client, kpis, tipRules));
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setModel = useCallback(
    (model: DnDModel) => {
      dispatch({ type: 'setModel', model });
      dispatch({ type: 'addLog', message: '分析モデルを更新しました。' });
    },
    [dispatch]
  );

  const runModel = useCallback(
    async (nextModel?: DnDModel) => {
      const snapshot = stateRef.current;
      const model = nextModel ?? snapshot.model;
      if (!snapshot.dataset) {
        dispatch({ type: 'addLog', message: '先にデータを読み込んでください。' });
        return;
      }
      dispatch({ type: 'setRunning', running: true });
      dispatch({ type: 'addLog', message: 'クエリを実行しています…' });
      await new Promise((resolve) => setTimeout(resolve, 120));
      const result = snapshot.client.run(model, snapshot.purpose);
      const previous = snapshot.client.getPreviousResult();
      dispatch({ type: 'setResult', result, previous });
      const context: RunContext = {
        dataset: snapshot.dataset,
        purpose: snapshot.purpose,
        model,
        kpiIds: snapshot.kpiSelections,
      };
      const tips = snapshot.client.getTips(context);
      dispatch({ type: 'setTips', tips });
      dispatch({ type: 'addLog', message: 'クエリが完了しました。' });
    },
    [dispatch]
  );

  const applyTip = useCallback(
    (tip: TipMatch) => {
      switch (tip.suggest.action) {
        case 'setLimit': {
          const limit = Number(tip.suggest.payload?.limit ?? state.model.limit ?? 10);
          setModel({ ...state.model, limit });
          break;
        }
        case 'sort': {
          const by = String(tip.suggest.payload?.by ?? state.model.measures[0]?.name ?? 'value');
          const dir = (tip.suggest.payload?.dir as 'asc' | 'desc') ?? 'desc';
          setModel({ ...state.model, sort: [{ by, dir }] });
          break;
        }
        case 'addMeasure': {
          const name = String(tip.suggest.payload?.name ?? 'Value');
          const agg = (tip.suggest.payload?.agg as any) ?? 'sum';
          if (!state.model.measures.some((m) => m.name === name)) {
            setModel({
              ...state.model,
              measures: [...state.model.measures, { name, agg }],
            });
          }
          break;
        }
        case 'addDimension': {
          const name = String(tip.suggest.payload?.name ?? 'Field');
          if (!state.model.dims.some((d) => d.name === name)) {
            setModel({
              ...state.model,
              dims: [...state.model.dims, { name }],
            });
          }
          break;
        }
        case 'enableDiff':
          dispatch({ type: 'toggleDiff', diff: true });
          break;
        case 'addComment': {
          const text = String(tip.suggest.payload?.text ?? '');
          dispatch({ type: 'updateComments', id: 'global', text });
          break;
        }
        default:
          break;
      }
    },
    [dispatch, setModel, state.model]
  );

  const value = useMemo(
    () => ({
      state,
      dispatch,
      runModel,
      setModel,
      applyTip,
    }),
    [state, runModel, setModel, applyTip]
  );

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
};

export const useReportStore = () => {
  const ctx = useContext(ReportContext);
  if (!ctx) {
    throw new Error('useReportStore must be used within ReportProvider');
  }
  return ctx;
};
