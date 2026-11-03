import clsx from "clsx";
import { X, ChevronLeft, ChevronRight, Inbox, type LucideIcon } from "lucide-react";
import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { label as fmtLabel } from "../lib/format";

export const cx = clsx;

export function Card({ className, children, ...rest }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("min-w-0 rounded-2xl border border-ink-200/70 bg-white shadow-card", className)} {...rest}>{children}</div>;
}

export function CardHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-ink-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] text-ink-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "dark";
export function Button({ variant = "primary", size = "md", icon: Icon, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md"; icon?: LucideIcon }) {
  return (
    <button
      className={cx(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm",
        variant === "primary" && "bg-brand-600 text-white hover:bg-brand-700",
        variant === "dark" && "bg-ink-900 text-white hover:bg-ink-800",
        variant === "secondary" && "border border-ink-200 bg-white text-ink-800 hover:bg-ink-50",
        variant === "ghost" && "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
        variant === "danger" && "border border-red-200 bg-white text-red-700 hover:bg-red-50",
        className,
      )}
      {...rest}
    >
      {Icon && <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />}
      {children}
    </button>
  );
}

const TONES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  teal: "bg-brand-50 text-brand-800 ring-brand-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/15",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  orange: "bg-orange-50 text-orange-700 ring-orange-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/15",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/15",
  gray: "bg-ink-100 text-ink-600 ring-ink-500/15",
};
const STATUS_TONE: Record<string, string> = {
  deployed: "teal", in_stock: "blue", in_repair: "amber", in_transit: "violet", retired: "gray",
  open: "blue", in_progress: "amber", resolved: "green", closed: "gray",
  pending_approval: "amber", approved: "teal", in_fulfilment: "violet", delivered: "green", rejected: "red",
  submitted: "blue", under_review: "amber", paid: "green",
  low: "gray", medium: "blue", high: "orange", critical: "red",
  due: "amber", overdue: "red",
  admin: "violet", manager: "teal", employee: "gray",
  standard: "gray", developer: "blue", executive: "violet",
};
export function Badge({ children, tone = "gray", dot, className }: { children: ReactNode; tone?: string; dot?: boolean; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset", TONES[tone] ?? TONES.gray, className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}
export function StatusBadge({ value, className }: { value: string; className?: string }) {
  return <Badge tone={STATUS_TONE[value] ?? "gray"} dot className={className}>{fmtLabel(value)}</Badge>;
}

export function Stat({ label, value, sub, icon: Icon, tone = "teal", trend }: { label: string; value: ReactNode; sub?: ReactNode; icon: LucideIcon; tone?: "teal" | "amber" | "red" | "blue" | "violet" | "ink"; trend?: { value: string; good: boolean } }) {
  const t = { teal: "bg-brand-50 text-brand-700", amber: "bg-amber-50 text-amber-700", red: "bg-red-50 text-red-600", blue: "bg-blue-50 text-blue-700", violet: "bg-violet-50 text-violet-700", ink: "bg-ink-100 text-ink-700" }[tone];
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className={cx("grid h-9 w-9 place-items-center rounded-xl", t)}><Icon className="h-[18px] w-[18px]" /></span>
        {trend && <span className={cx("text-xs font-semibold", trend.good ? "text-emerald-700" : "text-red-600")}>{trend.value}</span>}
      </div>
      <div className="mt-3 text-[26px] font-bold leading-none tracking-tight tabular text-ink-900">{value}</div>
      <div className="mt-1.5 text-[13px] font-medium text-ink-700">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-500">{sub}</div>}
    </Card>
  );
}

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: string; subtitle?: ReactNode; actions?: ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">{eyebrow}</div>}
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const field = "focus-ring h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400 hover:border-ink-300";
export const Input = ({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) => <input className={cx(field, className)} {...p} />;
export const Select = ({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) => <select className={cx(field, "pr-8", className)} {...p}>{children}</select>;
export const Textarea = ({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea className={cx(field, "h-auto min-h-[96px] py-2.5", className)} {...p} />;
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
    </label>
  );
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { value: T; label: string; count?: number }[] }) {
  return (
    <div className="scrollbar-thin -mx-1 overflow-x-auto px-1">
      <div className="inline-flex gap-1 rounded-xl bg-ink-100 p-1">
        {items.map((it) => (
          <button key={it.value} onClick={() => onChange(it.value)} className={cx("focus-ring whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-semibold transition", value === it.value ? "bg-white text-ink-900 shadow-card" : "text-ink-500 hover:text-ink-800")}>
            {it.label}
            {it.count !== undefined && <span className={cx("ml-1.5 rounded-full px-1.5 text-[11px] tabular", value === it.value ? "bg-brand-100 text-brand-800" : "bg-ink-200 text-ink-600")}>{it.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, subtitle, children, footer, wide }: { open: boolean; onClose: () => void; title: ReactNode; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-[2px]" onClick={onClose} />
      <div role="dialog" aria-modal className={cx("absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl animate-rise", wide ? "max-w-2xl" : "max-w-lg")}>
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
          <div className="min-w-0">
            <div className="text-lg font-bold text-ink-900">{title}</div>
            {subtitle && <div className="mt-0.5 text-sm text-ink-500">{subtitle}</div>}
          </div>
          <button onClick={onClose} aria-label="Close" className="focus-ring rounded-lg p-1.5 text-ink-500 hover:bg-ink-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-ink-100 bg-ink-50/60 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Empty({ title, body, icon: Icon = Inbox, action }: { title: string; body?: string; icon?: LucideIcon; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-500"><Icon className="h-6 w-6" /></span>
      <div className="mt-3 font-semibold text-ink-800">{title}</div>
      {body && <p className="mt-1 max-w-sm text-sm text-ink-500">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Pager({ page, pages, onPage, total, size }: { page: number; pages: number; onPage: (p: number) => void; total: number; size: number }) {
  if (total === 0) return null;
  return (
    <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3 text-[13px] text-ink-500">
      <span className="tabular">{(page - 1) * size + 1}–{Math.min(page * size, total)} of {total}</span>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const hues = ["#0F9F95", "#2a78d6", "#6250d6", "#eb6834", "#1baf7a", "#d55181"];
  const h = hues[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % hues.length];
  return (
    <span className="grid shrink-0 place-items-center rounded-full font-semibold text-white" style={{ width: size, height: size, background: h, fontSize: size * 0.38 }}>
      {name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
    </span>
  );
}

export function Meter({ value, className }: { value: number; className?: string }) {
  const color = value > 80 ? "var(--good)" : value > 66 ? "#2a78d6" : value > 50 ? "var(--serious)" : "var(--critical)";
  return (
    <div className={cx("flex items-center gap-2", className)}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} /></div>
      <span className="text-xs font-semibold tabular text-ink-700">{value}</span>
    </div>
  );
}

export const TH = ({ children, className }: { children?: ReactNode; className?: string }) => <th className={cx("whitespace-nowrap px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-wider text-ink-500 first:pl-5 last:pr-5", className)}>{children}</th>;
export const TD = ({ children, className }: { children?: ReactNode; className?: string }) => <td className={cx("px-4 py-3 align-middle text-[13.5px] text-ink-700 first:pl-5 last:pr-5", className)}>{children}</td>;

export function DL({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-xs font-medium text-ink-500">{k}</dt>
          <dd className="mt-0.5 truncate text-sm font-semibold text-ink-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
