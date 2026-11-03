import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LifeBuoy, ShieldCheck, UserPlus, UserMinus, Laptop, BatteryMedium, HeartPulse, AlertTriangle, CalendarClock } from "lucide-react";
import { useStore } from "../data/store";
import { Avatar, Badge, Button, Card, CardHeader, DL, Drawer, Empty, Field, Input, StatusBadge, cx } from "../components/ui";
import { ago, daysFromNow, fmtDate, label, naira, pct } from "../lib/format";

export default function DeviceDetail() {
  const { id } = useParams();
  const { db, person, assignDevice } = useStore();
  const nav = useNavigate();
  const [assignOpen, setAssignOpen] = useState(false);
  const [q, setQ] = useState("");
  const d = db.devices.find((x) => x.id === id);
  if (!d) return <Card><Empty icon={Laptop} title="Device not found" action={<Button onClick={() => nav("/devices")}>Back to devices</Button>} /></Card>;

  const p = person(d.assigned_to);
  const tickets = db.tickets.filter((t) => t.device_id === d.id);
  const claims = db.claims.filter((c) => c.device_id === d.id);
  const activity = db.audit.filter((a) => a.target === d.asset_tag).slice(0, 8);
  const start = new Date(d.lease_start).getTime(), end = new Date(d.lease_end).getTime();
  const progress = Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
  const left = daysFromNow(d.lease_end);
  const unassigned = db.people.filter((x) => !db.devices.some((dv) => dv.assigned_to === x.id) && `${x.name} ${x.department}`.toLowerCase().includes(q.toLowerCase())).slice(0, 30);
  const riskTone = { low: "text-emerald-700 bg-emerald-50", medium: "text-blue-700 bg-blue-50", high: "text-orange-700 bg-orange-50", critical: "text-red-700 bg-red-50" }[d.risk];

  return (
    <div className="space-y-6">
      <Link to="/devices" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"><ArrowLeft className="h-4 w-4" />All devices</Link>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 bg-gradient-to-br from-ink-900 to-ink-800 p-6 text-white sm:flex-row sm:items-center">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 text-brand-400"><Laptop className="h-8 w-8" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm text-brand-300">{d.asset_tag}</span><StatusBadge value={d.status} /><Badge tone="gray" className="!bg-white/10 !text-ink-100 !ring-white/10">{label(d.device_class)}</Badge></div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{d.brand} {d.model}</h1>
            <div className="mt-1 text-sm text-ink-300">{d.processor} · {d.ram} · {d.storage} · {d.os}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={LifeBuoy} onClick={() => nav(`/tickets?new=1&device=${d.id}`)}>Log ticket</Button>
            <Button variant="secondary" icon={ShieldCheck} onClick={() => nav(`/claims?new=1&device=${d.id}`)}>File claim</Button>
            {p ? <Button variant="secondary" icon={UserMinus} onClick={() => assignDevice(d.id, null)}>Return to stock</Button>
               : <Button icon={UserPlus} onClick={() => setAssignOpen(true)} disabled={d.status === "retired"}>Assign</Button>}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <h3 className="mb-4 text-[15px] font-semibold">Specifications</h3>
            <DL items={[["Brand", d.brand], ["Model", d.model], ["Serial number", <span className="font-mono">{d.serial}</span>], ["Processor", d.processor], ["Memory", d.ram], ["Storage", d.storage], ["Display", d.screen], ["Operating system", d.os]]} />
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-[15px] font-semibold">Lease & warranty</h3><span className="text-sm font-bold tabular">{naira(d.monthly_rate)}<span className="text-xs font-medium text-ink-500"> /month</span></span></div>
            <div className="flex justify-between text-xs text-ink-500"><span>Started {fmtDate(d.lease_start)}</span><span>Ends {fmtDate(d.lease_end)}</span></div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink-100"><div className={cx("h-full rounded-full", left < 90 ? "bg-amber-500" : "bg-brand-600")} style={{ width: `${progress * 100}%` }} /></div>
            <div className="mt-2 text-sm text-ink-700">{left > 0 ? <><span className="font-semibold">{left} days</span> remaining · {pct(progress)} of term used</> : "Lease term complete"}</div>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-ink-100 pt-4 sm:grid-cols-3">
              <div><div className="text-xs text-ink-500">Warranty until</div><div className="text-sm font-semibold">{fmtDate(d.warranty_expiry)}</div></div>
              <div><div className="text-xs text-ink-500">Cost centre</div><div className="font-mono text-sm font-semibold">{d.cost_center}</div></div>
              <div><div className="text-xs text-ink-500">Insurance</div><div className="text-sm font-semibold text-emerald-700">Active</div></div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Support history" subtitle={`${tickets.length} tickets`} />
            {tickets.length === 0 ? <div className="px-5 py-8 text-sm text-ink-500">No tickets logged for this device.</div> : (
              <ul className="mt-3 divide-y divide-ink-100">
                {tickets.map((t) => (
                  <li key={t.id}><Link to={`/tickets?open=${t.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink-50">
                    <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{t.title}</div><div className="text-xs text-ink-500"><span className="font-mono">{t.number}</span> · {fmtDate(t.created)}</div></div>
                    <StatusBadge value={t.status} />
                  </Link></li>
                ))}
              </ul>
            )}
            {claims.length > 0 && (<>
              <div className="border-t border-ink-100 px-5 pb-1 pt-4 text-[13px] font-semibold text-ink-700">Insurance claims</div>
              <ul className="divide-y divide-ink-100">
                {claims.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 px-5 py-3"><div className="min-w-0 flex-1"><div className="text-sm font-semibold">{label(c.incident_type)}</div><div className="text-xs text-ink-500"><span className="font-mono">{c.number}</span> · {naira(c.claim_amount)}</div></div><StatusBadge value={c.status} /></li>
                ))}
              </ul>
            </>)}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-4 text-[15px] font-semibold">Assigned to</h3>
            {p ? (
              <div className="flex items-center gap-3"><Avatar name={p.name} size={44} /><div className="min-w-0"><div className="font-semibold">{p.name}</div><div className="truncate text-sm text-ink-500">{p.title}</div><div className="truncate text-xs text-ink-500">{p.email}</div></div></div>
            ) : <div className="text-sm text-ink-500">Not assigned. {d.status === "in_stock" ? "Ready to deploy." : ""}</div>}
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ink-100 pt-4 text-sm">
              <div><div className="text-xs text-ink-500">Department</div><div className="font-semibold">{d.department}</div></div>
              <div><div className="text-xs text-ink-500">Location</div><div className="font-semibold">{d.location}</div></div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 text-[15px] font-semibold">Health</h3>
            <div className="flex items-end gap-2"><span className="text-4xl font-extrabold tabular">{d.health}</span><span className="pb-1 text-sm text-ink-500">/ 100</span></div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-ink-600"><BatteryMedium className="h-4 w-4" />Battery capacity</span><span className="font-semibold tabular">{d.battery}%</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-ink-600"><HeartPulse className="h-4 w-4" />Failure risk (90d)</span><span className={cx("rounded-md px-2 py-0.5 text-xs font-bold", riskTone)}>{label(d.risk)} · {pct(d.failure_probability)}</span></div>
              {d.risk_component && <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-ink-600"><AlertTriangle className="h-4 w-4" />Weakest component</span><span className="font-semibold">{d.risk_component}</span></div>}
            </div>
            {(d.risk === "high" || d.risk === "critical") && (
              <div className="mt-4 rounded-xl bg-orange-50 p-3 text-[13px] text-orange-900"><div className="flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4" />Proactive swap recommended</div><p className="mt-0.5">Schedule a replacement before the {d.risk_component?.toLowerCase()} fails.</p></div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-[15px] font-semibold">Activity</h3>
            {activity.length === 0 ? <div className="text-sm text-ink-500">No recent activity.</div> : (
              <ol className="relative space-y-4 border-l border-ink-200 pl-4">
                {activity.map((a) => (<li key={a.id}><span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-600" /><div className="text-sm font-medium">{a.action}</div><div className="text-xs text-ink-500">{a.actor} · {ago(a.at)}</div></li>))}
              </ol>
            )}
          </Card>
        </div>
      </div>

      <Drawer open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign device" subtitle={`${d.brand} ${d.model} · ${d.asset_tag}`}>
        <Field label="Find a person without a device"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or department" autoFocus /></Field>
        <ul className="mt-4 divide-y divide-ink-100 rounded-xl border border-ink-200">
          {unassigned.length === 0 && <li className="px-4 py-6 text-center text-sm text-ink-500">Everyone matching already has a device.</li>}
          {unassigned.map((x) => (
            <li key={x.id}><button onClick={() => { assignDevice(d.id, x.id); setAssignOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-brand-50">
              <Avatar name={x.name} size={32} /><div className="min-w-0 flex-1"><div className="text-sm font-semibold">{x.name}</div><div className="text-xs text-ink-500">{x.title} · {x.department}</div></div><span className="text-xs font-semibold text-brand-700">Assign</span>
            </button></li>
          ))}
        </ul>
      </Drawer>
    </div>
  );
}
