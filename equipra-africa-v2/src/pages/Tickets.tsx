import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, LifeBuoy, Timer, CheckCircle2, AlertOctagon, Clock3 } from "lucide-react";
import { useStore } from "../data/store";
import type { Priority, Ticket, TicketStatus } from "../data/seed";
import { Avatar, Badge, Button, Card, Drawer, DL, Empty, Field, Input, PageHeader, Select, Stat, StatusBadge, Tabs, TD, TH, Textarea, cx } from "../components/ui";
import { fleetMetrics, isOpen, metSla } from "../lib/metrics";
import { ago, fmtDate, label, pct } from "../lib/format";

type View = "active" | "resolved" | "all";

function slaState(t: Ticket) {
  const end = t.resolved ? new Date(t.resolved).getTime() : Date.now();
  const used = (end - new Date(t.created).getTime()) / 3600e3;
  const ratio = used / t.sla_hours;
  return { used, ratio, breached: ratio > 1 };
}

function SlaChip({ t }: { t: Ticket }) {
  const s = slaState(t);
  if (t.resolved) return <span className={cx("text-xs font-semibold", metSla(t) ? "text-emerald-700" : "text-red-600")}>{metSla(t) ? "Met SLA" : "Missed SLA"}</span>;
  const left = t.sla_hours - s.used;
  return <span className={cx("inline-flex items-center gap-1 text-xs font-semibold tabular", s.breached ? "text-red-600" : s.ratio > 0.7 ? "text-orange-600" : "text-ink-600")}><Timer className="h-3.5 w-3.5" />{s.breached ? `${Math.round(-left)}h over` : `${left < 1 ? `${Math.round(left * 60)}m` : `${Math.round(left)}h`} left`}</span>;
}

export default function Tickets() {
  const { db, person, createTicket, updateTicket } = useStore();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<View>("active");
  const [q, setQ] = useState("");
  const [prio, setPrio] = useState("all");
  const openId = params.get("open");
  const isNew = params.get("new") === "1";
  const m = fleetMetrics(db);

  const close = () => setParams({}, { replace: true });
  const rows = useMemo(() => db.tickets
    .filter((t) => view === "all" || (view === "active" ? isOpen(t) : !isOpen(t)))
    .filter((t) => prio === "all" || t.priority === prio)
    .filter((t) => !q || `${t.number} ${t.title} ${person(t.reporter)?.name}`.toLowerCase().includes(q.toLowerCase())), [db.tickets, view, prio, q, person]);
  const ticket = openId ? db.tickets.find((t) => t.id === openId) : undefined;

  // new ticket form
  const myDevices = db.devices.filter((d) => d.assigned_to);
  const [form, setForm] = useState({ device_id: params.get("device") ?? myDevices[0].id, title: "", category: "Hardware", priority: "medium" as Priority, description: "" });
  useEffect(() => { if (params.get("device")) setForm((f) => ({ ...f, device_id: params.get("device")! })); }, [params]);
  const [note, setNote] = useState("");

  return (
    <div>
      <PageHeader title="Support" subtitle="Every incident logged against your fleet, with live SLA tracking." actions={<Button icon={Plus} onClick={() => setParams({ new: "1" })}>Log a ticket</Button>} />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat icon={LifeBuoy} tone="blue" label="Open tickets" value={m.openTickets.length} sub={`${m.openTickets.filter((t) => t.status === "open").length} not yet picked up`} />
        <Stat icon={AlertOctagon} tone="red" label="Critical & high" value={m.openTickets.filter((t) => t.priority === "critical" || t.priority === "high").length} sub="Active" />
        <Stat icon={CheckCircle2} tone="teal" label="SLA compliance" value={pct(m.sla, 1)} sub="Resolved in last 30 days" />
        <Stat icon={Clock3} tone="violet" label="Mean time to resolve" value={`${m.mttr.toFixed(1)}h`} sub="All resolved tickets" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 lg:flex-row lg:items-center">
          <Tabs value={view} onChange={setView} items={[{ value: "active", label: "Active", count: db.tickets.filter(isOpen).length }, { value: "resolved", label: "Resolved" }, { value: "all", label: "All" }]} />
          <div className="flex flex-1 gap-3 lg:justify-end">
            <div className="relative flex-1 lg:max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tickets" className="pl-9" /></div>
            <Select value={prio} onChange={(e) => setPrio(e.target.value)} className="w-36" aria-label="Priority"><option value="all">Any priority</option>{["critical", "high", "medium", "low"].map((p) => <option key={p} value={p}>{label(p)}</option>)}</Select>
          </div>
        </div>
        {rows.length === 0 ? <Empty icon={CheckCircle2} title="No tickets here" body="Nothing matches these filters." /> : (<>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead className="border-b border-ink-100 bg-ink-50/60"><tr><TH>Ticket</TH><TH>Reported by</TH><TH>Priority</TH><TH>Status</TH><TH>Technician</TH><TH>SLA</TH></tr></thead>
              <tbody className="divide-y divide-ink-100">
                {rows.map((t) => { const p = person(t.reporter)!; return (
                  <tr key={t.id} onClick={() => setParams({ open: t.id })} className="cursor-pointer hover:bg-ink-50/70">
                    <TD><div className="font-semibold text-ink-900">{t.title}</div><div className="text-xs text-ink-500"><span className="font-mono">{t.number}</span> · {t.category} · {ago(t.created)}</div></TD>
                    <TD><div className="flex items-center gap-2"><Avatar name={p.name} size={26} /><span className="whitespace-nowrap">{p.name}</span></div></TD>
                    <TD><StatusBadge value={t.priority} /></TD>
                    <TD><StatusBadge value={t.status} /></TD>
                    <TD className="whitespace-nowrap">{t.technician ?? <span className="text-ink-400">Unassigned</span>}</TD>
                    <TD><SlaChip t={t} /></TD>
                  </tr>
                ); })}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-ink-100 md:hidden">
            {rows.map((t) => (
              <li key={t.id}><button onClick={() => setParams({ open: t.id })} className="w-full px-4 py-3.5 text-left">
                <div className="flex items-center justify-between gap-2"><span className="font-mono text-xs text-ink-500">{t.number}</span><StatusBadge value={t.status} /></div>
                <div className="mt-1 text-sm font-semibold">{t.title}</div>
                <div className="mt-1 flex items-center gap-2"><StatusBadge value={t.priority} /><SlaChip t={t} /></div>
              </button></li>
            ))}
          </ul>
        </>)}
      </Card>

      <Drawer open={!!ticket} onClose={close} wide title={ticket?.title} subtitle={ticket && <><span className="font-mono">{ticket.number}</span> · opened {ago(ticket.created)}</>}
        footer={ticket && isOpen(ticket) ? <>
          {ticket.status === "open" && <Button variant="secondary" onClick={() => { updateTicket(ticket.id, "in_progress", note || undefined); setNote(""); }}>Start work</Button>}
          <Button icon={CheckCircle2} onClick={() => { updateTicket(ticket.id, "resolved", note || "Resolved and confirmed with user."); setNote(""); }}>Mark resolved</Button>
        </> : ticket?.status === "resolved" ? <Button variant="secondary" onClick={() => updateTicket(ticket.id, "closed")}>Close ticket</Button> : undefined}>
        {ticket && (() => { const d = db.devices.find((x) => x.id === ticket.device_id)!; const s = slaState(ticket); return (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2"><StatusBadge value={ticket.status} /><StatusBadge value={ticket.priority} /><Badge>{ticket.category}</Badge></div>
            <div className="rounded-xl border border-ink-200 p-4">
              <div className="flex items-center justify-between text-sm"><span className="font-semibold">SLA · {ticket.sla_hours}h response</span><SlaChip t={ticket} /></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100"><div className={cx("h-full rounded-full", s.breached ? "bg-red-600" : s.ratio > 0.7 ? "bg-orange-500" : "bg-brand-600")} style={{ width: `${Math.min(100, s.ratio * 100)}%` }} /></div>
            </div>
            <DL items={[["Reported by", person(ticket.reporter)?.name], ["Technician", ticket.technician ?? "Unassigned"], ["Device", `${d.brand} ${d.model}`], ["Asset tag", <span className="font-mono">{d.asset_tag}</span>], ["Opened", fmtDate(ticket.created)], ["Resolved", fmtDate(ticket.resolved)]]} />
            <div><div className="text-xs font-medium text-ink-500">Description</div><p className="mt-1 text-sm">{ticket.description}</p></div>
            <div>
              <div className="mb-3 text-sm font-semibold">Timeline</div>
              <ol className="relative space-y-4 border-l border-ink-200 pl-5">
                {ticket.updates.map((u, i) => (
                  <li key={i}><span className="absolute -left-[6px] mt-1 h-3 w-3 rounded-full border-2 border-white bg-brand-600" /><div className="text-sm"><span className="font-semibold">{u.by}</span> <span className="text-ink-400">· {ago(u.at)}</span></div><div className="text-sm text-ink-700">{u.text}</div></li>
                ))}
              </ol>
            </div>
            {isOpen(ticket) && <Field label="Add an update"><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes are added to the timeline when you change status" /></Field>}
          </div>
        ); })()}
      </Drawer>

      <Drawer open={isNew} onClose={close} title="Log a support ticket" subtitle="A technician will be assigned automatically."
        footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button disabled={!form.title.trim()} onClick={() => { const t = createTicket(form); setParams({ open: t.id }); setForm((f) => ({ ...f, title: "", description: "" })); }}>Submit ticket</Button></>}>
        <div className="space-y-4">
          <Field label="Device">
            <Select value={form.device_id} onChange={(e) => setForm({ ...form, device_id: e.target.value })}>
              {myDevices.map((d) => <option key={d.id} value={d.id}>{d.asset_tag} · {d.brand} {d.model} · {person(d.assigned_to)?.name}</option>)}
            </Select>
          </Field>
          <Field label="What's wrong?"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Laptop won't charge" autoFocus /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category"><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{["Hardware", "Software", "Network", "Damage", "Security", "Access", "Accessory"].map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Priority"><Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>{(["low", "medium", "high", "critical"] as TicketStatus[] | Priority[]).map((p) => <option key={p} value={p}>{label(p)}</option>)}</Select></Field>
          </div>
          <Field label="Details" hint="Include error messages and when it started."><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="rounded-xl bg-brand-50 p-3 text-xs text-brand-900">Response targets: Critical 4h · High 8h · Medium 24h · Low 48h</div>
        </div>
      </Drawer>
    </div>
  );
}
