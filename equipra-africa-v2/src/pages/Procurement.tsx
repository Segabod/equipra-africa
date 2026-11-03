import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarRange, TrendingUp, PiggyBank, PackageCheck, Lightbulb, ArrowRight } from "lucide-react";
import { useStore } from "../data/store";
import { Button, Card, CardHeader, PageHeader, Stat, cx } from "../components/ui";
import { AXIS, GRID, Legend, SERIES, TipBox } from "../components/charts";
import { naira } from "../lib/format";

export default function Procurement() {
  const { db } = useStore();
  const now = new Date();
  const deployed = db.devices.filter((d) => d.status === "deployed");
  const months = Array.from({ length: 6 }, (_, i) => {
    const s = new Date(now.getFullYear(), now.getMonth() + i, 1), e = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    const ending = deployed.filter((d) => { const t = new Date(d.lease_end); return t >= s && t < e; });
    return { month: s.toLocaleDateString("en-GB", { month: "short" }), Standard: ending.filter((d) => d.device_class === "standard").length, Developer: ending.filter((d) => d.device_class === "developer").length, Executive: ending.filter((d) => d.device_class === "executive").length };
  });
  const refreshTotal = months.reduce((a, m) => a + m.Standard + m.Developer + m.Executive, 0);
  const recentHires = db.requests.filter((r) => r.request_type === "new_hire" && Date.now() - new Date(r.created).getTime() < 90 * 864e5).reduce((a, r) => a + r.quantity, 0);
  const forecast = refreshTotal + Math.round(recentHires * 1.1);
  const stock = db.devices.filter((d) => d.status === "in_stock");
  const execLowUse = deployed.filter((d) => d.device_class === "executive" && !["Executive Office", "Legal"].includes(d.department));
  const saving = execLowUse.length * 18000;

  const recs = [
    { title: `Re-tier ${execLowUse.length} executive devices`, body: "Executive bundles are assigned outside leadership roles. Moving them to Standard at refresh keeps experience while cutting cost.", value: `${naira(saving)}/mo`, tone: "teal" },
    { title: `Redeploy ${stock.length} devices in stock`, body: "Use idle stock for upcoming new hires before ordering new units. Most are under 18 months old.", value: `${stock.length} units`, tone: "blue" },
    { title: "Bundle Q1 refresh into one order", body: "Consolidating refresh orders for the next quarter qualifies for volume pricing from Dell and Lenovo.", value: "≈ 6% off", tone: "violet" },
  ];
  const windows = [
    { when: "Mid-January", why: "OEM fiscal year-end pricing on Dell and HP; best time for standard bundles." },
    { when: "Late March", why: "Apple education and enterprise refresh; MacBook Pro lead times drop to 5 days." },
    { when: "Avoid December", why: "Port congestion in Apapa adds 2 to 3 weeks to deliveries." },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Procurement planning" subtitle="Lease expiries, hiring demand and pricing signals in one forecast, so you order the right devices at the right time." actions={<Link to="/requests?tab=new"><Button icon={ArrowRight}>Raise a refresh order</Button></Link>} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat icon={CalendarRange} tone="violet" label="Refreshes due" value={refreshTotal} sub="Next 6 months" />
        <Stat icon={TrendingUp} tone="blue" label="Forecast demand" value={forecast} sub="Refresh + hiring, next 6 months" />
        <Stat icon={PackageCheck} tone="teal" label="Available stock" value={stock.length} sub="Ready to deploy" />
        <Stat icon={PiggyBank} tone="amber" label="Savings identified" value={naira(saving, true)} sub="Per month" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Lease expiries by month" subtitle="Devices that need replacing, by bundle" />
          <div className="px-5 pt-3"><Legend items={[{ label: "Standard", color: SERIES[0] }, { label: "Developer", color: SERIES[1] }, { label: "Executive", color: SERIES[2] }]} /></div>
          <div className="h-64 px-2 pb-4 pt-2">
            <ResponsiveContainer>
              <BarChart data={months} margin={{ top: 8, right: 12, left: -16, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<TipBox />} cursor={{ fill: "#F6F8FA" }} />
                <Bar dataKey="Standard" stackId="a" fill={SERIES[0]} stroke="#fff" strokeWidth={1} />
                <Bar dataKey="Developer" stackId="a" fill={SERIES[1]} stroke="#fff" strokeWidth={1} />
                <Bar dataKey="Executive" stackId="a" fill={SERIES[2]} stroke="#fff" strokeWidth={1} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Best times to buy" subtitle="Based on OEM pricing and logistics" />
          <ul className="space-y-4 p-5">
            {windows.map((w, i) => (
              <li key={w.when} className="flex gap-3">
                <span className={cx("mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full", i === 2 ? "bg-red-500" : "bg-brand-600")} />
                <div><div className="text-sm font-semibold">{w.when}</div><div className="text-[13px] text-ink-500">{w.why}</div></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-[15px] font-semibold"><Lightbulb className="h-4 w-4 text-amber-500" />Cost optimisation</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {recs.map((r) => (
            <Card key={r.title} className="flex flex-col p-5">
              <div className="text-sm font-semibold">{r.title}</div>
              <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink-500">{r.body}</p>
              <div className="mt-4 text-xl font-extrabold tabular text-brand-700">{r.value}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
