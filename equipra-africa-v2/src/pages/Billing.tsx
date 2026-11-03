import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Receipt, Wallet, CalendarClock, Building2, Download, CreditCard } from "lucide-react";
import { useStore } from "../data/store";
import type { Invoice } from "../data/seed";
import { COMPANY } from "../data/seed";
import { Button, Card, CardHeader, Drawer, PageHeader, Stat, StatusBadge, TD, TH } from "../components/ui";
import { AXIS, GRID, SERIES, TipBox } from "../components/charts";
import { fmtDate, naira } from "../lib/format";
import { groupSum } from "../lib/metrics";

export default function Billing() {
  const { db, toast } = useStore();
  const [inv, setInv] = useState<Invoice | null>(null);
  const active = db.devices.filter((d) => d.status !== "retired");
  const byDept = groupSum(active, (d) => d.department, (d) => d.monthly_rate);
  const byClass = groupSum(active, (d) => d.device_class, (d) => d.monthly_rate);
  const current = db.invoices[0];
  const ytd = db.invoices.filter((i) => new Date(i.period).getFullYear() === new Date().getFullYear()).reduce((a, i) => a + i.total, 0);

  const lines = (i: Invoice) => {
    const share = (cls: string) => (byClass.find((b) => b.name === cls)?.value ?? 0) / byClass.reduce((a, b) => a + b.value, 0);
    return [
      { item: "Standard bundle subscriptions", amount: Math.round(i.subtotal * share("standard") * 0.94) },
      { item: "Developer bundle subscriptions", amount: Math.round(i.subtotal * share("developer") * 0.94) },
      { item: "Executive bundle subscriptions", amount: Math.round(i.subtotal * share("executive") * 0.94) },
      { item: "Accessories and peripherals", amount: Math.round(i.subtotal * 0.04) },
      { item: "Onsite support and logistics", amount: Math.round(i.subtotal * 0.02) },
    ];
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" subtitle="One consolidated monthly invoice for every device, accessory and service." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat icon={Receipt} tone="amber" label="Current invoice" value={naira(current.total, true)} sub={`Due ${fmtDate(current.due)}`} />
        <Stat icon={Wallet} label="Monthly run-rate" value={naira(byDept.reduce((a, b) => a + b.value, 0), true)} sub="Excl. VAT" />
        <Stat icon={CalendarClock} tone="blue" label="Billed this year" value={naira(ytd, true)} sub="Incl. VAT" />
        <Stat icon={Building2} tone="violet" label="Plan" value="Enterprise" sub={COMPANY.plan.split("·")[1]?.trim()} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-1">
          <div className="bg-ink-900 p-5 text-white">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">Amount due</div>
            <div className="mt-1 text-3xl font-extrabold tabular">{naira(current.total)}</div>
            <div className="mt-1 text-sm text-ink-300">{current.number} · due {fmtDate(current.due)}</div>
            <div className="mt-4 flex gap-2">
              <Button variant="primary" icon={CreditCard} onClick={() => toast("Payments are disabled in the demo")}>Pay now</Button>
              <Button variant="secondary" onClick={() => setInv(current)}>View</Button>
            </div>
          </div>
          <div className="space-y-3 p-5 text-sm">
            <div className="flex justify-between"><span className="text-ink-500">Billing contact</span><span className="font-semibold">finance@zenara.example</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Payment method</span><span className="font-semibold">Bank transfer</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Account manager</span><span className="font-semibold">{COMPANY.account_manager}</span></div>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Monthly cost by department" subtitle="Current subscriptions, excl. VAT" />
          <div className="h-72 px-2 pb-4 pt-4">
            <ResponsiveContainer>
              <BarChart data={byDept} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }} barCategoryGap="22%">
                <CartesianGrid stroke={GRID} horizontal={false} />
                <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => naira(v, true)} />
                <YAxis type="category" dataKey="name" tick={AXIS} axisLine={false} tickLine={false} width={120} />
                <Tooltip content={<TipBox fmt={(v) => naira(v)} />} cursor={{ fill: "#F6F8FA" }} />
                <Bar dataKey="value" name="Monthly" fill={SERIES[0]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Invoices" subtitle="Last 12 months" />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full">
            <thead className="border-y border-ink-100 bg-ink-50/60"><tr><TH>Invoice</TH><TH>Period</TH><TH>Devices</TH><TH>Status</TH><TH className="text-right">Subtotal</TH><TH className="text-right">VAT</TH><TH className="text-right">Total</TH><TH /></tr></thead>
            <tbody className="divide-y divide-ink-100">
              {db.invoices.map((i) => (
                <tr key={i.id} onClick={() => setInv(i)} className="cursor-pointer hover:bg-ink-50/70">
                  <TD className="font-mono text-[12.5px] font-medium text-brand-800">{i.number}</TD>
                  <TD className="whitespace-nowrap">{new Date(i.period).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</TD>
                  <TD className="tabular">{i.devices}</TD>
                  <TD><StatusBadge value={i.status} /></TD>
                  <TD className="text-right tabular">{naira(i.subtotal)}</TD>
                  <TD className="text-right tabular text-ink-500">{naira(i.vat)}</TD>
                  <TD className="text-right font-semibold tabular text-ink-900">{naira(i.total)}</TD>
                  <TD className="text-right"><Download className="ml-auto h-4 w-4 text-ink-400" /></TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Drawer open={!!inv} onClose={() => setInv(null)} title={inv?.number} subtitle={inv && new Date(inv.period).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        footer={<Button variant="secondary" icon={Download} onClick={() => window.print()}>Print / save PDF</Button>}>
        {inv && (
          <div>
            <div className="flex items-start justify-between">
              <div><div className="text-sm font-bold">EquipraAfrica Ltd</div><div className="text-xs text-ink-500">Victoria Island, Lagos · TIN 00000000-0001</div></div>
              <StatusBadge value={inv.status} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-ink-50 p-4 text-sm">
              <div><div className="text-xs text-ink-500">Billed to</div><div className="font-semibold">{COMPANY.name}</div><div className="text-xs text-ink-500">{COMPANY.hq}</div></div>
              <div><div className="text-xs text-ink-500">Issued / due</div><div className="font-semibold">{fmtDate(inv.issued)}</div><div className="text-xs text-ink-500">Due {fmtDate(inv.due)}</div></div>
            </div>
            <table className="mt-5 w-full text-sm">
              <thead><tr className="border-b border-ink-200 text-left text-xs text-ink-500"><th className="pb-2 font-semibold">Item</th><th className="pb-2 text-right font-semibold">Amount</th></tr></thead>
              <tbody className="divide-y divide-ink-100">
                {lines(inv).map((l) => <tr key={l.item}><td className="py-2.5">{l.item}</td><td className="py-2.5 text-right tabular">{naira(l.amount)}</td></tr>)}
              </tbody>
            </table>
            <div className="mt-3 space-y-1.5 border-t border-ink-200 pt-3 text-sm">
              <div className="flex justify-between"><span className="text-ink-500">Subtotal</span><span className="tabular">{naira(inv.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-ink-500">VAT (7.5%)</span><span className="tabular">{naira(inv.vat)}</span></div>
              <div className="flex justify-between pt-1 text-base font-bold"><span>Total</span><span className="tabular">{naira(inv.total)}</span></div>
            </div>
            <p className="mt-6 text-xs text-ink-400">Sample invoice generated for demonstration purposes.</p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
