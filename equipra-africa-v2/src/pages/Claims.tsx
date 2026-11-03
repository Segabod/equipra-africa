import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Plus, ShieldCheck, FileClock, Banknote, Percent, Check } from "lucide-react";
import { useStore } from "../data/store";
import type { Claim, ClaimStatus } from "../data/seed";
import { Button, Card, CardHeader, Drawer, DL, Empty, Field, Input, PageHeader, Select, Stat, StatusBadge, Tabs, TD, TH, Textarea, cx } from "../components/ui";
import { AXIS, GRID, Legend, SERIES, TipBox } from "../components/charts";
import { fmtDate, label, naira, pct } from "../lib/format";
import { groupCount } from "../lib/metrics";

const FLOW: ClaimStatus[] = ["submitted", "under_review", "approved", "paid"];

function Analytics({ claims }: { claims: Claim[] }) {
  const byType = groupCount(claims, (c) => label(c.incident_type));
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 5 + i);
    const e = new Date(d); e.setMonth(e.getMonth() + 1);
    const inM = claims.filter((c) => { const t = new Date(c.created); return t >= d && t < e; });
    return { month: d.toLocaleDateString("en-GB", { month: "short" }), Claimed: inM.reduce((a, c) => a + c.claim_amount, 0), Paid: inM.filter((c) => c.status === "paid").reduce((a, c) => a + c.approved_amount, 0) };
  });
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Claimed vs paid" subtitle="By month the claim was filed" />
        <div className="px-5 pt-3"><Legend items={[{ label: "Claimed", color: SERIES[0] }, { label: "Paid", color: SERIES[2] }]} /></div>
        <div className="h-64 px-2 pb-4 pt-2">
          <ResponsiveContainer>
            <BarChart data={months} margin={{ top: 8, right: 12, left: -4, bottom: 0 }} barGap={2} barCategoryGap="26%">
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => naira(v, true)} width={52} />
              <Tooltip content={<TipBox fmt={(v) => naira(v)} />} cursor={{ fill: "#F6F8FA" }} />
              <Bar dataKey="Claimed" fill={SERIES[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Paid" fill={SERIES[2]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <CardHeader title="Incidents by type" subtitle="All claims on record" />
        <ul className="space-y-3.5 p-5">
          {byType.map((t) => (
            <li key={t.name}>
              <div className="flex justify-between text-sm"><span className="text-ink-700">{t.name}</span><span className="font-semibold tabular">{t.value} <span className="font-normal text-ink-500">· {pct(t.value / claims.length)}</span></span></div>
              <div className="mt-1 h-2 rounded-full bg-ink-100"><div className="h-full rounded-full bg-[#2a78d6]" style={{ width: `${(t.value / byType[0].value) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default function Claims() {
  const { db, person, createClaim, updateClaim } = useStore();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "analytics" ? "analytics" : "claims";
  const [open, setOpen] = useState<string | null>(null);
  const isNew = params.get("new") === "1";
  const claims = db.claims;
  const paid = claims.filter((c) => c.status === "paid");
  const decided = claims.filter((c) => ["approved", "paid", "rejected"].includes(c.status));
  const approvalRate = decided.filter((c) => c.status !== "rejected").length / Math.max(1, decided.length);
  const claim = open ? claims.find((c) => c.id === open) : undefined;
  const devices = db.devices.filter((d) => d.assigned_to);
  const [form, setForm] = useState({ device_id: params.get("device") ?? devices[0].id, incident_type: "accidental_damage" as Claim["incident_type"], incident_date: new Date().toISOString().slice(0, 10), location: "Lagos · Victoria Island", description: "", claim_amount: 650000, police_report: "" });
  const sorted = useMemo(() => claims, [claims]);

  return (
    <div className="space-y-6">
      <PageHeader title="Insurance claims" subtitle="Every device is insured against theft, loss and damage. File a claim here and we handle the insurer." actions={<Button icon={Plus} onClick={() => setParams({ new: "1" })}>File a claim</Button>} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat icon={FileClock} tone="amber" label="Open claims" value={claims.filter((c) => c.status === "submitted" || c.status === "under_review").length} sub="Submitted or under review" />
        <Stat icon={Banknote} tone="teal" label="Paid out" value={naira(paid.reduce((a, c) => a + c.approved_amount, 0), true)} sub={`${paid.length} claims settled`} />
        <Stat icon={Percent} tone="blue" label="Approval rate" value={pct(approvalRate)} sub="Of decided claims" />
        <Stat icon={ShieldCheck} tone="violet" label="Avg settlement" value="11 days" sub="Filing to payout" />
      </div>
      <Tabs value={tab} onChange={(v) => setParams(v === "analytics" ? { tab: "analytics" } : {})} items={[{ value: "claims", label: "Claims", count: claims.length }, { value: "analytics", label: "Analytics" }]} />
      {tab === "analytics" ? <Analytics claims={claims} /> : (
        <Card>
          {sorted.length === 0 ? <Empty title="No claims yet" /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-ink-100 bg-ink-50/60"><tr><TH>Claim</TH><TH>Incident</TH><TH>Device</TH><TH>Claimant</TH><TH>Status</TH><TH className="text-right">Amount</TH></tr></thead>
                <tbody className="divide-y divide-ink-100">
                  {sorted.map((c) => { const d = db.devices.find((x) => x.id === c.device_id)!; return (
                    <tr key={c.id} onClick={() => setOpen(c.id)} className="cursor-pointer hover:bg-ink-50/70">
                      <TD><div className="font-mono text-[12.5px] font-medium text-brand-800">{c.number}</div><div className="text-xs text-ink-500">{fmtDate(c.created)}</div></TD>
                      <TD><div className="font-semibold text-ink-900">{label(c.incident_type)}</div><div className="max-w-[240px] truncate text-xs text-ink-500">{c.description}</div></TD>
                      <TD className="whitespace-nowrap">{d.brand} {d.model}<div className="font-mono text-xs text-ink-500">{d.asset_tag}</div></TD>
                      <TD className="whitespace-nowrap">{person(c.claimant)?.name}</TD>
                      <TD><StatusBadge value={c.status} /></TD>
                      <TD className="text-right"><div className="font-semibold tabular text-ink-900">{naira(c.claim_amount)}</div>{c.approved_amount > 0 && <div className="text-xs tabular text-emerald-700">{naira(c.approved_amount)} approved</div>}</TD>
                    </tr>
                  ); })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Drawer open={!!claim} onClose={() => setOpen(null)} title={claim ? label(claim.incident_type) : ""} subtitle={claim && <span className="font-mono">{claim.number}</span>}
        footer={claim && claim.status !== "paid" && claim.status !== "rejected" ? <>
          <Button variant="danger" onClick={() => updateClaim(claim.id, "rejected")}>Reject</Button>
          <Button icon={Check} onClick={() => updateClaim(claim.id, FLOW[FLOW.indexOf(claim.status) + 1])}>Move to {label(FLOW[FLOW.indexOf(claim.status) + 1])}</Button>
        </> : undefined}>
        {claim && (
          <div className="space-y-6">
            <ol className="grid grid-cols-4 gap-1">
              {FLOW.map((s, i) => { const reached = claim.status !== "rejected" && FLOW.indexOf(claim.status) >= i; return (
                <li key={s}><div className={cx("h-1.5 rounded-full", reached ? "bg-brand-600" : "bg-ink-200")} /><div className={cx("mt-1.5 text-[11px] font-semibold", reached ? "text-ink-900" : "text-ink-400")}>{label(s)}</div></li>
              ); })}
            </ol>
            {claim.status === "rejected" && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-800">Rejected by the insurer. Excluded under the policy's unattended-vehicle clause.</div>}
            <DL items={[["Claimant", person(claim.claimant)?.name], ["Incident date", fmtDate(claim.incident_date)], ["Location", claim.location], ["Insurer reference", claim.insurer_ref], ["Police report", claim.police_report ?? "Not required"], ["Claimed", naira(claim.claim_amount)], ["Approved", claim.approved_amount ? naira(claim.approved_amount) : "—"], ["Status", label(claim.status)]]} />
            <div><div className="text-xs font-medium text-ink-500">What happened</div><p className="mt-1 text-sm">{claim.description}</p></div>
          </div>
        )}
      </Drawer>

      <Drawer open={isNew} onClose={() => setParams({})} title="File an insurance claim" subtitle="We submit it to the insurer and send a replacement device the same day."
        footer={<><Button variant="secondary" onClick={() => setParams({})}>Cancel</Button><Button disabled={!form.description.trim()} onClick={() => { const c = createClaim({ ...form, incident_date: new Date(form.incident_date).toISOString(), police_report: form.police_report || null }); setParams({}); setOpen(c.id); }}>Submit claim</Button></>}>
        <div className="space-y-4">
          <Field label="Device"><Select value={form.device_id} onChange={(e) => setForm({ ...form, device_id: e.target.value })}>{devices.map((d) => <option key={d.id} value={d.id}>{d.asset_tag} · {d.brand} {d.model} · {person(d.assigned_to)?.name}</option>)}</Select></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Incident type"><Select value={form.incident_type} onChange={(e) => setForm({ ...form, incident_type: e.target.value as Claim["incident_type"] })}>{["accidental_damage", "liquid_damage", "theft", "loss", "power_surge"].map((t) => <option key={t} value={t}>{label(t)}</option>)}</Select></Field>
            <Field label="Date"><Input type="date" value={form.incident_date} onChange={(e) => setForm({ ...form, incident_date: e.target.value })} /></Field>
          </div>
          <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <Field label="Estimated claim (₦)"><Input type="number" value={form.claim_amount} onChange={(e) => setForm({ ...form, claim_amount: +e.target.value })} /></Field>
          {(form.incident_type === "theft" || form.incident_type === "loss") && <Field label="Police report number" hint="Required for theft and loss"><Input value={form.police_report} onChange={(e) => setForm({ ...form, police_report: e.target.value })} placeholder="NPF/0000/26" /></Field>}
          <Field label="What happened?"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        </div>
      </Drawer>
    </div>
  );
}
