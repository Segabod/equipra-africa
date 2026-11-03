import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { HeartPulse, BatteryWarning, AlertTriangle, Activity } from "lucide-react";
import { useStore } from "../data/store";
import { Card, CardHeader, Meter, PageHeader, Stat, StatusBadge, TD, TH } from "../components/ui";
import { AXIS, GRID, STATUS, TipBox } from "../components/charts";

export default function Health() {
  const { db, person } = useStore();
  const fleet = db.devices.filter((d) => d.status !== "retired");
  const avg = Math.round(fleet.reduce((a, d) => a + d.health, 0) / fleet.length);
  const buckets = [
    { name: "Under 50", min: 0, max: 50, color: STATUS.critical }, { name: "50–65", min: 50, max: 66, color: STATUS.serious },
    { name: "66–80", min: 66, max: 81, color: "#2a78d6" }, { name: "81–90", min: 81, max: 91, color: STATUS.good }, { name: "91–100", min: 91, max: 101, color: STATUS.good },
  ].map((b) => ({ ...b, Devices: fleet.filter((d) => d.health >= b.min && d.health < b.max).length }));
  const models = [...new Set(fleet.map((d) => `${d.brand} ${d.model}`))].map((m) => {
    const ds = fleet.filter((d) => `${d.brand} ${d.model}` === m);
    return { name: m, "Avg health": Math.round(ds.reduce((a, d) => a + d.health, 0) / ds.length), n: ds.length };
  }).sort((a, b) => b["Avg health"] - a["Avg health"]);
  const weakBattery = fleet.filter((d) => d.battery < 70);
  const worst = [...fleet].sort((a, b) => a.health - b.health).slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader title="Device health" subtitle="Telemetry from the Equipra agent on every device: battery wear, storage health, thermals and crash rates, rolled into one score." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat icon={HeartPulse} label="Fleet health score" value={avg} sub="Average across active devices" />
        <Stat icon={Activity} tone="teal" label="Healthy devices" value={fleet.filter((d) => d.health > 80).length} sub="Score above 80" />
        <Stat icon={AlertTriangle} tone="red" label="Needs attention" value={fleet.filter((d) => d.health <= 65).length} sub="Score 65 or below" />
        <Stat icon={BatteryWarning} tone="amber" label="Worn batteries" value={weakBattery.length} sub="Below 70% capacity" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Health score distribution" subtitle="Number of devices in each band" />
          <div className="h-64 px-2 pb-4 pt-4">
            <ResponsiveContainer>
              <BarChart data={buckets} margin={{ top: 8, right: 12, left: -16, bottom: 0 }} barCategoryGap="22%">
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<TipBox labelFmt={(l) => `Score ${l}`} />} cursor={{ fill: "#F6F8FA" }} />
                <Bar dataKey="Devices" radius={[4, 4, 0, 0]}>{buckets.map((b) => <Cell key={b.name} fill={b.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Average health by model" subtitle="Older models age faster under daily load" />
          <div className="h-64 px-2 pb-4 pt-4">
            <ResponsiveContainer>
              <BarChart data={models} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }} barCategoryGap="20%">
                <CartesianGrid stroke={GRID} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ ...AXIS, fontSize: 10.5 }} axisLine={false} tickLine={false} width={140} />
                <Tooltip content={<TipBox />} cursor={{ fill: "#F6F8FA" }} />
                <Bar dataKey="Avg health" fill="#2a78d6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader title="Lowest-scoring devices" subtitle="Candidates for proactive replacement" action={<Link to="/predictive" className="text-[13px] font-semibold text-brand-700 hover:underline">See predictions</Link>} />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full">
            <thead className="border-y border-ink-100 bg-ink-50/60"><tr><TH>Device</TH><TH>User</TH><TH>Health</TH><TH>Battery</TH><TH>Weak component</TH><TH>Risk</TH></tr></thead>
            <tbody className="divide-y divide-ink-100">
              {worst.map((d) => (
                <tr key={d.id} className="hover:bg-ink-50/70">
                  <TD><Link to={`/devices/${d.id}`} className="font-semibold text-ink-900 hover:text-brand-700">{d.brand} {d.model}</Link><div className="font-mono text-xs text-ink-500">{d.asset_tag}</div></TD>
                  <TD className="whitespace-nowrap">{person(d.assigned_to)?.name ?? <span className="text-ink-400">In stock</span>}</TD>
                  <TD><Meter value={d.health} /></TD>
                  <TD className="tabular">{d.battery}%</TD>
                  <TD>{d.risk_component ?? "—"}</TD>
                  <TD><StatusBadge value={d.risk} /></TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
