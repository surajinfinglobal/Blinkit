export const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "grid_view" },
  { id: "unified", label: "Unified Operations", icon: "hub" },
  { id: "orders", label: "Orders", icon: "shopping_bag" },
  { id: "customers", label: "Customers", icon: "group" },
  { id: "fleet", label: "Fleet & Riders", icon: "electric_moped" },
  { id: "inventory", label: "Inventory", icon: "inventory_2" },
  { id: "analytics", label: "Analytics", icon: "monitoring" },
  { id: "settings", label: "Settings", icon: "tune" },
];

/* Orders dropdown ki 4 values */
export const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "packing", label: "Packing" },
  { value: "in-transit", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
];

export const STATUS_STYLES = {
  pending: { pill: "bg-error-container text-on-error-container", dot: "bg-error" },
  packing: { pill: "bg-secondary-container text-on-secondary-fixed", dot: "bg-secondary" },
  "in-transit": { pill: "bg-primary-container text-on-primary-container", dot: "bg-on-primary-container" },
  delivered: { pill: "bg-tertiary-container/30 text-on-tertiary-container", dot: "bg-tertiary" },
  cancelled: { pill: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline" },
};

export const RIDER_STATUS = {
  "in-transit": { label: "In Transit", pill: "bg-primary-container text-on-primary-container", dot: "bg-on-primary-container animate-pulse" },
  available: { label: "Available at Pod", pill: "bg-tertiary-container/30 text-on-tertiary-container", dot: "bg-tertiary" },
  break: { label: "On Break", pill: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline" },
};

export const HUBS = [
  "Hub 04 - Indiranagar",
  "Hub 01 - Koramangala",
  "Hub 07 - Whitefield",
  "Hub 09 - HSR Layout",
];

export const SHIFTS = [
  "Morning Peak (6:00 AM - 3:00 PM)",
  "Evening Peak (3:00 PM - 12:00 AM)",
  "Full Day Flexi (9:00 AM - 7:00 PM)",
  "Late Night Surge (10:00 PM - 4:00 AM)",
];

export const VEHICLES = [
  { value: "Ather 450X", label: "Smart EV (Ather/Ola)", icon: "electric_moped" },
  { value: "Petrol Two Wheeler", label: "Petrol Bike (Own)", icon: "two_wheeler" },
  { value: "E-Bicycle", label: "E-Bicycle (Short Drop)", icon: "pedal_bike" },
];

export const INITIAL_RIDERS = [
  { id: "r1", name: "Ravi Kumar", phone: "+91 98440 10294", hub: "Hub 04 - Indiranagar", shift: "Morning Peak (6AM - 3PM)", vehicle: "Ather 450X", reg: "KA-03-EM-9921", battery: 82, speed: 28, status: "in-transit", mission: "QC-8849", drops: 24, earned: 1560 },
  { id: "r2", name: "Manoj Swamy", phone: "+91 97401 55620", hub: "Hub 01 - Koramangala", shift: "Regular (9AM - 6PM)", vehicle: "Ola S1 Air", reg: "KA-04-EX-3021", battery: 95, speed: 0, status: "available", mission: null, drops: 19, earned: 1180 },
  { id: "r3", name: "Gagan Deep", phone: "+91 99120 44819", hub: "Hub 07 - Whitefield", shift: "Morning Peak (6AM - 3PM)", vehicle: "Hero Optima", reg: "KA-51-AB-1190", battery: 44, speed: 0, status: "break", mission: null, drops: 15, earned: 980 },
  { id: "r4", name: "M. Zeeshan", phone: "+91 98860 71234", hub: "Hub 07 - Whitefield", shift: "Evening Peak (3PM - 12AM)", vehicle: "Ola S1 Pro", reg: "KA-05-JL-4412", battery: 71, speed: 0, status: "available", mission: null, drops: 11, earned: 720 },
];

export const INITIAL_ORDERS = [
  { id: "QC-8849", mins: 3, type: "Express", customer: { name: "Ananya Sharma", phone: "+91 98451 22891", address: "12th Main, 4th Cross, Indiranagar" }, items: 6, summary: "Alphonso Mangoes, A2 Milk, Sourdough...", total: 842, payment: "UPI AutoPay", paid: true, status: "in-transit", riderId: "r1", eta: "4m" },
  { id: "QC-8848", mins: 7, type: "Standard", customer: { name: "Vikramaditya Reddy", phone: "+91 97410 88710", address: "Prestige Acropolis, Tower 3, Koramangala" }, items: 12, summary: "Broccoli, Baby Spinach, Avocados...", total: 1940, payment: "Credit Card", paid: false, status: "packing", riderId: null, eta: null },
  { id: "QC-8847", mins: 18, type: "Express", customer: { name: "Priya Nair", gold: true, phone: "+91 99802 33144", address: "Villa 14, Palm Meadows, Whitefield" }, items: 3, summary: "Orange Juice, Croissants, Coffee", total: 465, payment: "Apple Pay", paid: true, status: "delivered", riderId: "r4", eta: null },
  { id: "QC-8846", mins: 22, type: "Rush", customer: { name: "Arjun Menon", phone: "+91 91203 44510", address: "Def Colony, 8th Block, Koramangala" }, items: 4, summary: "Brown Eggs, GF Oats, Almond Milk...", total: 615, payment: "Cash on Delivery", paid: false, status: "pending", riderId: null, eta: null },
  { id: "QC-8845", mins: 26, type: "Standard", customer: { name: "Meera Joshi", phone: "+91 90082 14477", address: "HSR Layout, Sector 2" }, items: 9, summary: "Paneer, Tomatoes, Atta, Curd...", total: 1120, payment: "UPI AutoPay", paid: true, status: "packing", riderId: null, eta: null },
  { id: "QC-8844", mins: 41, type: "Express", customer: { name: "Sandeep Rao", phone: "+91 98450 66120", address: "Whitefield Main Rd" }, items: 2, summary: "Bananas, Brown Bread", total: 380, payment: "UPI AutoPay", paid: true, status: "delivered", riderId: "r4", eta: null },
];

export const INITIAL_CUSTOMERS = [
  { id: "TD-8921", name: "Tanvi Deshmukh", gold: true, since: "Apr 2022", phone: "+91 98200 11928", email: "tanvi.d@gmail.com", hub: "Hub 04 (Indiranagar)", address: "Flat 402, Sunset Apts, 100ft Rd", ordersNote: "84 lifetime orders (1.8/wk)", orders: 84, ltv: 38920, wallet: 1240, cohort: "vip", status: "active" },
  { id: "KB-2190", name: "Kunal Bhatia", since: "Jan 2024", phone: "+91 99014 22100", email: "kunalb@outlook.com", hub: "Hub 01 (Koramangala)", address: "#44, 5th Block, Jyoti Nivas Lane", ordersNote: "14 lifetime orders", orders: 14, ltv: 7450, wallet: 0, cohort: "regular", status: "active" },
  { id: "SI-3310", name: "Sneha Iyer", since: "This week", phone: "+91 98860 12001", email: "sneha.iyer@gmail.com", hub: "Hub 09 (HSR Layout)", address: "27th Main, HSR Sector 2", ordersNote: "2 lifetime orders", orders: 2, ltv: 940, wallet: 100, cohort: "new", status: "active" },
  { id: "RK-5521", name: "Rohit Khurana", since: "Jun 2023", phone: "+91 91081 19933", email: "rohit.k@corpmail.in", hub: "Hub 07 (Whitefield)", address: "Tower B, Brigade Metropolis", ordersNote: "5 returns / cancellations", orders: 8, ltv: 2100, wallet: -180, cohort: "flagged", status: "restricted", note: "3 COD Refusals" },
];

export const INFO_SECTIONS = {
  inventory: {
    eyebrow: "Catalog & Stock",
    title: "Inventory & Stock Management",
    description: "Live stock levels, out-of-stock alerts, and restocking queues across all 6 dark stores.",
    cards: [
      { label: "Total Tracked SKUs", value: "4,850", sub: "Across 18 micro-categories", tone: "muted" },
      { label: "Low Stock Warnings", value: "14 SKUs", sub: "Automated PO generated", tone: "primary" },
      { label: "Critical Stockouts", value: "2 Items", sub: "Supplier re-route active", tone: "error" },
    ],
  },
  analytics: {
    eyebrow: "Telemetry Intelligence",
    title: "Analytics & Performance Intelligence",
    description: "Comprehensive metrics tracking order density, basket size variance, and cohort retention.",
    cards: [
      { label: "Orders / Hour (Peak)", value: "214 / hr", sub: "High demand surge", tone: "tertiary" },
      { label: "Customer Repeat Rate", value: "78.2%", sub: "30-day cohort", tone: "tertiary" },
      { label: "Avg Order Value (AOV)", value: "₹568", sub: "+8.5% YoY", tone: "tertiary" },
    ],
  },
  settings: {
    eyebrow: "System Configuration",
    title: "Operations Configuration & Settings",
    description: "Manage SLA threshold alerts, geofence radius configurations, and dispatch rules.",
    toggles: [
      { id: "auto", title: "Automatic Dispatch Telemetry", desc: "Auto-assign riders within 1.8km radius of dark store", on: true },
      { id: "sla", title: "Strict 10-Minute SLA Timer", desc: "Trigger supervisor escalation at 8:30 elapsed time", on: true },
      { id: "surge", title: "Surge Pricing Alerts", desc: "Notify dispatchers when demand exceeds 200 orders/hr", on: false },
    ],
  },
};
