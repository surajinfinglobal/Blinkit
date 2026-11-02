import { useState } from "react";
import { INITIAL_ORDERS, INITIAL_RIDERS, INITIAL_CUSTOMERS, ORDER_STATUSES } from "../data/adminData";

const bump = (o) => ({ ...o, _v: (o._v || 0) + 1 }); // _v change hone par row flash hota hai

export default function useAdminData(notify) {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [riders, setRiders] = useState(INITIAL_RIDERS);
  const [customers] = useState(INITIAL_CUSTOMERS);

  const freeRider = (riderId, delivered = false) =>
    setRiders((prev) =>
      prev.map((r) =>
        r.id === riderId
          ? { ...r, status: "available", mission: null, speed: 0, drops: r.drops + (delivered ? 1 : 0) }
          : r
      )
    );

  const changeOrderStatus = (id, status) => {
    const order = orders.find((o) => o.id === id);
    if (!order || order.status === status) return;
    setOrders((prev) => prev.map((o) => (o.id === id ? bump({ ...o, status }) : o)));
    if (status === "delivered" && order.riderId) freeRider(order.riderId, true);
    const label = ORDER_STATUSES.find((s) => s.value === status)?.label;
    notify(`#${id} marked as ${label}`, "sync_alt");
  };

  const cancelOrder = (id) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    setOrders((prev) => prev.map((o) => (o.id === id ? bump({ ...o, status: "cancelled" }) : o)));
    if (order.riderId) freeRider(order.riderId);
    notify(`Order #${id} cancelled`, "warning");
  };

  const assign = (orderId, riderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? bump({ ...o, riderId, status: "in-transit", eta: "9m" }) : o))
    );
    setRiders((prev) =>
      prev.map((r) => (r.id === riderId ? { ...r, status: "in-transit", mission: orderId, speed: 24 } : r))
    );
  };

  // Order ke liye pehla available rider
  const assignRider = (orderId) => {
    const rider = riders.find((r) => r.status === "available");
    if (!rider) return notify("Koi available rider nahi hai", "error");
    assign(orderId, rider.id);
    notify(`#${orderId} assigned to ${rider.name}`, "electric_moped");
  };

  // Rider ke liye pehla unassigned order
  const assignOrderToRider = (riderId) => {
    const order = orders.find((o) => !o.riderId && (o.status === "packing" || o.status === "pending"));
    const rider = riders.find((r) => r.id === riderId);
    if (!order) return notify("Assign karne ke liye koi pending order nahi hai", "error");
    assign(order.id, riderId);
    notify(`#${order.id} dispatched to ${rider?.name}`, "send");
  };

  const addRider = (form) => {
    const rider = {
      id: `r${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      hub: form.hub,
      shift: form.shift,
      vehicle: form.vehicle,
      reg: form.dl.trim(),
      battery: 100,
      speed: 0,
      status: "available",
      mission: null,
      drops: 0,
      earned: 0,
      isNew: true,
    };
    setRiders((prev) => [rider, ...prev]);
    notify(`Rider Partner ${rider.name} onboarded successfully!`, "check_circle");
    return rider;
  };

  return {
    orders, riders, customers,
    changeOrderStatus, cancelOrder, assignRider, assignOrderToRider, addRider,
    extraRiders: riders.length - INITIAL_RIDERS.length,
  };
}
