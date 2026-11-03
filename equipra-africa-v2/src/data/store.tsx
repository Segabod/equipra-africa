import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { buildSeed, CATALOG, type Claim, type DB, type DeviceRequest, type Priority, type Ticket, type TicketStatus, type ClaimStatus, type Person } from "./seed";

const KEY = "equipra-demo-v2";
const MAX_AGE = 7 * 864e5;

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { at: number; db: DB };
      if (Date.now() - parsed.at < MAX_AGE) return parsed.db;
    }
  } catch { /* storage unavailable */ }
  return buildSeed();
}

type Toast = { id: number; text: string };

interface Store {
  db: DB;
  me: Person;
  person: (id: string | null) => Person | undefined;
  toasts: Toast[];
  toast: (text: string) => void;
  decideRequest: (id: string, approve: boolean, note?: string) => void;
  createRequest: (r: Omit<DeviceRequest, "id" | "number" | "status" | "created" | "decided_by" | "decision_note" | "requester" | "department" | "monthly_cost">) => DeviceRequest;
  createTicket: (t: { title: string; description: string; category: string; priority: Priority; device_id: string }) => Ticket;
  updateTicket: (id: string, status: TicketStatus, note?: string) => void;
  createClaim: (c: Omit<Claim, "id" | "number" | "status" | "approved_amount" | "insurer_ref" | "created" | "claimant">) => Claim;
  updateClaim: (id: string, status: ClaimStatus) => void;
  assignDevice: (deviceId: string, personId: string | null) => void;
  setRole: (personId: string, role: Person["role"]) => void;
  markAllRead: () => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(load);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), db })); } catch { /* ignore */ }
  }, [db]);

  const me = db.people[0];
  const nowIso = () => new Date().toISOString();
  const log = (d: DB, action: string, target: string): DB => ({ ...d, audit: [{ id: `a_${Date.now()}`, at: nowIso(), actor: me.name, action, target, detail: "" }, ...d.audit] });

  const toast = useCallback((text: string) => {
    const t = { id: Date.now() + Math.random(), text };
    setToasts((x) => [...x, t]);
    setTimeout(() => setToasts((x) => x.filter((y) => y.id !== t.id)), 3200);
  }, []);

  const peopleIndex = useMemo(() => new Map(db.people.map((p) => [p.id, p])), [db.people]);

  const store: Store = {
    db, me, toasts, toast,
    person: (id) => (id ? peopleIndex.get(id) : undefined),
    decideRequest: (id, approve, note) => {
      setDb((d) => {
        const r = d.requests.find((x) => x.id === id)!;
        return log({ ...d, requests: d.requests.map((x) => x.id === id ? { ...x, status: approve ? "approved" : "rejected", decided_by: me.name, decision_note: note || (approve ? "Approved." : "Declined.") } : x) }, approve ? "Approved request" : "Rejected request", r.number);
      });
      toast(approve ? "Request approved and sent to fulfilment" : "Request rejected");
    },
    createRequest: (input) => {
      const model = CATALOG.find((c) => `${c.brand} ${c.model}` === input.model) ?? CATALOG[0];
      const req: DeviceRequest = { ...input, id: `r_${Date.now()}`, number: `REQ-${2249 + db.requests.length}`, requester: me.id, department: me.department, monthly_cost: model.rate * input.quantity, status: "pending_approval", created: nowIso(), decided_by: null, decision_note: null };
      setDb((d) => log({ ...d, requests: [req, ...d.requests] }, "Created request", req.number));
      toast(`${req.number} submitted for approval`);
      return req;
    },
    createTicket: (input) => {
      const t: Ticket = { ...input, id: `t_${Date.now()}`, number: `TCK-${4885 + db.tickets.length}`, status: "open", reporter: me.id, technician: null, created: nowIso(), resolved: null, sla_hours: input.priority === "critical" ? 4 : input.priority === "high" ? 8 : input.priority === "medium" ? 24 : 48, updates: [{ at: nowIso(), by: me.name, text: "Ticket logged via the Equipra portal." }] };
      setDb((d) => log({ ...d, tickets: [t, ...d.tickets] }, "Created ticket", t.number));
      toast(`${t.number} logged. A technician will respond within ${t.sla_hours}h`);
      return t;
    },
    updateTicket: (id, status, note) => {
      setDb((d) => {
        const t = d.tickets.find((x) => x.id === id)!;
        return log({ ...d, tickets: d.tickets.map((x) => x.id === id ? { ...x, status, technician: x.technician ?? "Kunle Adeyemi", resolved: status === "resolved" || status === "closed" ? nowIso() : null, updates: [...x.updates, { at: nowIso(), by: me.name, text: note || `Status changed to ${status.replace("_", " ")}.` }] } : x) }, "Updated ticket", t.number);
      });
      toast("Ticket updated");
    },
    createClaim: (input) => {
      const c: Claim = { ...input, id: `c_${Date.now()}`, number: `CLM-26-0${135 + db.claims.length}`, claimant: db.devices.find((d) => d.id === input.device_id)?.assigned_to ?? me.id, status: "submitted", approved_amount: 0, insurer_ref: "Pending", created: nowIso() };
      setDb((d) => log({ ...d, claims: [c, ...d.claims] }, "Filed claim", c.number));
      toast(`${c.number} filed with the insurer`);
      return c;
    },
    updateClaim: (id, status) => {
      setDb((d) => log({ ...d, claims: d.claims.map((x) => x.id === id ? { ...x, status, approved_amount: status === "approved" || status === "paid" ? (x.approved_amount || Math.round(x.claim_amount * 0.9)) : x.approved_amount } : x) }, "Updated claim", d.claims.find((x) => x.id === id)!.number));
      toast("Claim updated");
    },
    assignDevice: (deviceId, personId) => {
      setDb((d) => {
        const dev = d.devices.find((x) => x.id === deviceId)!;
        const p = personId ? d.people.find((x) => x.id === personId) : null;
        return log({ ...d, devices: d.devices.map((x) => x.id === deviceId ? { ...x, assigned_to: personId, status: personId ? "deployed" : "in_stock", department: p?.department ?? x.department, location: p?.location ?? x.location } : x) }, personId ? "Assigned device" : "Returned device", dev.asset_tag);
      });
      toast(personId ? "Device assigned" : "Device returned to stock");
    },
    setRole: (personId, role) => {
      setDb((d) => log({ ...d, people: d.people.map((p) => p.id === personId ? { ...p, role } : p) }, "Changed role", d.people.find((p) => p.id === personId)!.name));
      toast("Role updated");
    },
    markAllRead: () => setDb((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) })),
    reset: () => { setDb(buildSeed()); toast("Demo data reset"); },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}
