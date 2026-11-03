# EquipraAfrica · Device-as-a-Service platform

Client portal and marketing site for EquipraAfrica, an enterprise Device-as-a-Service provider for African businesses.

**Stack:** React 18, TypeScript, Vite, Tailwind CSS, Recharts, React Router. Deployed on Vercel.

## Modules

- **Website:** landing page, lifecycle overview, bundle pricing
- **Dashboard:** fleet KPIs, support trend, approvals queue, spend, refresh pipeline
- **Devices:** searchable inventory, CSV export, device detail with lease, health, assignment and history
- **Requests:** bundle catalogue and request wizard, approvals, request history
- **Support:** tickets with live SLA tracking, timeline and status workflow
- **Intelligence:** device health, predictive maintenance, procurement planning, analytics
- **Finance & risk:** insurance claims with analytics, billing and invoices
- **Admin:** users and roles, audit log, company profile and approval policy

Press **Ctrl/Cmd + K** anywhere in the portal for global search.

## Demo data

The app ships with a deterministic, seeded demo dataset (`src/data/seed.ts`) for a fictional client, Zenara Group. All actions (approve requests, log tickets, file claims, assign devices) work and persist in the browser's local storage. Use **Reset demo data** in the sidebar to start fresh.

To connect a real backend, replace the store in `src/data/store.tsx` with API calls; the page components only depend on the store's interface.

## Develop

```bash
npm install
npm run dev
npm run build
```
