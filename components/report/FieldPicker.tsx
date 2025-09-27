'use client';

import { useMemo } from 'react';
import { useReportStore } from '@/store/reportStore';

interface DragItem {
  name: string;
  type: 'dimension' | 'measure';
}

const dropZoneBase =
  'flex min-h-[120px] flex-1 flex-wrap gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500';

const pillClass =
  'inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200';

export const FieldPicker = () => {
  const {
    state: { availableFields, model },
    setModel,
    dispatch,
  } = useReportStore();

  const dimensions = useMemo(() => availableFields.filter((field) => field.type === 'dimension'), [availableFields]);
  const measures = useMemo(() => availableFields.filter((field) => field.type === 'measure'), [availableFields]);

  const startDrag = (event: React.DragEvent<HTMLDivElement>, item: DragItem) => {
    event.dataTransfer.setData('application/json', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, target: 'dims' | 'measures') => {
    event.preventDefault();
    const payload = event.dataTransfer.getData('application/json');
    if (!payload) return;
    const item = JSON.parse(payload) as DragItem;
    if (target === 'dims' && item.type === 'dimension') {
      if (!model.dims.some((dim) => dim.name === item.name)) {
        const next = { ...model, dims: [...model.dims, { name: item.name }] };
        setModel(next);
        dispatch({ type: 'addLog', message: `Dimension added: ${item.name}` });
      }
    }
    if (target === 'measures' && item.type === 'measure') {
      if (!model.measures.some((measure) => measure.name === item.name)) {
        const next = { ...model, measures: [...model.measures, { name: item.name, agg: 'sum' as const }] };
        setModel(next);
        dispatch({ type: 'addLog', message: `Measure added: ${item.name}` });
      }
    }
  };

  const removeField = (name: string, type: 'dimension' | 'measure') => {
    if (type === 'dimension') {
      setModel({ ...model, dims: model.dims.filter((dim) => dim.name !== name) });
    } else {
      setModel({ ...model, measures: model.measures.filter((measure) => measure.name !== name) });
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">2. Field Picker</h2>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row">
        <div className="flex-1">
          <h3 className="text-xs font-semibold uppercase text-slate-500">Available Dimensions</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {dimensions.map((field) => (
              <div
                key={field.name}
                className={pillClass}
                draggable
                onDragStart={(event) => startDrag(event, { name: field.name, type: 'dimension' })}
              >
                {field.name}
              </div>
            ))}
            {dimensions.length === 0 && <span className="text-xs text-slate-400">Load a dataset to unlock dimensions.</span>}
          </div>
          <h3 className="mt-6 text-xs font-semibold uppercase text-slate-500">Available Measures</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {measures.map((field) => (
              <div
                key={field.name}
                className={pillClass}
                draggable
                onDragStart={(event) => startDrag(event, { name: field.name, type: 'measure' })}
              >
                {field.name}
              </div>
            ))}
            {measures.length === 0 && <span className="text-xs text-slate-400">Import metrics to start measuring.</span>}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h3 className="text-xs font-semibold uppercase text-slate-500">Dimensions</h3>
            <div
              className={dropZoneBase}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, 'dims')}
            >
              {model.dims.length === 0 && <span>Drag dimensions here</span>}
              {model.dims.map((dim) => (
                <button key={dim.name} className={pillClass} onClick={() => removeField(dim.name, 'dimension')}>
                  {dim.name}
                  <span className="text-slate-400">×</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase text-slate-500">Measures</h3>
            <div
              className={dropZoneBase}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, 'measures')}
            >
              {model.measures.length === 0 && <span>Drag measures here</span>}
              {model.measures.map((measure) => (
                <button key={measure.name} className={pillClass} onClick={() => removeField(measure.name, 'measure')}>
                  {measure.name} <span className="text-slate-400">×</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
