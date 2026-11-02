import { useCallback, useState } from "react";
import "./admin-tailwind.css";
import "./admin.css";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AddRiderDrawer from "./components/AddRiderDrawer";
import { ToastProvider, useToast } from "./components/Toast";

import OverviewSection from "./sections/OverviewSection";
import UnifiedOperations from "./sections/UnifiedOperations";
import OrdersSection from "./sections/OrdersSection";
import CustomersSection from "./sections/CustomersSection";
import FleetSection from "./sections/FleetSection";
import InfoSection from "./sections/InfoSection";

import useAdminData from "./hooks/useAdminData";
import useLiveTelemetry from "./hooks/useLiveTelemetry";

function AdminShell() {
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
      case "overview":
        return <OverviewSection onOpenConsole={() => go("unified")} />;
      case "unified":
        return <UnifiedOperations data={data} telemetry={telemetry} externalQuery={globalQuery} onAddRider={openDrawer} onReviewKyc={() => go("fleet")} />;
      case "orders":
        return <OrdersSection standalone data={data} telemetry={telemetry} externalQuery={globalQuery} />;
      case "customers":
        return <CustomersSection standalone data={data} />;
      case "fleet":
        return <FleetSection standalone data={data} telemetry={telemetry} onAddRider={openDrawer} />;
      case "inventory":
      case "analytics":
      case "settings":
        return <InfoSection type={section} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased">
      <Sidebar section={section} onNavigate={onNavigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} hubCap={telemetry.hubCap} />

      <div className="lg:pl-72">
        <Header onMenu={() => setSidebarOpen(true)} onSearch={onGlobalSearch} />
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
  return (
    <ToastProvider>
      <AdminShell />
    </ToastProvider>
  );
}
