import { Link } from "react-router-dom";
import { ArrowRight, Check, Truck, Wrench, ShieldCheck, RefreshCcw, BrainCircuit, Recycle, Clock, MapPin, Phone, Mail, Laptop } from "lucide-react";
import { Logo } from "../components/Layout";
import { BUNDLES } from "../data/seed";
import { naira } from "../lib/format";

const lifecycle = [
  { icon: Truck, title: "Procure & deliver", body: "Pre-imaged, enrolled and asset-tagged devices delivered to any office in 5 working days." },
  { icon: Wrench, title: "Support & repair", body: "Field technicians in Lagos, Abuja, Port Harcourt, Accra and Nairobi. Hot-swap, not wait." },
  { icon: ShieldCheck, title: "Insure", body: "Theft, liquid and accidental damage cover built into every subscription. Claims filed in-app." },
  { icon: BrainCircuit, title: "Predict", body: "Health telemetry flags failing batteries and drives weeks before they stop your people." },
  { icon: RefreshCcw, title: "Refresh", body: "Every device is replaced on schedule, so your fleet never ages past its warranty." },
  { icon: Recycle, title: "Retire responsibly", body: "Certified data wipe and e-waste recycling, with a disposal certificate for audit." },
];

export default function Landing() {
  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo light />
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink-200 md:flex">
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </nav>
          <Link to="/dashboard" className="focus-ring rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-brand-50">Client portal</Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-ink-950 pb-20 pt-32 text-white sm:pb-28 sm:pt-40">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-600/25 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div className="animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-brand-200">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> Serving teams in Nigeria, Ghana and Kenya
            </div>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Every laptop your team needs.<br /><span className="text-brand-400">None of the headaches.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
              EquipraAfrica supplies, supports, insures and refreshes your company's devices for one predictable monthly fee per employee. No capital outlay, no idle stock, no broken laptops sitting in a drawer.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/dashboard" className="focus-ring inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-semibold text-ink-950 hover:bg-brand-400">Open the client portal <ArrowRight className="h-4 w-4" /></Link>
              <a href="#pricing" className="focus-ring inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3.5 text-sm font-semibold text-white hover:bg-white/5">See pricing</a>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
              {[["99.5%", "Fleet uptime SLA"], ["4 hrs", "Critical response"], ["0", "Capex required"]].map(([v, l]) => (
                <div key={l}><dt className="text-2xl font-bold tabular sm:text-3xl">{v}</dt><dd className="mt-1 text-xs text-ink-400 sm:text-sm">{l}</dd></div>
              ))}
            </dl>
          </div>

          <div className="relative hidden lg:block">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Fleet overview</div>
                <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">All systems healthy</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[["124", "Deployed"], ["98.7%", "SLA met"], ["19", "Refresh due"]].map(([v, l]) => (
                  <div key={l} className="rounded-xl bg-white/5 p-3"><div className="text-xl font-bold tabular">{v}</div><div className="text-[11px] text-ink-400">{l}</div></div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {[["MacBook Pro 14 M3 Pro", "Adaeze Okafor · Engineering", "Healthy"], ["ThinkPad T14 Gen 4", "Kwame Mensah · Sales", "Battery 61%"], ["Latitude 7440", "Fatima Bello · Finance", "Swap scheduled"]].map(([m, u, s], i) => (
                  <div key={m} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/15 text-brand-300"><Laptop className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-semibold">{m}</div><div className="truncate text-[11px] text-ink-400">{u}</div></div>
                    <span className={i === 0 ? "text-[11px] font-semibold text-emerald-300" : i === 1 ? "text-[11px] font-semibold text-amber-300" : "text-[11px] font-semibold text-brand-300"}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-14 -left-8 flex items-center gap-3 rounded-2xl bg-white p-4 text-ink-900 shadow-2xl">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Clock className="h-5 w-5" /></span>
              <div><div className="text-sm font-bold">Replacement delivered</div><div className="text-xs text-ink-500">2h 40m after ticket logged</div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">The whole lifecycle, handled</div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">From the first login to the final data wipe.</h2>
          <p className="mt-4 text-lg text-ink-500">One partner, one portal and one invoice for everything that happens to a company device.</p>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-3">
          {lifecycle.map((s, i) => (
            <div key={s.title} className="bg-white p-7">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-900 text-brand-400"><s.icon className="h-5 w-5" /></span>
                <span className="font-mono text-xs text-ink-300">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-ink-900">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-ink-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Simple per-device pricing</div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">Pick a bundle per role. Change it any time.</h2>
            <p className="mt-4 text-lg text-ink-500">Prices are per device, per month, excluding VAT, on a 36-month term.</p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {BUNDLES.map((b) => {
              const featured = b.cls === "developer";
              return (
                <div key={b.cls} className={featured ? "relative rounded-2xl bg-ink-900 p-8 text-white shadow-lift" : "rounded-2xl border border-ink-200 bg-white p-8"}>
                  {featured && <span className="absolute -top-3 left-8 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-ink-950">Most popular</span>}
                  <h3 className="text-lg font-bold">{b.name}</h3>
                  <p className={featured ? "mt-1 text-sm text-ink-300" : "mt-1 text-sm text-ink-500"}>{b.blurb}</p>
                  <div className="mt-6 flex items-baseline gap-1"><span className="text-4xl font-extrabold tabular">{naira(b.price)}</span><span className={featured ? "text-ink-400" : "text-ink-500"}>/month</span></div>
                  <ul className="mt-7 space-y-3">
                    {b.includes.map((f) => (<li key={f} className="flex gap-3 text-sm"><Check className={featured ? "h-5 w-5 shrink-0 text-brand-400" : "h-5 w-5 shrink-0 text-brand-600"} />{f}</li>))}
                  </ul>
                  <Link to="/requests" className={featured ? "focus-ring mt-8 flex justify-center rounded-xl bg-brand-500 py-3 text-sm font-semibold text-ink-950 hover:bg-brand-400" : "focus-ring mt-8 flex justify-center rounded-xl border border-ink-200 py-3 text-sm font-semibold text-ink-900 hover:bg-ink-50"}>Request {b.name.toLowerCase()} devices</Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 rounded-3xl bg-gradient-to-br from-brand-700 to-ink-900 p-8 text-white sm:p-12 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">See your fleet the way your CFO wants to.</h2>
            <p className="mt-2 max-w-xl text-brand-100">Explore the live demo portal: devices, tickets, approvals, claims, billing and predictive insights.</p>
          </div>
          <Link to="/dashboard" className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-ink-900 hover:bg-brand-50">Explore the demo <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <footer id="contact" className="bg-ink-950 text-ink-300">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div><Logo light /><p className="mt-4 max-w-sm text-sm">Enterprise Device-as-a-Service for modern African businesses. One subscription, total device lifecycle management.</p></div>
          <div className="space-y-3 text-sm">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">Contact</div>
            <div className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-brand-400" />Victoria Island, Lagos, Nigeria</div>
            <div className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-brand-400" />+234 (0) 123 456 7890</div>
            <div className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-brand-400" />hello@equipraafrica.ng</div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">Coverage</div>
            <div>Lagos · Abuja · Port Harcourt</div><div>Accra · Nairobi</div>
          </div>
        </div>
        <div className="border-t border-white/10 py-6 text-center text-xs text-ink-500">© {new Date().getFullYear()} EquipraAfrica. Demo environment with sample data.</div>
      </footer>
    </div>
  );
}
