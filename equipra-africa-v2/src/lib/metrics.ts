import type { DB, Ticket } from "../data/seed";
import { DAY } from "./format";

export const isOpen = (t: Ticket) => t.status === "open" || t.status === "in_progress";
export const metSla = (t: Ticket) => !!t.resolved && (new Date(t.resolved).getTime() - new Date(t.created).getTime()) / 3600e3 <= t.sla_hours;

export function fleetMetrics(db: DB) {
  const now = Date.now();
  const active = db.devices.filter((d) => d.status !== "retired");
  const deployed = active.filter((d) => d.status === "deployed");
  const resolved = db.tickets.filter((t) => t.resolved);
  const recentResolved = resolved.filter((t) => now - new Date(t.resolved!).getTime() < 30 * DAY);
  const sla = recentResolved.length ? recentResolved.filter(metSla).length / recentResolved.length : 1;
  const dueRefresh = deployed.filter((d) => { const t = new Date(d.lease_end).getTime() - now; return t > 0 && t < 90 * DAY; });
  const runRate = active.reduce((a, d) => a + d.monthly_rate, 0);
  const mttr = resolved.length ? resolved.reduce((a, t) => a + (new Date(t.resolved!).getTime() - new Date(t.created).getTime()) / 3600e3, 0) / resolved.length : 0;
  return {
    active, deployed, sla, dueRefresh, runRate, mttr,
    inStock: active.filter((d) => d.status === "in_stock"),
    inRepair: active.filter((d) => d.status === "in_repair"),
    openTickets: db.tickets.filter(isOpen),
    pending: db.requests.filter((r) => r.status === "pending_approval"),
    atRisk: active.filter((d) => d.risk === "high" || d.risk === "critical"),
    utilisation: deployed.length / Math.max(1, active.length),
  };
}

export function weeklyTickets(db: DB, weeks = 12) {
  const now = Date.now();
  return Array.from({ length: weeks }, (_, i) => {
    const end = now - (weeks - 1 - i) * 7 * DAY, start = end - 7 * DAY;
    const inR = (iso: string | null) => !!iso && new Date(iso).getTime() > start && new Date(iso).getTime() <= end;
    return { week: new Date(end).toLocaleDateString("en-GB", { day: "numeric", month: "short" }), Opened: db.tickets.filter((t) => inR(t.created)).length, Resolved: db.tickets.filter((t) => inR(t.resolved)).length };
  });
}

export function groupCount<T>(rows: T[], key: (r: T) => string) {
  const m = new Map<string, number>();
  rows.forEach((r) => m.set(key(r), (m.get(key(r)) ?? 0) + 1));
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function groupSum<T>(rows: T[], key: (r: T) => string, val: (r: T) => number) {
  const m = new Map<string, number>();
  rows.forEach((r) => m.set(key(r), (m.get(key(r)) ?? 0) + val(r)));
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}
