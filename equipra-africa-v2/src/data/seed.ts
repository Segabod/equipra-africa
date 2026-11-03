import { DAY } from "../lib/format";

export type DeviceStatus = "deployed" | "in_stock" | "in_repair" | "in_transit" | "retired";
export type DeviceClass = "standard" | "developer" | "executive";
export type Risk = "low" | "medium" | "high" | "critical";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type Priority = "low" | "medium" | "high" | "critical";
export type RequestStatus = "pending_approval" | "approved" | "in_fulfilment" | "delivered" | "rejected";
export type ClaimStatus = "submitted" | "under_review" | "approved" | "paid" | "rejected";

export interface Person { id: string; name: string; email: string; department: string; location: string; title: string; role: "admin" | "manager" | "employee"; joined: string }
export interface Device {
  id: string; asset_tag: string; brand: string; model: string; device_class: DeviceClass; serial: string;
  processor: string; ram: string; storage: string; screen: string; os: string;
  status: DeviceStatus; assigned_to: string | null; department: string; location: string; cost_center: string;
  monthly_rate: number; lease_start: string; lease_end: string; warranty_expiry: string;
  health: number; battery: number; risk: Risk; risk_component: string | null; failure_probability: number; created: string;
}
export interface Ticket {
  id: string; number: string; title: string; description: string; category: string; priority: Priority; status: TicketStatus;
  device_id: string; reporter: string; technician: string | null; created: string; resolved: string | null; sla_hours: number;
  updates: { at: string; by: string; text: string }[];
}
export interface DeviceRequest {
  id: string; number: string; requester: string; department: string; request_type: "new_hire" | "replacement" | "upgrade" | "additional";
  device_class: DeviceClass; model: string; quantity: number; accessories: string[]; delivery_location: string; required_by: string;
  monthly_cost: number; status: RequestStatus; justification: string; created: string; decided_by: string | null; decision_note: string | null;
}
export interface Claim {
  id: string; number: string; device_id: string; claimant: string; incident_type: "theft" | "accidental_damage" | "liquid_damage" | "power_surge" | "loss";
  incident_date: string; location: string; description: string; claim_amount: number; approved_amount: number;
  status: ClaimStatus; insurer_ref: string; police_report: string | null; created: string;
}
export interface Invoice { id: string; number: string; period: string; issued: string; due: string; devices: number; subtotal: number; vat: number; total: number; status: "paid" | "due" | "overdue" }
export interface AuditEntry { id: string; at: string; actor: string; action: string; target: string; detail: string }
export interface Notification { id: string; at: string; title: string; body: string; read: boolean; link: string }

export const CATALOG: { brand: string; model: string; cls: DeviceClass; cpu: string; ram: string; storage: string; screen: string; os: string; rate: number }[] = [
  { brand: "Dell", model: "Latitude 7440", cls: "standard", cpu: "Intel Core i7-1365U", ram: "16 GB", storage: "512 GB SSD", screen: '14"', os: "Windows 11 Pro", rate: 38000 },
  { brand: "Dell", model: "Latitude 5540", cls: "standard", cpu: "Intel Core i5-1345U", ram: "16 GB", storage: "256 GB SSD", screen: '15.6"', os: "Windows 11 Pro", rate: 29000 },
  { brand: "HP", model: "EliteBook 840 G10", cls: "standard", cpu: "Intel Core i7-1355U", ram: "16 GB", storage: "512 GB SSD", screen: '14"', os: "Windows 11 Pro", rate: 36000 },
  { brand: "Lenovo", model: "ThinkPad T14 Gen 4", cls: "standard", cpu: "AMD Ryzen 7 PRO 7840U", ram: "16 GB", storage: "512 GB SSD", screen: '14"', os: "Windows 11 Pro", rate: 35000 },
  { brand: "Lenovo", model: "ThinkPad P16s Gen 2", cls: "developer", cpu: "Intel Core i7-1360P", ram: "32 GB", storage: "1 TB SSD", screen: '16"', os: "Ubuntu 24.04 LTS", rate: 52000 },
  { brand: "Apple", model: "MacBook Pro 14 M3 Pro", cls: "developer", cpu: "Apple M3 Pro", ram: "36 GB", storage: "1 TB SSD", screen: '14.2"', os: "macOS Sequoia", rate: 68000 },
  { brand: "HP", model: "ZBook Firefly 16 G10", cls: "developer", cpu: "Intel Core i7-1365U", ram: "32 GB", storage: "1 TB SSD", screen: '16"', os: "Windows 11 Pro", rate: 55000 },
  { brand: "Apple", model: "MacBook Air 15 M3", cls: "executive", cpu: "Apple M3", ram: "16 GB", storage: "512 GB SSD", screen: '15.3"', os: "macOS Sequoia", rate: 48000 },
  { brand: "Dell", model: "XPS 13 9340", cls: "executive", cpu: "Intel Core Ultra 7 155H", ram: "32 GB", storage: "1 TB SSD", screen: '13.4"', os: "Windows 11 Pro", rate: 58000 },
  { brand: "Microsoft", model: "Surface Laptop 6", cls: "executive", cpu: "Intel Core Ultra 7 165H", ram: "32 GB", storage: "512 GB SSD", screen: '15"', os: "Windows 11 Pro", rate: 56000 },
];

export const BUNDLES: { cls: DeviceClass; name: string; price: number; blurb: string; includes: string[] }[] = [
  { cls: "standard", name: "Standard", price: 35000, blurb: "Everyday business laptops for operations, finance and sales teams.", includes: ["Core i5/i7 or Ryzen 7", "16 GB RAM, 512 GB SSD", "Next-business-day swap", "Accidental damage cover", "36-month refresh"] },
  { cls: "developer", name: "Developer", price: 58000, blurb: "Workstation-class machines for engineering, data and design.", includes: ["Apple M3 Pro or Core i7 P-series", "32 GB+ RAM, 1 TB SSD", "4-hour priority support", "Theft and damage cover", "Linux, macOS or Windows image"] },
  { cls: "executive", name: "Executive", price: 54000, blurb: "Premium, ultralight devices with white-glove service.", includes: ["XPS, Surface or MacBook Air", "32 GB RAM", "Concierge onsite support", "Full insurance, no excess", "24-month refresh"] },
];

export const DEPARTMENTS = ["Finance", "Engineering", "Sales", "Operations", "Human Resources", "Marketing", "Legal", "Customer Success", "Executive Office", "IT"];
export const LOCATIONS = ["Lagos · Victoria Island", "Lagos · Ikeja", "Abuja · Wuse II", "Port Harcourt · GRA", "Accra · Airport City", "Nairobi · Westlands"];
export const TECHNICIANS = ["Kunle Adeyemi", "Mary Oduya", "James Kariuki", "Efe Omoregie"];
export const COMPANY = { name: "Zenara Group", industry: "Financial services", hq: "Lagos, Nigeria", plan: "Enterprise · 36-month term", account_manager: "Ifeoma Nwosu", since: "2024" };

export interface DB { people: Person[]; devices: Device[]; tickets: Ticket[]; requests: DeviceRequest[]; claims: Claim[]; invoices: Invoice[]; audit: AuditEntry[]; notifications: Notification[] }

export function buildSeed(): DB {
  let s = 20261103;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(rnd() * a.length)];
  const int = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
  const hex = (n: number) => Array.from({ length: n }, () => "0123456789ABCDEF"[int(0, 15)]).join("");
  const now = Date.now();
  const iso = (t: number) => new Date(t).toISOString();
  let uid = 0; const id = (p: string) => `${p}_${(++uid).toString(36)}`;

  const first = ["Adaeze", "Tunde", "Chidi", "Ngozi", "Kemi", "Emeka", "Funmilayo", "Bola", "Ifeoma", "Yusuf", "Zainab", "Kwame", "Akosua", "Wanjiru", "Otieno", "Fatima", "Ibrahim", "Tolu", "Nneka", "Daniel", "Grace", "Samuel", "Halima", "Chinedu", "Aisha", "Kofi", "Esi", "Musa", "Temitope", "Obinna"];
  const last = ["Okafor", "Adebayo", "Balogun", "Eze", "Mensah", "Kamau", "Odhiambo", "Bello", "Afolabi", "Nwosu", "Danjuma", "Owusu", "Abubakar", "Ogunleye", "Chukwu", "Mwangi", "Asante", "Ibekwe", "Lawal", "Oyelaran"];
  const titles: Record<string, string[]> = {
    Finance: ["Financial Analyst", "Treasury Lead", "Accountant"], Engineering: ["Software Engineer", "Data Engineer", "Engineering Manager"],
    Sales: ["Account Executive", "Sales Lead"], Operations: ["Operations Analyst", "Logistics Lead"], "Human Resources": ["HR Business Partner", "Talent Partner"],
    Marketing: ["Brand Manager", "Growth Marketer"], Legal: ["Legal Counsel"], "Customer Success": ["CS Manager", "Support Lead"],
    "Executive Office": ["Chief Operating Officer", "Chief Financial Officer", "Chief of Staff"], IT: ["IT Administrator", "Service Desk Analyst"],
  };
  const used = new Set<string>();
  const people: Person[] = [];
  people.push({ id: "p_admin", name: "Segun Aboderin", email: "segun.aboderin@zenara.example", department: "IT", location: LOCATIONS[0], title: "Head of IT", role: "admin", joined: iso(now - 700 * DAY) });
  people.push({ id: "p_coo", name: "Ngozi Eze", email: "ngozi.eze@zenara.example", department: "Executive Office", location: LOCATIONS[0], title: "Chief Operating Officer", role: "manager", joined: iso(now - 900 * DAY) });
  while (people.length < 96) {
    const f = pick(first), l = pick(last), key = f + l;
    if (used.has(key)) continue; used.add(key);
    const dept = pick(DEPARTMENTS);
    people.push({ id: id("p"), name: `${f} ${l}`, email: `${f}.${l}@zenara.example`.toLowerCase(), department: dept, location: pick(LOCATIONS), title: pick(titles[dept]), role: rnd() < 0.08 ? "manager" : "employee", joined: iso(now - int(20, 1400) * DAY) });
  }

  const devices: Device[] = [];
  const assignees = [...people];
  for (let i = 0; i < 168; i++) {
    const c = pick(CATALOG);
    const roll = rnd();
    const status: DeviceStatus = roll < 0.74 ? "deployed" : roll < 0.86 ? "in_stock" : roll < 0.94 ? "in_repair" : roll < 0.97 ? "in_transit" : "retired";
    const person = status === "deployed" && assignees.length ? assignees.splice(int(0, assignees.length - 1), 1)[0] : null;
    const startAgo = int(20, 1040);
    const start = now - startAgo * DAY;
    const term = c.cls === "executive" ? 24 : 36;
    const leaseEnd = start + term * 30.4 * DAY;
    const age = startAgo / 1080;
    const health = Math.max(34, Math.min(99, Math.round(99 - age * 26 - rnd() * 16 - (rnd() < 0.07 ? 22 : 0))));
    const risk: Risk = health > 80 ? "low" : health > 66 ? "medium" : health > 50 ? "high" : "critical";
    devices.push({
      id: id("d"), asset_tag: `EQA-${String(10040 + i)}`, brand: c.brand, model: c.model, device_class: c.cls,
      serial: `${c.brand.slice(0, 2).toUpperCase()}${hex(8)}`, processor: c.cpu, ram: c.ram, storage: c.storage, screen: c.screen, os: c.os,
      status, assigned_to: person?.id ?? null, department: person?.department ?? pick(DEPARTMENTS), location: person?.location ?? pick(LOCATIONS),
      cost_center: `CC-${(person?.department ?? "IT").slice(0, 3).toUpperCase()}-0${int(1, 3)}`,
      monthly_rate: c.rate, lease_start: iso(start), lease_end: iso(leaseEnd), warranty_expiry: iso(start + 3 * 365 * DAY),
      health, battery: Math.max(52, Math.round(100 - age * 30 - rnd() * 14)), risk,
      risk_component: risk === "low" ? null : pick(["Battery", "SSD", "Keyboard", "Hinge", "Cooling fan", "Display"]),
      failure_probability: risk === "low" ? 0.03 + rnd() * 0.06 : risk === "medium" ? 0.12 + rnd() * 0.15 : risk === "high" ? 0.32 + rnd() * 0.2 : 0.58 + rnd() * 0.3,
      created: iso(start - int(2, 9) * DAY),
    });
  }
  // A cluster of leases ending in the next 90 days so the refresh pipeline is lively
  devices.filter((d) => d.status === "deployed").slice(0, 19).forEach((d, k) => {
    const end = now + (6 + k * 4.5) * DAY; d.lease_end = iso(end); d.lease_start = iso(end - 36 * 30.4 * DAY);
  });

  const issues: [string, string][] = [
    ["Battery drains in under two hours", "Hardware"], ["Laptop will not power on", "Hardware"], ["Cracked screen after a fall", "Damage"],
    ["Several keys unresponsive", "Hardware"], ["Cannot connect to corporate VPN", "Network"], ["Outlook crashes on launch", "Software"],
    ["Overheating with loud fan noise", "Hardware"], ["Need a docking station for hybrid desk", "Accessory"], ["Wi-Fi drops every few minutes", "Network"],
    ["Blue screen on startup", "Software"], ["Liquid spilled on keyboard", "Damage"], ["Webcam not detected in Teams", "Hardware"],
    ["BitLocker recovery key prompt", "Security"], ["Request admin rights for dev tooling", "Access"], ["External monitor flickers", "Hardware"],
  ];
  const deployed = devices.filter((d) => d.assigned_to);
  const tickets: Ticket[] = [];
  for (let i = 0; i < 112; i++) {
    const d = pick(deployed), [title, category] = pick(issues);
    const createdT = now - (i < 9 ? rnd() * 3 : rnd() * 112) * DAY;
    const ageDays = (now - createdT) / DAY;
    const status: TicketStatus = ageDays < 2 ? pick(["open", "open", "in_progress"] as const) : ageDays < 6 ? pick(["open", "in_progress", "in_progress", "resolved"] as const) : rnd() < 0.03 ? "in_progress" : pick(["resolved", "closed", "closed"] as const);
    const priority: Priority = category === "Damage" ? pick(["high", "critical"] as const) : pick(["low", "medium", "medium", "high"] as const);
    const sla = priority === "critical" ? 4 : priority === "high" ? 8 : priority === "medium" ? 24 : 48;
    const tech = status === "open" ? null : pick(TECHNICIANS);
    const reporter = people.find((p) => p.id === d.assigned_to)!;
    const resolvedT = status === "resolved" || status === "closed" ? createdT + sla * 3600e3 * (0.3 + rnd() * (rnd() < 0.97 ? 0.62 : 1.6)) : null;
    const updates = [{ at: iso(createdT), by: reporter.name, text: "Ticket logged via the Equipra portal." }];
    if (tech) updates.push({ at: iso(createdT + 0.4 * 3600e3), by: tech, text: "Assigned and acknowledged. Reaching out to schedule diagnostics." });
    if (resolvedT) updates.push({ at: iso(resolvedT), by: tech!, text: category === "Damage" || category === "Hardware" ? "Hot-swapped with a loaner from local depot; faulty unit sent for repair." : "Issue resolved remotely and verified with the user." });
    tickets.push({ id: id("t"), number: `TCK-${4810 + 112 - i}`, title, description: `${title}. Reported by ${reporter.name} (${reporter.department}). Device ${d.brand} ${d.model}, ${d.asset_tag}.`, category, priority, status, device_id: d.id, reporter: reporter.id, technician: tech, created: iso(createdT), resolved: resolvedT ? iso(resolvedT) : null, sla_hours: sla, updates });
  }
  tickets.sort((a, b) => b.created.localeCompare(a.created));

  const reqTypes = ["new_hire", "new_hire", "replacement", "upgrade", "additional"] as const;
  const justifications = { new_hire: "Onboarding new joiners starting next month", replacement: "Current devices are past lease and failing health checks", upgrade: "Workload now needs more memory for data tooling", additional: "Second device for field and hybrid work" };
  const requests: DeviceRequest[] = [];
  for (let i = 0; i < 38; i++) {
    const p = pick(people.slice(2)), c = pick(CATALOG), type = pick(reqTypes), qty = type === "new_hire" ? int(2, 12) : int(1, 4);
    const createdT = now - (i < 6 ? rnd() * 4 : rnd() * 150) * DAY;
    const ageDays = (now - createdT) / DAY;
    const status: RequestStatus = ageDays < 5 ? "pending_approval" : ageDays < 12 ? pick(["approved", "in_fulfilment"] as const) : pick(["delivered", "delivered", "delivered", "rejected", "in_fulfilment"] as const);
    requests.push({ id: id("r"), number: `REQ-${2210 + 38 - i}`, requester: p.id, department: p.department, request_type: type, device_class: c.cls, model: `${c.brand} ${c.model}`, quantity: qty,
      accessories: pick([["Docking station"], ["Headset", "Wireless mouse"], [], ['24" monitor', "Docking station"], ["Laptop backpack"]]),
      delivery_location: p.location, required_by: iso(createdT + int(10, 30) * DAY), monthly_cost: c.rate * qty, status, justification: justifications[type], created: iso(createdT),
      decided_by: status === "pending_approval" ? null : "Ngozi Eze", decision_note: status === "rejected" ? "Q4 headcount freeze for this cost centre." : status === "pending_approval" ? null : "Approved within budget." });
  }
  requests.sort((a, b) => b.created.localeCompare(a.created));

  const incidents: [Claim["incident_type"], string][] = [["theft", "Laptop bag stolen from parked car"], ["accidental_damage", "Dropped at the airport, screen shattered"], ["liquid_damage", "Coffee spill during a client meeting"], ["power_surge", "Grid surge damaged the motherboard while charging"], ["loss", "Left behind in a ride-hailing vehicle"]];
  const claims: Claim[] = [];
  for (let i = 0; i < 24; i++) {
    const d = pick(deployed), [type, desc] = pick(incidents);
    const incT = now - (3 + rnd() * 200) * DAY, ageDays = (now - incT) / DAY;
    const amount = int(380, 1950) * 1000;
    const status: ClaimStatus = ageDays < 12 ? pick(["submitted", "under_review"] as const) : ageDays < 30 ? pick(["under_review", "approved"] as const) : pick(["paid", "paid", "paid", "rejected", "approved"] as const);
    claims.push({ id: id("c"), number: `CLM-26-${String(110 + 24 - i).padStart(4, "0")}`, device_id: d.id, claimant: d.assigned_to!, incident_type: type, incident_date: iso(incT), location: d.location, description: desc,
      claim_amount: amount, approved_amount: status === "approved" || status === "paid" ? Math.round(amount * (0.82 + rnd() * 0.18) / 1000) * 1000 : 0, status,
      insurer_ref: `HGI/${int(100000, 999999)}`, police_report: type === "theft" || type === "loss" ? `NPF/${int(1000, 9999)}/26` : null, created: iso(incT + int(0, 2) * DAY) });
  }
  claims.sort((a, b) => b.created.localeCompare(a.created));

  const invoices: Invoice[] = [];
  for (let m = 11; m >= 0; m--) {
    const d = new Date(now); d.setDate(1); d.setMonth(d.getMonth() - m);
    const count = Math.round(118 + (11 - m) * 4.2 + rnd() * 3);
    const subtotal = Math.round(count * 41200 + rnd() * 90000);
    const vat = Math.round(subtotal * 0.075);
    const due = new Date(d); due.setDate(15);
    invoices.push({ id: id("inv"), number: `EQA-INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`, period: d.toISOString(), issued: d.toISOString(), due: due.toISOString(), devices: count, subtotal, vat, total: subtotal + vat, status: m === 0 ? (new Date(now).getDate() > 15 ? "overdue" : "due") : "paid" });
  }
  invoices.reverse();

  const audit: AuditEntry[] = [];
  const acts = ["Assigned device", "Approved request", "Updated ticket", "Returned device", "Filed claim", "Changed role", "Exported report"];
  for (let i = 0; i < 80; i++) {
    const a = pick(acts), d = pick(devices);
    audit.push({ id: id("a"), at: iso(now - rnd() * 45 * DAY), actor: pick(["Segun Aboderin", "Ngozi Eze", "Kunle Adeyemi", "Mary Oduya"]), action: a, target: a.includes("request") ? pick(requests).number : a.includes("ticket") ? pick(tickets).number : a.includes("claim") ? pick(claims).number : a.includes("role") ? pick(people).name : a.includes("report") ? "Fleet inventory (CSV)" : d.asset_tag, detail: "" });
  }
  audit.sort((a, b) => b.at.localeCompare(a.at));

  const pend = requests.filter((r) => r.status === "pending_approval");
  const crit = tickets.find((t) => t.priority === "critical" && t.status !== "closed" && t.status !== "resolved");
  const notifications: Notification[] = [
    { id: id("n"), at: iso(now - 0.4 * 3600e3), title: `${pend.length} requests awaiting approval`, body: "New-hire and replacement requests are queued for your decision.", read: false, link: "/requests?tab=approvals" },
    ...(crit ? [{ id: id("n"), at: iso(now - 2.5 * 3600e3), title: `${crit.number} is critical`, body: crit.title, read: false, link: `/tickets?open=${crit.id}` }] : []),
    { id: id("n"), at: iso(now - 9 * 3600e3), title: "19 leases end within 90 days", body: "Plan refresh orders to avoid out-of-warranty devices.", read: false, link: "/procurement" },
    { id: id("n"), at: iso(now - 30 * 3600e3), title: "Invoice issued", body: `${invoices[0].number} is ready to view.`, read: true, link: "/billing" },
    { id: id("n"), at: iso(now - 70 * 3600e3), title: "Claim payout received", body: "Insurer settled a damage claim.", read: true, link: "/claims" },
  ];

  return { people, devices, tickets, requests, claims, invoices, audit, notifications };
}
