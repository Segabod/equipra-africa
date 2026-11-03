import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, X, PackagePlus, Laptop, Minus, Plus, CheckCircle2 } from "lucide-react";
import { useStore } from "../data/store";
import { BUNDLES, CATALOG, LOCATIONS, type DeviceClass, type DeviceRequest } from "../data/seed";
import { Avatar, Badge, Button, Card, Drawer, DL, Empty, Field, Input, PageHeader, Select, StatusBadge, Tabs, TD, TH, Textarea, cx } from "../components/ui";
import { ago, fmtDate, label, naira } from "../lib/format";

type Tab = "new" | "approvals" | "history";
const ACCESSORIES = ["Docking station", '24" monitor', "Headset", "Wireless mouse", "Laptop backpack", "USB-C hub"];

function NewRequest({ onDone }: { onDone: () => void }) {
  const { createRequest } = useStore();
  const [cls, setCls] = useState<DeviceClass>("standard");
  const models = CATALOG.filter((c) => c.cls === cls);
  const [model, setModel] = useState(`${models[0].brand} ${models[0].model}`);
  const [qty, setQty] = useState(1);
  const [acc, setAcc] = useState<string[]>(["Docking station"]);
  const [type, setType] = useState<DeviceRequest["request_type"]>("new_hire");
  const [loc, setLoc] = useState(LOCATIONS[0]);
  const [date, setDate] = useState(new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10));
  const [why, setWhy] = useState("");
  const chosen = CATALOG.find((c) => `${c.brand} ${c.model}` === model) ?? models[0];
  const monthly = chosen.rate * qty;

  const pickClass = (c: DeviceClass) => { setCls(c); const m = CATALOG.find((x) => x.cls === c)!; setModel(`${m.brand} ${m.model}`); };
  const submit = () => {
    createRequest({ request_type: type, device_class: cls, model, quantity: qty, accessories: acc, delivery_location: loc, required_by: new Date(date).toISOString(), justification: why || "No justification provided" });
    onDone();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Card className="p-5 sm:p-6">
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-ink-500">Step 1 · Choose a bundle</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {BUNDLES.map((b) => (
              <button key={b.cls} onClick={() => pickClass(b.cls)} className={cx("focus-ring rounded-xl border-2 p-4 text-left transition", cls === b.cls ? "border-brand-600 bg-brand-50/60" : "border-ink-200 hover:border-ink-300")}>
                <div className="flex items-center justify-between"><span className="font-bold">{b.name}</span>{cls === b.cls && <CheckCircle2 className="h-5 w-5 text-brand-600" />}</div>
                <div className="mt-1 text-xs text-ink-500">{b.blurb}</div>
                <div className="mt-3 text-sm font-bold tabular">from {naira(Math.min(...CATALOG.filter((c) => c.cls === b.cls).map((c) => c.rate)))}<span className="font-medium text-ink-500">/mo</span></div>
              </button>
            ))}
          </div>
          <div className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-ink-500">Step 2 · Pick a model</div>
          <div className="mt-3 space-y-2">
            {models.map((m) => {
              const key = `${m.brand} ${m.model}`;
              return (
                <label key={key} className={cx("flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition", model === key ? "border-brand-600 bg-brand-50/40 ring-1 ring-brand-600" : "border-ink-200 hover:border-ink-300")}>
                  <input type="radio" name="model" checked={model === key} onChange={() => setModel(key)} className="h-4 w-4 accent-brand-600" />
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-600"><Laptop className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{key}</span><span className="block truncate text-xs text-ink-500">{m.cpu} · {m.ram} · {m.storage} · {m.screen}</span></span>
                  <span className="text-sm font-bold tabular">{naira(m.rate)}<span className="text-xs font-medium text-ink-500">/mo</span></span>
                </label>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-ink-500">Step 3 · Details</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Request type">
              <Select value={type} onChange={(e) => setType(e.target.value as DeviceRequest["request_type"])}>
                <option value="new_hire">New hire</option><option value="replacement">Replacement</option><option value="upgrade">Upgrade</option><option value="additional">Additional device</option>
              </Select>
            </Field>
            <Field label="Quantity">
              <div className="flex h-10 items-center rounded-xl border border-ink-200">
                <button aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-full w-10 place-items-center text-ink-600 hover:bg-ink-50"><Minus className="h-4 w-4" /></button>
                <input value={qty} onChange={(e) => setQty(Math.max(1, Math.min(200, +e.target.value || 1)))} className="h-full flex-1 bg-transparent text-center text-sm font-semibold tabular outline-none" />
                <button aria-label="Increase" onClick={() => setQty((q) => q + 1)} className="grid h-full w-10 place-items-center text-ink-600 hover:bg-ink-50"><Plus className="h-4 w-4" /></button>
              </div>
            </Field>
            <Field label="Deliver to"><Select value={loc} onChange={(e) => setLoc(e.target.value)}>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</Select></Field>
            <Field label="Needed by"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          </div>
          <div className="mt-4">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">Accessories (included)</span>
            <div className="flex flex-wrap gap-2">
              {ACCESSORIES.map((a) => (
                <button key={a} onClick={() => setAcc((x) => x.includes(a) ? x.filter((y) => y !== a) : [...x, a])} className={cx("focus-ring rounded-full border px-3 py-1.5 text-[13px] font-medium", acc.includes(a) ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-600 hover:border-ink-300")}>{acc.includes(a) && "✓ "}{a}</button>
              ))}
            </div>
          </div>
          <div className="mt-4"><Field label="Business justification"><Textarea value={why} onChange={(e) => setWhy(e.target.value)} placeholder="e.g. Three analysts joining the Treasury team on the 1st" /></Field></div>
        </Card>
      </div>

      <div>
        <Card className="sticky top-24 p-5">
          <h3 className="text-[15px] font-semibold">Summary</h3>
          <div className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-ink-500">Device</span><span className="max-w-[60%] text-right font-semibold">{model}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Quantity</span><span className="font-semibold tabular">{qty}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Unit rate</span><span className="font-semibold tabular">{naira(chosen.rate)}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Accessories</span><span className="font-semibold">{acc.length || "None"}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Delivery</span><span className="text-right font-semibold">{loc}</span></div>
          </div>
          <div className="mt-4 border-t border-ink-100 pt-4">
            <div className="flex items-baseline justify-between"><span className="text-sm text-ink-500">Monthly cost</span><span className="text-2xl font-extrabold tabular">{naira(monthly)}</span></div>
            <div className="mt-0.5 text-right text-xs text-ink-500">excl. 7.5% VAT · 36-month term</div>
          </div>
          {qty > 5 && <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">Requests for more than 5 devices need COO approval.</div>}
          <Button className="mt-5 w-full" icon={PackagePlus} onClick={submit}>Submit for approval</Button>
        </Card>
      </div>
    </div>
  );
}

export default function Requests() {
  const { db, person, decideRequest } = useStore();
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) || "approvals";
  const setTab = (t: Tab) => setParams({ tab: t }, { replace: true });
  const [open, setOpen] = useState<DeviceRequest | null>(null);
  const [status, setStatus] = useState("all");
  const [note, setNote] = useState("");
  const pending = db.requests.filter((r) => r.status === "pending_approval");
  const history = useMemo(() => db.requests.filter((r) => status === "all" || r.status === status), [db.requests, status]);
  const live = open ? db.requests.find((r) => r.id === open.id)! : null;

  const decide = (approve: boolean) => { if (!live) return; decideRequest(live.id, approve, note); setNote(""); setOpen(null); };

  const Table = ({ rows }: { rows: DeviceRequest[] }) => rows.length === 0 ? <Empty icon={CheckCircle2} title="Nothing here" body="No requests match this view." /> : (<>
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full">
        <thead className="border-b border-ink-100 bg-ink-50/60"><tr><TH>Request</TH><TH>Requested by</TH><TH>Device</TH><TH>Needed by</TH><TH>Status</TH><TH className="text-right">Monthly</TH>{tab === "approvals" && <TH className="text-right">Decision</TH>}</tr></thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((r) => { const p = person(r.requester)!; return (
            <tr key={r.id} onClick={() => setOpen(r)} className="cursor-pointer hover:bg-ink-50/70">
              <TD><div className="font-mono text-[12.5px] font-medium text-brand-800">{r.number}</div><div className="text-xs text-ink-500">{ago(r.created)}</div></TD>
              <TD><div className="flex items-center gap-2.5"><Avatar name={p.name} size={28} /><div><div className="font-medium text-ink-900">{p.name}</div><div className="text-xs text-ink-500">{r.department}</div></div></div></TD>
              <TD><div className="font-semibold text-ink-900">{r.quantity} × {r.model}</div><div className="text-xs text-ink-500">{label(r.request_type)} · {label(r.device_class)}</div></TD>
              <TD className="tabular">{fmtDate(r.required_by)}</TD>
              <TD><StatusBadge value={r.status} /></TD>
              <TD className="text-right font-semibold tabular text-ink-900">{naira(r.monthly_cost)}</TD>
              {tab === "approvals" && <TD className="text-right"><div className="inline-flex gap-1.5" onClick={(e) => e.stopPropagation()}><Button size="sm" variant="secondary" aria-label="Reject" onClick={() => decideRequest(r.id, false)}><X className="h-4 w-4" /></Button><Button size="sm" icon={Check} onClick={() => decideRequest(r.id, true)}>Approve</Button></div></TD>}
            </tr>
          ); })}
        </tbody>
      </table>
    </div>
    <ul className="divide-y divide-ink-100 md:hidden">
      {rows.map((r) => (
        <li key={r.id}><button onClick={() => setOpen(r)} className="w-full px-4 py-3.5 text-left">
          <div className="flex items-center justify-between gap-2"><span className="font-mono text-xs text-brand-800">{r.number}</span><StatusBadge value={r.status} /></div>
          <div className="mt-1 text-sm font-semibold">{r.quantity} × {r.model}</div>
          <div className="text-xs text-ink-500">{person(r.requester)?.name} · {naira(r.monthly_cost)}/mo</div>
        </button></li>
      ))}
    </ul>
  </>);

  return (
    <div>
      <PageHeader title="Device requests" subtitle="Order devices for new joiners, replacements and upgrades. Approvals route to budget holders automatically." />
      <div className="mb-5"><Tabs value={tab} onChange={setTab} items={[{ value: "approvals", label: "Approvals", count: pending.length }, { value: "history", label: "All requests", count: db.requests.length }, { value: "new", label: "New request" }]} /></div>

      {tab === "new" && <NewRequest onDone={() => setTab("history")} />}
      {tab === "approvals" && <Card><Table rows={pending} /></Card>}
      {tab === "history" && (
        <Card>
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 p-4">
            <span className="text-sm text-ink-500"><span className="font-semibold text-ink-900">{history.length}</span> requests</span>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-48" aria-label="Status">
              <option value="all">All statuses</option>{["pending_approval", "approved", "in_fulfilment", "delivered", "rejected"].map((s) => <option key={s} value={s}>{label(s)}</option>)}
            </Select>
          </div>
          <Table rows={history} />
        </Card>
      )}

      <Drawer open={!!live} onClose={() => setOpen(null)} title={live ? `${live.quantity} × ${live.model}` : ""} subtitle={live ? <span className="font-mono">{live.number}</span> : null}
        footer={live?.status === "pending_approval" ? <><Button variant="danger" icon={X} onClick={() => decide(false)}>Reject</Button><Button icon={Check} onClick={() => decide(true)}>Approve</Button></> : undefined}>
        {live && (
          <div className="space-y-6">
            <div className="flex items-center gap-2"><StatusBadge value={live.status} /><Badge>{label(live.request_type)}</Badge></div>
            <DL items={[["Requested by", person(live.requester)?.name], ["Department", live.department], ["Submitted", fmtDate(live.created)], ["Needed by", fmtDate(live.required_by)], ["Deliver to", live.delivery_location], ["Bundle", label(live.device_class)], ["Monthly cost", naira(live.monthly_cost)], ["Accessories", live.accessories.join(", ") || "None"]]} />
            <div><div className="text-xs font-medium text-ink-500">Justification</div><p className="mt-1 text-sm">{live.justification}</p></div>
            {live.decided_by && <div className="rounded-xl bg-ink-50 p-4 text-sm"><div className="font-semibold">{label(live.status)} by {live.decided_by}</div><div className="text-ink-600">{live.decision_note}</div></div>}
            {live.status === "pending_approval" && <Field label="Decision note (optional)"><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Shared with the requester" /></Field>}
          </div>
        )}
      </Drawer>
    </div>
  );
}
