import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Laptop, PackagePlus, LifeBuoy, HeartPulse, BrainCircuit, ShoppingCart, ShieldCheck, Receipt, BarChart3, Settings2,
  Search, Bell, Menu, X, RotateCcw, LogOut, ChevronDown, Command, CheckCircle2, type LucideIcon,
} from "lucide-react";
import { useStore } from "../data/store";
import { Avatar, cx } from "./ui";
import { ago } from "../lib/format";

type NavItem = { to: string; label: string; icon: LucideIcon; badge?: (n: Counts) => number };
type Counts = { approvals: number; openTickets: number; claims: number };
const NAV: { group: string; items: NavItem[] }[] = [
  { group: "Overview", items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { group: "Fleet", items: [
    { to: "/devices", label: "Devices", icon: Laptop },
    { to: "/requests", label: "Requests", icon: PackagePlus, badge: (c) => c.approvals },
    { to: "/tickets", label: "Support", icon: LifeBuoy, badge: (c) => c.openTickets },
  ] },
  { group: "Intelligence", items: [
    { to: "/health", label: "Device health", icon: HeartPulse },
    { to: "/predictive", label: "Predictive AI", icon: BrainCircuit },
    { to: "/procurement", label: "Procurement", icon: ShoppingCart },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ] },
  { group: "Finance & risk", items: [
    { to: "/claims", label: "Insurance claims", icon: ShieldCheck, badge: (c) => c.claims },
    { to: "/billing", label: "Billing", icon: Receipt },
  ] },
  { group: "Settings", items: [{ to: "/admin", label: "Admin", icon: Settings2 }] },
];

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className={cx("grid h-9 w-9 place-items-center rounded-xl", light ? "bg-white/10" : "bg-ink-900")}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#4FD1C5" strokeWidth="2.2" strokeLinecap="round"><rect x="3.5" y="5" width="17" height="11.5" rx="2" /><path d="M8.5 20h7M12 16.5V20" /></svg>
      </span>
      <span className="leading-none">
        <span className={cx("block text-[15px] font-extrabold tracking-tight", light ? "text-white" : "text-ink-900")}>Equipra<span className="text-brand-500">Africa</span></span>
        <span className={cx("mt-0.5 block text-[10.5px] font-semibold uppercase tracking-[0.14em]", light ? "text-ink-300" : "text-ink-500")}>Device-as-a-Service</span>
      </span>
    </Link>
  );
}

function Sidebar({ onNav }: { onNav?: () => void }) {
  const { db, reset } = useStore();
  const counts: Counts = useMemo(() => ({
    approvals: db.requests.filter((r) => r.status === "pending_approval").length,
    openTickets: db.tickets.filter((t) => t.status === "open" || t.status === "in_progress").length,
    claims: db.claims.filter((c) => c.status === "submitted" || c.status === "under_review").length,
  }), [db]);
  return (
    <div className="flex h-full flex-col bg-ink-900 text-ink-200">
      <div className="px-5 py-5"><Logo light /></div>
      <div className="mx-4 mb-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Client account</div>
        <div className="mt-0.5 flex items-center justify-between text-sm font-semibold text-white">Zenara Group <span className="rounded bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-400">ENTERPRISE</span></div>
      </div>
      <nav className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV.map((g) => (
          <div key={g.group}>
            <div className="px-2 pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-500">{g.group}</div>
            {g.items.map((it) => {
              const b = it.badge?.(counts);
              return (
                <NavLink key={it.to} to={it.to} onClick={onNav}
                  className={({ isActive }) => cx("focus-ring group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition",
                    isActive ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white")}>
                  {({ isActive }) => (<>
                    <it.icon className={cx("h-[18px] w-[18px]", isActive ? "text-brand-400" : "text-ink-400 group-hover:text-ink-200")} />
                    <span className="flex-1">{it.label}</span>
                    {!!b && <span className="rounded-full bg-brand-500/20 px-1.5 text-[11px] font-bold tabular text-brand-400">{b}</span>}
                  </>)}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button onClick={reset} className="focus-ring flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-ink-400 hover:bg-white/5 hover:text-white"><RotateCcw className="h-4 w-4" /> Reset demo data</button>
      </div>
    </div>
  );
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { db, person } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => ref.current?.focus(), 10); } }, [open]);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const pages = NAV.flatMap((g) => g.items).map((i) => ({ kind: "Page", label: i.label, sub: "", to: i.to }));
    if (!s) return pages.slice(0, 8);
    const devs = db.devices.filter((d) => `${d.asset_tag} ${d.brand} ${d.model} ${d.serial} ${person(d.assigned_to)?.name ?? ""}`.toLowerCase().includes(s)).slice(0, 6)
      .map((d) => ({ kind: "Device", label: `${d.asset_tag} · ${d.brand} ${d.model}`, sub: person(d.assigned_to)?.name ?? "Unassigned", to: `/devices/${d.id}` }));
    const tks = db.tickets.filter((t) => `${t.number} ${t.title}`.toLowerCase().includes(s)).slice(0, 4).map((t) => ({ kind: "Ticket", label: `${t.number} · ${t.title}`, sub: t.status.replace("_", " "), to: `/tickets?open=${t.id}` }));
    const ppl = db.people.filter((p) => `${p.name} ${p.email}`.toLowerCase().includes(s)).slice(0, 4).map((p) => ({ kind: "Person", label: p.name, sub: `${p.title} · ${p.department}`, to: `/devices?q=${encodeURIComponent(p.name)}` }));
    return [...pages.filter((p) => p.label.toLowerCase().includes(s)), ...devs, ...tks, ...ppl];
  }, [q, db, person]);
  if (!open) return null;
  const go = (to: string) => { nav(to); onClose(); };
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl animate-rise">
        <div className="flex items-center gap-3 border-b border-ink-100 px-4">
          <Search className="h-4 w-4 text-ink-400" />
          <input ref={ref} value={q} onChange={(e) => { setQ(e.target.value); setSel(0); }} placeholder="Search devices, people, tickets, pages…"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((x) => Math.min(x + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSel((x) => Math.max(x - 1, 0)); }
              if (e.key === "Enter" && results[sel]) go(results[sel].to);
            }}
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-400" />
          <kbd className="rounded-md border border-ink-200 px-1.5 text-[11px] text-ink-500">Esc</kbd>
        </div>
        <ul className="scrollbar-thin max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink-500">No matches for “{q}”</li>}
          {results.map((r, i) => (
            <li key={r.kind + r.to + r.label}>
              <button onMouseEnter={() => setSel(i)} onClick={() => go(r.to)} className={cx("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left", sel === i ? "bg-brand-50" : "")}>
                <span className="w-14 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-ink-400">{r.kind}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-900">{r.label}</span>
                {r.sub && <span className="hidden shrink-0 text-xs text-ink-500 sm:block">{r.sub}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Notifications() {
  const { db, markAllRead } = useStore();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const unread = db.notifications.filter((n) => !n.read).length;
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="Notifications" className="focus-ring relative grid h-10 w-10 place-items-center rounded-xl text-ink-600 hover:bg-ink-100">
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute right-2 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      {open && (<>
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        <div className="absolute right-0 z-50 mt-2 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lift animate-rise">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            <button onClick={markAllRead} className="text-xs font-semibold text-brand-700 hover:underline">Mark all read</button>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {db.notifications.map((n) => (
              <li key={n.id}>
                <button onClick={() => { nav(n.link); setOpen(false); }} className="flex w-full gap-3 px-4 py-3 text-left hover:bg-ink-50">
                  <span className={cx("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-ink-200" : "bg-brand-500")} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink-900">{n.title}</span>
                    <span className="block text-xs text-ink-500">{n.body}</span>
                    <span className="mt-0.5 block text-[11px] text-ink-400">{ago(n.at)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </>)}
    </div>
  );
}

export default function AppLayout() {
  const { me, toasts } = useStore();
  const [mobile, setMobile] = useState(false);
  const [cmd, setCmd] = useState(false);
  const [menu, setMenu] = useState(false);
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmd(true); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block"><Sidebar /></aside>
      {mobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setMobile(false)} />
          <div className="absolute inset-y-0 left-0 w-72 animate-rise">
            <Sidebar onNav={() => setMobile(false)} />
            <button onClick={() => setMobile(false)} aria-label="Close menu" className="absolute right-3 top-6 rounded-lg p-1 text-ink-300 hover:bg-white/10"><X className="h-5 w-5" /></button>
          </div>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-ink-200/70 bg-white/85 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setMobile(true)} aria-label="Open menu" className="focus-ring -ml-1 rounded-lg p-2 text-ink-700 hover:bg-ink-100 lg:hidden"><Menu className="h-5 w-5" /></button>
            <button onClick={() => setCmd(true)} className="focus-ring flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-ink-200 bg-ink-50 px-3 text-left text-sm text-ink-400 hover:border-ink-300 sm:max-w-md">
              <Search className="h-4 w-4 shrink-0" /><span className="truncate">Search devices, people, tickets…</span>
              <span className="ml-auto hidden items-center gap-0.5 rounded-md border border-ink-200 bg-white px-1.5 text-[11px] text-ink-500 sm:flex"><Command className="h-3 w-3" />K</span>
            </button>
            <div className="ml-auto flex items-center gap-1">
              <Notifications />
              <div className="relative">
                <button onClick={() => setMenu((m) => !m)} className="focus-ring flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-ink-100">
                  <Avatar name={me.name} size={32} />
                  <span className="hidden text-left leading-tight md:block"><span className="block text-[13px] font-semibold text-ink-900">{me.name}</span><span className="block text-[11px] text-ink-500">{me.title}</span></span>
                  <ChevronDown className="hidden h-4 w-4 text-ink-400 md:block" />
                </button>
                {menu && (<>
                  <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-ink-200 bg-white p-1.5 shadow-lift animate-rise">
                    <div className="px-3 py-2 text-xs text-ink-500">Signed in as<div className="truncate font-semibold text-ink-900">{me.email}</div></div>
                    <Link to="/admin" onClick={() => setMenu(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-ink-50"><Settings2 className="h-4 w-4 text-ink-500" />Settings</Link>
                    <Link to="/" onClick={() => setMenu(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-ink-50"><LogOut className="h-4 w-4 text-ink-500" />Back to website</Link>
                  </div>
                </>)}
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8"><Outlet /></main>
      </div>
      <CommandPalette open={cmd} onClose={() => setCmd(false)} />
      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="flex items-center gap-2.5 rounded-xl bg-ink-900 px-4 py-3 text-sm font-medium text-white shadow-lift animate-rise"><CheckCircle2 className="h-4 w-4 text-brand-400" />{t.text}</div>
        ))}
      </div>
    </div>
  );
}
