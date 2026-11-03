import { Link, useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Laptop, LifeBuoy, PackagePlus, RefreshCcw, Gauge, Wallet, ArrowRight, Check, X, Plus, AlertTriangle } from "lucide-react";
import { useStore } from "../data/store";
import { Badge, Button, Card, CardHeader, PageHeader, Stat, StatusBadge, cx } from "../components/ui";
import { AXIS, GRID, Legend, SERIES, TipBox } from "../components/charts";
import { fleetMetrics, weeklyTickets } from "../lib/metrics";
import { ago, daysFromNow, fmtShort, label, naira, num, pct } from "../lib/format";

const STATUS_COLORS: Record<string, string> = { deployed: SERIES[0], in_stock: SERIES[2], in_repair: SERIES[1], in_transit: SERIES[6] };

export default function Dashboard() {
  const { db, me, person, decideRequest } = useStore();
  const nav = useNavigate();
  const m = fleetMetrics(db);
  const weekly = weeklyTickets(db);
  const spend = db.invoices.slice(0, 6).reverse().map((i) => ({ month: new Date(i.period).toLocaleDateString("en-GB", { month: "short" }), Total: i.total }));
  const lastTwo = db.invoices.slice(0, 2);
  const spendDelta = (lastTwo[0].total - lastTwo[1].total) / lastTwo[1].total;
  const statusRows = ["deployed", "in_stock", "in_repair", "in_transit"].map((s) => ({ s, n: m.active.filter((d) => d.status === s).length }));
  const total = statusRows.reduce((a, r) => a + r.n, 0);
  const hour = new Date().getHours();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        title={`Good ${hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"}, ${me.name.split(" ")[0]}`}
        subtitle="Here's how Zenara Group's device fleet is performing today."
        actions={<>
          <Button variant="secondary" icon={LifeBuoy} onClick={() => nav("/tickets?new=1")}>Log a ticket</Button>
          <Button icon={Plus} onClick={() => nav("/requests?tab=new")}>Request devices</Button>
        </>}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <Stat icon={Laptop} label="Active devices" value={num(m.active.length)} sub={`${pct(m.utilisation)} deployed`} />
        <Stat icon={LifeBuoy} tone="blue" label="Open tickets" value={m.openTickets.length} sub={`${m.openTickets.filter((t) => t.priority === "critical").length} critical`} />
        <Stat icon={PackagePlus} tone="amber" label="Awaiting approval" value={m.pending.length} sub="Device requests" />
        <Stat icon={RefreshCcw} tone="violet" label="Refresh due" value={m.dueRefresh.length} sub="Next 90 days" />
        <Stat icon={Gauge} tone="teal" label="SLA compliance" value={pct(m.sla, 1)} sub="Last 30 days" trend={{ value: m.sla >= 0.95 ? "On target" : "Below 95%", good: m.sla >= 0.95 }} />
        <Stat icon={Wallet} tone="ink" label="Monthly run-rate" value={naira(m.runRate, true)} sub="Excl. VAT" trend={{ value: `${spendDelta >= 0 ? "+" : ""}${pct(spendDelta, 1)} MoM`, good: spendDelta < 0.05 }} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Support volume" subtitle="Tickets opened vs resolved per week" action={<Link to="/tickets" className="text-[13px] font-semibold text-brand-700 hover:underline">View tickets</Link>} />
          <div className="px-5 pt-3"><Legend items={[{ label: "Opened", color: SERIES[1] }, { label: "Resolved", color: SERIES[0] }]} /></div>
          <div className="h-64 px-2 pb-4 pt-2">
            <ResponsiveContainer>
              <LineChart data={weekly} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="week" tick={AXIS} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<TipBox labelFmt={(l) => `Week ending ${l}`} />} cursor={{ stroke: "#B4C0CB" }} />
                <Line type="monotone" dataKey="Opened" stroke={SERIES[1]} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} />
                <Line type="monotone" dataKey="Resolved" stroke={SERIES[0]} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Fleet status" subtitle={`${total} active devices`} action={<Link to="/devices" className="text-[13px] font-semibold text-brand-700 hover:underline">Inventory</Link>} />
          <div className="px-5 pb-5 pt-5">
            <div className="flex h-3 gap-[2px] overflow-hidden rounded-full">
              {statusRows.map((r) => <div key={r.s} title={`${label(r.s)}: ${r.n}`} style={{ width: `${(r.n / total) * 100}%`, background: STATUS_COLORS[r.s] }} />)}
            </div>
            <ul className="mt-5 space-y-3">
              {statusRows.map((r) => (
                <li key={r.s}>
                  <Link to={`/devices?status=${r.s}`} className="flex items-center justify-between rounded-lg text-sm hover:text-brand-700">
                    <span className="flex items-center gap-2.5 text-ink-700"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: STATUS_COLORS[r.s] }} />{label(r.s)}</span>
                    <span className="tabular"><span className="font-semibold text-ink-900">{r.n}</span><span className="ml-2 inline-block w-10 text-right text-ink-500">{pct(r.n / total)}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" />{m.atRisk.length} devices at high failure risk</div>
              <Link to="/predictive" className="mt-1 inline-flex items-center gap-1 text-amber-800 underline-offset-2 hover:underline">Review predictions <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Awaiting your approval" subtitle="Device requests from your teams" action={<Link to="/requests?tab=approvals" className="text-[13px] font-semibold text-brand-700 hover:underline">All requests</Link>} />
          <ul className="mt-3 divide-y divide-ink-100">
            {m.pending.length === 0 && <li className="px-5 py-10 text-center text-sm text-ink-500">You're all caught up. No requests waiting.</li>}
            {m.pending.slice(0, 5).map((r) => {
              const p = person(r.requester)!;
              return (
                <li key={r.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-ink-500">{r.number}</span>
                      <Badge tone={r.device_class === "developer" ? "blue" : r.device_class === "executive" ? "violet" : "gray"}>{label(r.device_class)}</Badge>
                      <span className="text-xs text-ink-400">{ago(r.created)}</span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-ink-900">{r.quantity} × {r.model}</div>
                    <div className="text-xs text-ink-500">{p.name} · {r.department} · {r.justification}</div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <div className="text-sm font-bold tabular text-ink-900">{naira(r.monthly_cost)}<span className="text-xs font-medium text-ink-500">/mo</span></div>
                    <div className="ml-auto flex gap-1.5 sm:ml-0">
                      <Button size="sm" variant="secondary" icon={X} onClick={() => decideRequest(r.id, false)}>Reject</Button>
                      <Button size="sm" icon={Check} onClick={() => decideRequest(r.id, true)}>Approve</Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="flex flex-col">
          <CardHeader title="Monthly spend" subtitle="Invoiced, incl. VAT" action={<Link to="/billing" className="text-[13px] font-semibold text-brand-700 hover:underline">Billing</Link>} />
          <div className="h-56 flex-1 px-2 pb-4 pt-4">
            <ResponsiveContainer>
              <BarChart data={spend} margin={{ top: 8, right: 12, left: -6, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => naira(v, true)} width={52} />
                <Tooltip content={<TipBox fmt={(v) => naira(v)} />} cursor={{ fill: "#F6F8FA" }} />
                <Bar dataKey="Total" fill={SERIES[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Latest support tickets" action={<Link to="/tickets" className="text-[13px] font-semibold text-brand-700 hover:underline">View all</Link>} />
          <ul className="mt-3 divide-y divide-ink-100">
            {db.tickets.slice(0, 6).map((t) => {
              const d = db.devices.find((x) => x.id === t.device_id)!;
              return (
                <li key={t.id}>
                  <Link to={`/tickets?open=${t.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink-50">
                    <span className={cx("h-2 w-2 shrink-0 rounded-full", t.priority === "critical" ? "bg-red-600" : t.priority === "high" ? "bg-orange-500" : t.priority === "medium" ? "bg-blue-500" : "bg-ink-300")} title={`${t.priority} priority`} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink-900">{t.title}</div>
                      <div className="truncate text-xs text-ink-500"><span className="font-mono">{t.number}</span> · {d.brand} {d.model} · {person(t.reporter)?.name}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1"><StatusBadge value={t.status} /><span className="text-[11px] text-ink-400">{ago(t.created)}</span></div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Refresh pipeline" subtitle="Leases ending soonest" action={<Link to="/procurement" className="text-[13px] font-semibold text-brand-700 hover:underline">Plan refresh</Link>} />
          <ul className="mt-3 divide-y divide-ink-100">
            {[...m.dueRefresh].sort((a, b) => a.lease_end.localeCompare(b.lease_end)).slice(0, 6).map((d) => {
              const days = daysFromNow(d.lease_end);
              return (
                <li key={d.id}>
                  <Link to={`/devices/${d.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink-50">
                    <div className="grid w-12 shrink-0 place-items-center rounded-lg bg-ink-50 py-1 text-center">
                      <div className="text-sm font-bold tabular text-ink-900">{days}</div><div className="text-[10px] uppercase text-ink-500">days</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink-900">{d.brand} {d.model}</div>
                      <div className="truncate text-xs text-ink-500"><span className="font-mono">{d.asset_tag}</span> · {person(d.assigned_to)?.name ?? "Unassigned"}</div>
                    </div>
                    <span className="text-xs text-ink-500">Ends {fmtShort(d.lease_end)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
