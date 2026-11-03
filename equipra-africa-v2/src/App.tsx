import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import DeviceDetail from "./pages/DeviceDetail";
import Requests from "./pages/Requests";
import Tickets from "./pages/Tickets";
import Health from "./pages/Health";
import Predictive from "./pages/Predictive";
import Procurement from "./pages/Procurement";
import Claims from "./pages/Claims";
import Billing from "./pages/Billing";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";

const legacy: Record<string, string> = {
  // Old Base44 URLs (route matching is case-insensitive, so /Dashboard etc. already resolve)
  "/home": "/", "/requesthistory": "/requests?tab=history", "/devicehealth": "/health",
  "/predictivemaintenance": "/predictive", "/insuranceclaims": "/claims", "/claimsanalytics": "/claims?tab=analytics",
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      {Object.entries(legacy).map(([from, to]) => <Route key={from} path={from} element={<Navigate to={to} replace />} />)}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/devices/:id" element={<DeviceDetail />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/health" element={<Health />} />
        <Route path="/predictive" element={<Predictive />} />
        <Route path="/procurement" element={<Procurement />} />
        <Route path="/claims" element={<Claims />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
