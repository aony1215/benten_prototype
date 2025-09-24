"use client";

import { useMemo } from "react";

const PLAYBOOK_VERSIONS = [
  {
    id: "pbk_report_insight_writer@0.1.0",
    version: "0.1.0",
    status: "approved",
    stop_rules: {
      verifying_ttl_hours: 24,
      early_stop: ["if CPA > target*1.2 for 2d then rollback"],
    },
  },
];

type PlaybookPickerProps = {
  playbookId: string;
  version: string;
  onVersionChange: (version: string) => void;
};

export default function PlaybookPicker({ playbookId, version, onVersionChange }: PlaybookPickerProps) {
  const selected = useMemo(
    () => PLAYBOOK_VERSIONS.find((item) => item.version === version) ?? PLAYBOOK_VERSIONS[0],
    [version]
  );

  return (
    <div className="flex items-center gap-4 text-xs text-slate-600">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-500">Playbook</p>
        <p className="font-semibold text-slate-800">{playbookId}</p>
      </div>
      <label className="flex items-center gap-2">
        <span className="text-[11px] uppercase text-slate-500">Version</span>
        <select
          value={version}
          onChange={(event) => onVersionChange(event.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1"
        >
          {PLAYBOOK_VERSIONS.map((item) => (
            <option key={item.version} value={item.version}>
              {item.version} · {item.status}
            </option>
          ))}
        </select>
      </label>
      {selected && (
        <div className="hidden md:block">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Stop rules</p>
          <p className="text-xs text-slate-600">
            Verify within {selected.stop_rules.verifying_ttl_hours}h · {selected.stop_rules.early_stop[0]}
          </p>
        </div>
      )}
    </div>
  );
}
