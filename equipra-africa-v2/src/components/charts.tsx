import type { ReactNode } from "react";

export const SERIES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];
export const STATUS = { good: "#0ca30c", warning: "#fab219", serious: "#ec835a", critical: "#d03b3b" };
export const SEQ = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#2a78d6", "#1c5cab", "#104281"];
export const GRID = "#EDF1F4";
export const AXIS = { fontSize: 11, fill: "#5B7186" };

export function TipBox({ active, payload, label, fmt = (v: number) => String(v), labelFmt }: { active?: boolean; payload?: { name: string; value: number; color?: string; payload?: Record<string, unknown>; fill?: string }[]; label?: string; fmt?: (v: number) => string; labelFmt?: (l: string) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[150px] rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-xs shadow-lift">
      {label !== undefined && <div className="mb-1.5 font-semibold text-ink-900">{labelFmt ? labelFmt(String(label)) : label}</div>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-ink-600"><span className="h-2 w-2 rounded-sm" style={{ background: p.color || p.fill || (p.payload?.fill as string) }} />{p.name}</span>
          <span className="font-semibold tabular text-ink-900">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string; value?: ReactNode }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-600">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: i.color }} />
          {i.label}
          {i.value !== undefined && <span className="font-semibold tabular text-ink-900">{i.value}</span>}
        </li>
      ))}
    </ul>
  );
}
