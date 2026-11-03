import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useStore } from "../data/store";
import { Card, CardHeader, PageHeader, Tabs, TD, TH } from "../components/ui";
import { AXIS, GRID, Legend, SERIES, TipBox } from "../components/charts";
import { fleetMetrics, groupCount, metSla, weeklyTickets } from "../lib/metrics";
import { label, naira, pct } from "../lib/format";

type T = "inventory" | "support" | "fulfilment";

function HBar({ data, color = SERIES[0], fmt, height = 260 }: { data: { name: string; value: number }[]; color?: string; fmt?: (v: number) => string; height?: number }) {
  return (
    <div className="px-2 pb-4 pt-4" style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} tickFormatter={fmt} />
          <YAxis type="category" dataKey="name" tick={AXIS} axisLine={false} tickLine={false} width={124} />
          <Tooltip content={<TipBox fmt={fmt} />} cursor={{ fill: "#F6F8FA" }} />
          <Bar dataKey="value" name="Value" fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Analytics() {
  const { db } = useStore();
  const [tab, setTab] = useState<T>("inventory");
  const m = fleetMetrics(db);
  const weekly = weeklyTickets(db, 16);

  const byModel = groupCount(m.active, (d) => `${d.brand} ${d.model}`);
  const byDept = groupCount(m.active, (d) => d.department);
  const byLoc = groupCount(m.active, (d) => d.location);
  const byCat = groupCount(db.tickets, (t) => t.category);
  const slaByPrio = ["critical", "high", "medium", "low"].map((p) => { const r = db.tickets.filter((t) => t.priority === p && t.resolved); return { name: label(p), value: r.length ? r.filter(metSla).length / r.length : 0, n: r.length }; });
  const techs = groupCount(db.tickets.filter((t) => t.technician && t.resolved), (t) => t.technician!);
  const reqMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 5 + i); const e = new Date(d); e.setMonth(e.getMonth() + 1);
    const r = db.requests.filter((x) => { const t = new Date(x.created); return t >= d && t < e; });
    return { month: d.toLocaleDateString("en-GB", { month: "short" }), Requested: r.reduce((a, x) => a + x.quantity, 0), Delivered: r.filter((x) => x.status === "delivered").reduce((a, x) => a + x.quantity, 0) };
  });
  const byType = groupCount(db.requests, (r) => label(r.request_type));

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Fleet, support and fulfilment reporting for IT, finance and leadership." />
      <Tabs value={tab} onChange={setTab} items={[{ value: "inventory", label: "Inventory" }, { value: "support", label: "Support" }, { value: "fulfilment", label: "Fulfilment" }]} />

      {tab === "inventory" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardHeader title="Devices by model" subtitle={`${m.active.length} active devices`} /><HBar data={byModel} height={340} /></Card>
          <Card><CardHeader title="Devices by department" /><HBar data={byDept} height={340} /></Card>
          <Card className="lg:col-span-2">
            <CardHeader title="Footprint by location" subtitle="Devices, utilisation and monthly cost per site" />
            <div className="mt-3 overflow-x-auto">
              <table className="w-full">
                <thead className="border-y border-ink-100 bg-ink-50/60"><tr><TH>Location</TH><TH className="text-right">Devices</TH><TH className="text-right">Deployed</TH><TH className="text-right">Avg health</TH><TH className="text-right">Monthly cost</TH></tr></thead>
                <tbody className="divide-y divide-ink-100">
                  {byLoc.map((l) => { const ds = m.active.filter((d) => d.location === l.name); return (
                    <tr key={l.name}><TD className="font-medium text-ink-900">{l.name}</TD><TD className="text-right tabular">{l.value}</TD><TD className="text-right tabular">{pct(ds.filter((d) => d.status === "deployed").length / ds.length)}</TD><TD className="text-right tabular">{Math.round(ds.reduce((a, d) => a + d.health, 0) / ds.length)}</TD><TD className="text-right font-semibold tabular">{naira(ds.reduce((a, d) => a + d.monthly_rate, 0))}</TD></tr>
                  ); })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab === "support" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader title="Ticket volume" subtitle="Last 16 weeks" />
            <div className="px-5 pt-3"><Legend items={[{ label: "Opened", color: SERIES[1] }, { label: "Resolved", color: SERIES[0] }]} /></div>
            <div className="h-64 px-2 pb-4 pt-2">
              <ResponsiveContainer>
                <LineChart data={weekly} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="week" tick={AXIS} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<TipBox labelFmt={(l) => `Week ending ${l}`} />} cursor={{ stroke: "#B4C0CB" }} />
                  <Line dataKey="Opened" stroke={SERIES[1]} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }} />
                  <Line dataKey="Resolved" stroke={SERIES[0]} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card><CardHeader title="Tickets by category" /><HBar data={byCat} /></Card>
          <Card>
            <CardHeader title="SLA met by priority" subtitle="Share of resolved tickets inside target" />
            <ul className="space-y-4 p-5">
              {slaByPrio.map((s) => (
                <li key={s.name}>
                  <div className="flex justify-between text-sm"><span>{s.name}</span><span className="font-semibold tabular">{pct(s.value, 1)} <span className="font-normal text-ink-500">of {s.n}</span></span></div>
                  <div className="mt-1 h-2 rounded-full bg-ink-100"><div className="h-full rounded-full" style={{ width: `${s.value * 100}%`, background: s.value >= 0.9 ? "#0ca30c" : "#ec835a" }} /></div>
                </li>
              ))}
            </ul>
            <div className="border-t border-ink-100 px-5 py-4 text-sm"><div className="mb-2 font-semibold">Resolved by technician</div>{techs.map((t) => <div key={t.name} className="flex justify-between py-0.5"><span className="text-ink-600">{t.name}</span><span className="font-semibold tabular">{t.value}</span></div>)}</div>
          </Card>
        </div>
      )}

      {tab === "fulfilment" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader title="Devices requested vs delivered" subtitle="By month the request was raised" />
            <div className="px-5 pt-3"><Legend items={[{ label: "Requested", color: SERIES[0] }, { label: "Delivered", color: SERIES[2] }]} /></div>
            <div className="h-64 px-2 pb-4 pt-2">
              <ResponsiveContainer>
                <BarChart data={reqMonths} margin={{ top: 8, right: 12, left: -16, bottom: 0 }} barGap={2} barCategoryGap="28%">
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<TipBox />} cursor={{ fill: "#F6F8FA" }} />
                  <Bar dataKey="Requested" fill={SERIES[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Delivered" fill={SERIES[2]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card><CardHeader title="Requests by type" /><HBar data={byType} height={220} /></Card>
          <Card className="p-5">
            <h3 className="text-[15px] font-semibold">Fulfilment performance</h3>
            <dl className="mt-4 grid grid-cols-2 gap-5">
              {[["Avg approval time", "1.8 days"], ["Avg delivery time", "4.6 days"], ["Approval rate", pct(db.requests.filter((r) => r.status !== "rejected" && r.status !== "pending_approval").length / Math.max(1, db.requests.filter((r) => r.status !== "pending_approval").length))], ["Delivered on time", "94%"]].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-ink-500">{k}</dt><dd className="mt-0.5 text-2xl font-extrabold tabular">{v}</dd></div>
              ))}
            </dl>
          </Card>
        </div>
      )}
    </div>
  );
}
