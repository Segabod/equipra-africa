import { useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, CalendarCheck, ShieldAlert, Timer, Sparkles, Check } from "lucide-react";
import { useStore } from "../data/store";
import { Button, Card, CardHeader, PageHeader, Stat, StatusBadge, TD, TH, Tabs, cx } from "../components/ui";
import { naira, pct } from "../lib/format";

const ACTION: Record<string, string> = {
  Battery: "Replace battery onsite", SSD: "Back up and swap device", Keyboard: "Replace keyboard deck", Hinge: "Hinge repair at depot",
  "Cooling fan": "Clean and replace fan", Display: "Swap display panel",
};

export default function Predictive() {
  const { db, person, createTicket } = useStore();
  const [risk, setRisk] = useState<"all" | "critical" | "high" | "medium">("all");
  const [scheduled, setScheduled] = useState<Set<string>>(new Set());
  const fleet = db.devices.filter((d) => d.status === "deployed" && d.risk !== "low");
  const list = fleet.filter((d) => risk === "all" || d.risk === risk).sort((a, b) => b.failure_probability - a.failure_probability);
  const expected = fleet.reduce((a, d) => a + d.failure_probability, 0);
  const downtimeAvoided = Math.round(expected * 2.6 * 8);
  const byComp = Object.entries(fleet.reduce<Record<string, number>>((a, d) => { if (d.risk_component) a[d.risk_component] = (a[d.risk_component] ?? 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]);
  const maxComp = Math.max(...byComp.map((c) => c[1]));

  const schedule = (id: string) => {
    const d = db.devices.find((x) => x.id === id)!;
    createTicket({ device_id: id, title: `Proactive: ${ACTION[d.risk_component ?? "SSD"] ?? "Inspect device"}`, category: "Hardware", priority: d.risk === "critical" ? "high" : "medium", description: `Predictive model flags ${d.risk_component} with ${pct(d.failure_probability)} failure probability in the next 90 days.` });
    setScheduled((s) => new Set(s).add(id));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Predictive maintenance" subtitle="Our model scores every device daily on telemetry and repair history, and tells you what will fail before your people notice."
        actions={<Button icon={Sparkles} onClick={() => list.filter((d) => d.risk === "critical" && !scheduled.has(d.id)).forEach((d) => schedule(d.id))}>Schedule all critical</Button>} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat icon={ShieldAlert} tone="red" label="Critical risk" value={fleet.filter((d) => d.risk === "critical").length} sub="Above 58% failure probability" />
        <Stat icon={BrainCircuit} tone="amber" label="Expected failures" value={expected.toFixed(1)} sub="Next 90 days, if no action" />
        <Stat icon={Timer} tone="teal" label="Downtime avoidable" value={`${downtimeAvoided}h`} sub="Employee hours" />
        <Stat icon={CalendarCheck} tone="violet" label="Cost avoided" value={naira(Math.round(expected * 185000), true)} sub="vs. reactive repair" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="flex flex-col gap-3 border-b border-ink-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-[15px] font-semibold">Predicted failures</h3>
            <Tabs value={risk} onChange={setRisk} items={[{ value: "all", label: "All" }, { value: "critical", label: "Critical" }, { value: "high", label: "High" }, { value: "medium", label: "Medium" }]} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-ink-100 bg-ink-50/60"><tr><TH>Device</TH><TH>Probability</TH><TH>Component</TH><TH>Recommended action</TH><TH className="text-right">Action</TH></tr></thead>
              <tbody className="divide-y divide-ink-100">
                {list.slice(0, 20).map((d) => (
                  <tr key={d.id}>
                    <TD><Link to={`/devices/${d.id}`} className="font-semibold text-ink-900 hover:text-brand-700">{d.brand} {d.model}</Link><div className="text-xs text-ink-500"><span className="font-mono">{d.asset_tag}</span> · {person(d.assigned_to)?.name}</div></TD>
                    <TD><div className="flex items-center gap-2"><StatusBadge value={d.risk} /><span className="font-semibold tabular text-ink-900">{pct(d.failure_probability)}</span></div></TD>
                    <TD>{d.risk_component}</TD>
                    <TD className="text-ink-600">{ACTION[d.risk_component ?? ""] ?? "Inspect"}</TD>
                    <TD className="text-right">{scheduled.has(d.id) ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><Check className="h-4 w-4" />Scheduled</span> : <Button size="sm" variant="secondary" onClick={() => schedule(d.id)}>Schedule</Button>}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader title="Failure drivers" subtitle="Weakest component on at-risk devices" />
            <ul className="space-y-3 p-5">
              {byComp.map(([c, n]) => (
                <li key={c}>
                  <div className="flex justify-between text-sm"><span className="text-ink-700">{c}</span><span className="font-semibold tabular">{n}</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-ink-100"><div className="h-full rounded-full bg-[#2a78d6]" style={{ width: `${(n / maxComp) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="bg-ink-900 p-5 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-300"><Sparkles className="h-4 w-4" />Model insight</div>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">Battery wear is the leading driver. Devices in Lagos and Port Harcourt show <span className="font-semibold text-white">31% faster</span> battery decline, consistent with heat and unstable grid power. Surge-protected charging at those sites would cut predicted failures by about a fifth.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
