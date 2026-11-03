import { useMemo, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { useStore } from "../data/store";
import { COMPANY, type Person } from "../data/seed";
import { Avatar, Button, Card, CardHeader, DL, Input, PageHeader, Pager, Select, StatusBadge, Tabs, TD, TH } from "../components/ui";
import { ago, fmtDate } from "../lib/format";

type T = "users" | "audit" | "company";

export default function Admin() {
  const { db, setRole, reset } = useStore();
  const [tab, setTab] = useState<T>("users");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const users = useMemo(() => db.people.filter((p) => `${p.name} ${p.email} ${p.department}`.toLowerCase().includes(q.toLowerCase())), [db.people, q]);
  const view = users.slice((page - 1) * 15, page * 15);
  const deviceOf = (id: string) => db.devices.find((d) => d.assigned_to === id);

  return (
    <div className="space-y-6">
      <PageHeader title="Admin" subtitle="Manage who can use the portal, review every change, and keep company details current." actions={<Button variant="secondary" icon={RotateCcw} onClick={reset}>Reset demo data</Button>} />
      <Tabs value={tab} onChange={setTab} items={[{ value: "users", label: "Users", count: db.people.length }, { value: "audit", label: "Audit log" }, { value: "company", label: "Company" }]} />

      {tab === "users" && (
        <Card>
          <div className="border-b border-ink-100 p-4"><div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search people" className="pl-9" /></div></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-ink-100 bg-ink-50/60"><tr><TH>Person</TH><TH>Department</TH><TH>Device</TH><TH>Joined</TH><TH>Role</TH></tr></thead>
              <tbody className="divide-y divide-ink-100">
                {view.map((p) => { const d = deviceOf(p.id); return (
                  <tr key={p.id}>
                    <TD><div className="flex items-center gap-3"><Avatar name={p.name} size={32} /><div><div className="font-semibold text-ink-900">{p.name}</div><div className="text-xs text-ink-500">{p.email}</div></div></div></TD>
                    <TD><div>{p.department}</div><div className="text-xs text-ink-500">{p.title}</div></TD>
                    <TD>{d ? <span className="whitespace-nowrap">{d.brand} {d.model}</span> : <span className="text-ink-400">None</span>}</TD>
                    <TD className="whitespace-nowrap tabular">{fmtDate(p.joined)}</TD>
                    <TD><Select value={p.role} onChange={(e) => setRole(p.id, e.target.value as Person["role"])} className="h-9 w-32 text-[13px]" aria-label={`Role for ${p.name}`}><option value="admin">Admin</option><option value="manager">Manager</option><option value="employee">Employee</option></Select></TD>
                  </tr>
                ); })}
              </tbody>
            </table>
          </div>
          <Pager page={page} pages={Math.ceil(users.length / 15)} onPage={setPage} total={users.length} size={15} />
        </Card>
      )}

      {tab === "audit" && (
        <Card>
          <ul className="divide-y divide-ink-100">
            {db.audit.slice(0, 40).map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={a.actor} size={30} />
                <div className="min-w-0 flex-1 text-sm"><span className="font-semibold">{a.actor}</span> <span className="text-ink-600">{a.action.toLowerCase()}</span> <span className="font-mono text-[12.5px] text-brand-800">{a.target}</span></div>
                <span className="shrink-0 text-xs text-ink-500">{ago(a.at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "company" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5"><h3 className="mb-4 text-[15px] font-semibold">Company profile</h3><DL items={[["Company", COMPANY.name], ["Industry", COMPANY.industry], ["Headquarters", COMPANY.hq], ["Client since", COMPANY.since], ["Plan", COMPANY.plan], ["Account manager", COMPANY.account_manager]]} /></Card>
          <Card>
            <CardHeader title="Approval policy" subtitle="Who signs off device requests" />
            <ul className="space-y-3 p-5 text-sm">
              {[["Up to 5 standard devices", "Department manager"], ["6 or more devices", "Chief Operating Officer"], ["Executive bundle", "Chief Operating Officer"], ["Replacement after a claim", "Automatic"]].map(([k, v]) => (
                <li key={k} className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3"><span>{k}</span><span className="font-semibold text-ink-900">{v}</span></li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
