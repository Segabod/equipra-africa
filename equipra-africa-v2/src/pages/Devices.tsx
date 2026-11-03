import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Download, Laptop, Search, ArrowUpDown, Plus } from "lucide-react";
import { useStore } from "../data/store";
import { Avatar, Button, Card, Empty, Input, Meter, PageHeader, Pager, Select, StatusBadge, TD, TH, Badge, cx } from "../components/ui";
import { DEPARTMENTS } from "../data/seed";
import { daysFromNow, fmtDate, label, naira } from "../lib/format";

const PAGE = 15;
type SortKey = "asset_tag" | "model" | "health" | "lease_end" | "monthly_rate";

export default function Devices() {
  const { db, person } = useStore();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const status = params.get("status") ?? "all";
  const [cls, setCls] = useState("all");
  const [dept, setDept] = useState("all");
  const [sort, setSort] = useState<{ k: SortKey; dir: 1 | -1 }>({ k: "asset_tag", dir: 1 });
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: db.devices.length };
    db.devices.forEach((d) => (c[d.status] = (c[d.status] ?? 0) + 1));
    return c;
  }, [db.devices]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return db.devices
      .filter((d) => status === "all" || d.status === status)
      .filter((d) => cls === "all" || d.device_class === cls)
      .filter((d) => dept === "all" || d.department === dept)
      .filter((d) => !s || `${d.asset_tag} ${d.brand} ${d.model} ${d.serial} ${person(d.assigned_to)?.name ?? ""} ${d.location}`.toLowerCase().includes(s))
      .sort((a, b) => {
        const av = sort.k === "model" ? `${a.brand} ${a.model}` : a[sort.k];
        const bv = sort.k === "model" ? `${b.brand} ${b.model}` : b[sort.k];
        return (av > bv ? 1 : av < bv ? -1 : 0) * sort.dir;
      });
  }, [db.devices, q, status, cls, dept, sort, person]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const view = rows.slice((page - 1) * PAGE, page * PAGE);
  const setStatus = (v: string) => { const p = new URLSearchParams(params); v === "all" ? p.delete("status") : p.set("status", v); setParams(p, { replace: true }); setPage(1); };
  const sortBy = (k: SortKey) => setSort((s) => ({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : 1 }));

  const exportCsv = () => {
    const head = ["Asset tag", "Brand", "Model", "Class", "Serial", "Status", "Assigned to", "Department", "Location", "Monthly rate (NGN)", "Lease end", "Health"];
    const body = rows.map((d) => [d.asset_tag, d.brand, d.model, d.device_class, d.serial, d.status, person(d.assigned_to)?.name ?? "", d.department, d.location, d.monthly_rate, d.lease_end.slice(0, 10), d.health]);
    const csv = [head, ...body].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "equipra-fleet.csv"; a.click();
  };

  const SortTH = ({ k, children, className }: { k: SortKey; children: string; className?: string }) => (
    <TH className={className}><button onClick={() => sortBy(k)} className={cx("inline-flex items-center gap-1 uppercase hover:text-ink-900", sort.k === k && "text-ink-900")}>{children}<ArrowUpDown className="h-3 w-3" /></button></TH>
  );

  return (
    <div>
      <PageHeader title="Devices" subtitle="Every device on your subscription, where it is and how it's doing."
        actions={<><Button variant="secondary" icon={Download} onClick={exportCsv}>Export CSV</Button><Button icon={Plus} onClick={() => nav("/requests?tab=new")}>Request devices</Button></>} />

      <div className="scrollbar-thin mb-4 flex gap-2 overflow-x-auto pb-1">
        {["all", "deployed", "in_stock", "in_repair", "in_transit", "retired"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={cx("focus-ring flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition",
            status === s ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-white text-ink-600 hover:border-ink-300")}>
            {s === "all" ? "All devices" : label(s)}<span className={cx("tabular", status === s ? "text-ink-300" : "text-ink-400")}>{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search asset tag, model, serial, person or location" className="pl-9" />
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex">
            <Select value={cls} onChange={(e) => { setCls(e.target.value); setPage(1); }} className="md:w-40" aria-label="Device class">
              <option value="all">All classes</option><option value="standard">Standard</option><option value="developer">Developer</option><option value="executive">Executive</option>
            </Select>
            <Select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }} className="md:w-48" aria-label="Department">
              <option value="all">All departments</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </div>
        </div>

        {view.length === 0 ? <Empty icon={Laptop} title="No devices match" body="Try clearing a filter or searching for something else." /> : (<>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead className="border-b border-ink-100 bg-ink-50/60"><tr>
                <SortTH k="asset_tag">Asset</SortTH><SortTH k="model">Device</SortTH><TH>Assigned to</TH><TH>Status</TH><SortTH k="health">Health</SortTH><SortTH k="lease_end">Lease ends</SortTH><SortTH k="monthly_rate" className="text-right">Rate</SortTH>
              </tr></thead>
              <tbody className="divide-y divide-ink-100">
                {view.map((d) => {
                  const p = person(d.assigned_to); const days = daysFromNow(d.lease_end);
                  return (
                    <tr key={d.id} onClick={() => nav(`/devices/${d.id}`)} className="cursor-pointer hover:bg-ink-50/70">
                      <TD><Link to={`/devices/${d.id}`} onClick={(e) => e.stopPropagation()} className="font-mono text-[12.5px] font-medium text-brand-800 hover:underline">{d.asset_tag}</Link></TD>
                      <TD><div className="font-semibold text-ink-900">{d.brand} {d.model}</div><div className="text-xs text-ink-500">{d.processor} · {d.ram}</div></TD>
                      <TD>{p ? <div className="flex items-center gap-2.5"><Avatar name={p.name} size={28} /><div><div className="font-medium text-ink-900">{p.name}</div><div className="text-xs text-ink-500">{p.department}</div></div></div> : <span className="text-ink-400">Unassigned</span>}</TD>
                      <TD><StatusBadge value={d.status} /></TD>
                      <TD><Meter value={d.health} /></TD>
                      <TD><div className="tabular">{fmtDate(d.lease_end)}</div>{days > 0 && days < 90 && <Badge tone="amber" className="mt-1">{days}d left</Badge>}</TD>
                      <TD className="text-right font-semibold tabular text-ink-900">{naira(d.monthly_rate)}</TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-ink-100 md:hidden">
            {view.map((d) => (
              <li key={d.id}>
                <Link to={`/devices/${d.id}`} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-600"><Laptop className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink-900">{d.brand} {d.model}</div>
                    <div className="truncate text-xs text-ink-500"><span className="font-mono">{d.asset_tag}</span> · {person(d.assigned_to)?.name ?? "Unassigned"}</div>
                  </div>
                  <StatusBadge value={d.status} />
                </Link>
              </li>
            ))}
          </ul>
          <Pager page={page} pages={pages} onPage={setPage} total={rows.length} size={PAGE} />
        </>)}
      </Card>
    </div>
  );
}
