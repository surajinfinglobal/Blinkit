import { useCallback, useEffect, useState } from "react";
import "./admin-tailwind.css";
import "./admin.css";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AddRiderDrawer from "./components/AddRiderDrawer";
import AdminLogin from "./components/AdminLogin";
import { ToastProvider, useToast } from "./components/Toast";

import Overview from "./sections/Overview";
import OrdersSection from "./sections/OrdersSection";
import CustomersSection from "./sections/CustomersSection";
import FleetSection from "./sections/FleetSection";
import InfoSection from "./sections/InfoSection";

import useAdminData from "./hooks/useAdminData";
import useLiveTelemetry from "./hooks/useLiveTelemetry";
import {
  getAvailableRidersAPI,
  assignRiderAPI,
} from "./services/adminOrderService";
import {
  clearAdminSession,
  getAdminAuthHeaders,
  getCurrentAdmin,
} from "./services/adminAuthService";

function AdminShell({ admin, onLogout }) {
  const notify = useToast();
  const data = useAdminData(notify);
  const telemetry = useLiveTelemetry();

  const [section, setSection] = useState("unified");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState(null);

  const go = useCallback((id) => {
    setSection(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Header search → Orders section me query ke saath
  const onGlobalSearch = (q) => {
    setGlobalQuery(q);
    go("orders");
  };

  // Sidebar se kisi aur section me jaane par global query clear
  const onNavigate = (id) => {
    if (id !== "orders") setGlobalQuery(null);
    go(id);
  };

  const renderSection = () => {
    switch (section) {
      case "unified":
      default:
        return <Overview data={data} telemetry={telemetry} externalQuery={globalQuery} onAddRider={openDrawer} onReviewKyc={() => go("fleet")} />;
      case "orders":
        return <OrdersSection standalone data={data} telemetry={telemetry} externalQuery={globalQuery} />;
      case "customers":
        return <CustomersSection standalone data={data} />;
      case "fleet":
        return <FleetSection standalone data={data} telemetry={telemetry} onAddRider={openDrawer} assignRiderAPI={assignRiderAPI} getAvailableRidersAPI = {getAvailableRidersAPI} />;
      case "inventory":
      case "analytics":
      case "settings":
        return <InfoSection type={section} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased">
      <Sidebar section={section} onNavigate={onNavigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} hubCap={telemetry.hubCap} />

      <div className="lg:pl-72">
        <Header
          admin={admin}
          onLogout={onLogout}
          onMenu={() => setSidebarOpen(true)}
          onSearch={onGlobalSearch}
        />
        <main className="w-full bg-surface px-space-md py-space-lg pt-[88px] lg:px-space-lg">
          {/* key = section → har navigation par smooth enter animation */}
          <div key={section} className="section-in">{renderSection()}</div>
        </main>
      </div>

      <AddRiderDrawer open={drawerOpen} onClose={closeDrawer} onSubmit={data.addRider} />
    </div>
  );
}

export default function AdminPanel() {
  const [admin, setAdmin] = useState(null);
  const [checkingSession, setCheckingSession] = useState(() =>
    Boolean(getAdminAuthHeaders().Authorization)
  );
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    let active = true;

    if (!getAdminAuthHeaders().Authorization) {
      return () => {
        active = false;
      };
    }

    getCurrentAdmin()
      .then((currentAdmin) => {
        if (active) setAdmin(currentAdmin);
      })
      .catch((error) => {
        if (active) setSessionError(error.message);
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const logout = () => {
    clearAdminSession();
    setAdmin(null);
  };

  return (
    <ToastProvider>
      {checkingSession ? (
        <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
          Checking admin session...
        </div>
      ) : admin ? (
        <AdminShell admin={admin} onLogout={logout} />
      ) : (
        <>
          {sessionError && (
            <p role="alert" className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 shadow">
              Admin session verify nahi ho paaya: {sessionError}
            </p>
          )}
          <AdminLogin onSuccess={setAdmin} />
        </>
      )}
    </ToastProvider>
  );
}
