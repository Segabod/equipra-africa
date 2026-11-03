export const DAY = 864e5;
export const naira = (n: number, compact = false) =>
  compact && Math.abs(n) >= 1e6
    ? `₦${(n / 1e6).toFixed(n >= 1e7 ? 1 : 2).replace(/\.0+$/, "")}M`
    : compact && Math.abs(n) >= 1e3
    ? `₦${Math.round(n / 1e3)}k`
    : `₦${Math.round(n).toLocaleString("en-NG")}`;
export const num = (n: number) => n.toLocaleString("en-NG");
export const pct = (n: number, d = 0) => `${(n * 100).toFixed(d)}%`;
export const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
export const fmtShort = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—";
export const daysFromNow = (iso: string) => Math.round((new Date(iso).getTime() - Date.now()) / DAY);
export const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return fmtDate(iso);
};
export const label = (s: string) => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
export const initials = (name: string) => name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
