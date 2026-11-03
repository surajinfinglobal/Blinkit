import { useState, useEffect } from "react";
import { INITIAL_ORDERS, INITIAL_CUSTOMERS, ORDER_STATUSES } from "../data/adminData";
import { getAllUsers } from "../services/userService";
import { getAllOrders } from "../services/orderService";
import { fetchRiders } from "../services/riderService";
import { updateOrderStatusAPI,assignRiderAPI } from "../services/adminOrderService";

export default function useAdminData(notify) {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [riders, setRiders] = useState([]);
  const [loadingRiders, setLoadingRiders] = useState(true);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);

   useEffect(() => {
    const loadRiders = async () => {
      try {
        setLoadingRiders(true);
        const dbRiders = await fetchRiders();
        setRiders(dbRiders);
      } catch (error) {
        console.error("Failed to load riders from DB", error);
        if (notify) notify("Failed to load riders from DB", "error");
      } finally {
        setLoadingRiders(false);
      }
    };

    loadRiders();
  }, [notify]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        if (Array.isArray(users)) {
          const mapped = users.map((u, idx) => ({
            id: u._id || `U-${idx}`,
            name: u.fullName || u.name || "Unknown",
            gold: false,
            since: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : "N/A",
            phone: u.phone || "",
            email: u.email || "",
            hub: "Hub 04 (Indiranagar)",
            address: u.addresses?.[0]?.line || "",
            ordersNote: "0 lifetime orders",
            orders: 0,
            ltv: 0,
            wallet: 0,
            cohort: "new",
            status: "active"
          }));
          setCustomers(mapped);
        }
      } catch (error) {
        console.error("Failed to load users", error);
        if (notify) notify("Failed to load users from DB", "error");
      }
    };
    fetchUsers();
  }, [notify]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const dbOrders = await getAllOrders();
        if (Array.isArray(dbOrders)) {
          const mapped = dbOrders.map((o, idx) => {
            const items = o.items || [];
            const summary = items.slice(0, 3).map((i) => i.name).join(", ");
            const total = o.billDetails?.grandTotal || 0;
            const mins = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000);
            return {
              id: o.orderId || o._id?.slice(-6).toUpperCase() || `QC-${idx}`,
              dbId: o._id,
              mins: mins < 60 ? mins : Math.floor(mins / 60),
              type: o.paymentMethod === "COD" ? "Standard" : "Express",
              customer: {
                name: o.userId?.fullName || "Customer",
                phone: o.userId?.phone || "",
                address: o.deliveryAddress?.line || "",
              },
              items: items.length,
              summary: summary || (items.length + " items"),
              total: total,
              payment: o.paymentMethod === "COD" ? "Cash on Delivery" : "Online",
              paid: o.paymentStatus === "paid",
              status: ({
                received: "pending",
                pending: "pending",
                packing: "packing",
                out_for_delivery: "in-transit",
                "in-transit": "in-transit",
                delivered: "delivered",
                cancelled: "cancelled",
              })[o.orderStatus || o.status] || "pending",
              riderId: o.assignedRider?._id || o.assignedRider || o.riderId || null,
              eta: null,
            };
          });
          setOrders(mapped);
        }
      } catch (error) {
        console.error("Failed to load orders", error);
        if (notify) notify("Failed to load orders from DB", "error");
      }
    };
    fetchOrders();
  }, [notify]);

  const freeRider = (riderId, delivered = false) =>
    setRiders((prev) =>
      prev.map((r) =>
        r.id === riderId
          ? { ...r, status: "available", mission: null, speed: 0, drops: r.drops + (delivered ? 1 : 0) }
          : r
      )
    );

  const changeOrderStatus = async (id, status) => {
    const order = orders.find((o) => o.id === id);
    if (!order || order.status === status) return;

    try {
      if (order.dbId) {
        await updateOrderStatusAPI(order.dbId, status);
      }
    } catch (error) {
      console.error("Failed to update order status", error);
      notify(error.message || "Order status update failed", "error");
      return;
    }

    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (["delivered", "cancelled"].includes(status) && order.riderId) {
      freeRider(order.riderId, status === "delivered");
    }
    const label = ORDER_STATUSES.find((s) => s.value === status)?.label;
    notify(`#${id} marked as ${label}`, "sync_alt");
  };

  const assignOrderToRider = async (orderId, riderId) => {
    const order = orders.find((entry) => entry.id === orderId);
    const rider = riders.find((entry) => entry.id === riderId);

    if (!order || !order.dbId || ["delivered", "cancelled"].includes(order.status)) {
      notify("Order assignment ke liye available nahi hai", "error");
      return false;
    }

    if (!riderId || !rider) {
      notify("Pehle available rider select karo", "error");
      return false;
    }

    if (order.riderId === riderId) return true;

    const riderIsAlreadyAssigned = orders.some(
      (entry) => entry.id !== orderId && entry.riderId === riderId
    );
    if (rider.status !== "available" || riderIsAlreadyAssigned) {
      notify(`${rider.name} abhi available nahi hai`, "error");
      return false;
    }

    try {
      const updatedOrder = await assignRiderAPI(order.dbId, riderId);
      const assignedRiderId =
        updatedOrder.assignedRider?._id || updatedOrder.assignedRider || riderId;

      setOrders((prev) =>
        prev.map((entry) =>
          entry.id === orderId ? { ...entry, riderId: assignedRiderId } : entry
        )
      );
      setRiders((prev) =>
        prev.map((entry) => {
          if (entry.id === order.riderId && entry.id !== assignedRiderId) {
            return { ...entry, status: "available", mission: null, speed: 0 };
          }
          if (entry.id === assignedRiderId) {
            return { ...entry, status: "in-transit", mission: orderId, speed: 24 };
          }
          return entry;
        })
      );
      notify(`#${orderId} assigned to ${rider.name}`, "electric_moped");
      return true;
    } catch (error) {
      console.error("Failed to assign rider", error);
      notify(error.message || "Rider assignment failed", "error");
      return false;
    }
  };

  const cancelOrder = async (id) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    await changeOrderStatus(id, "cancelled");
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
    orders, riders, customers, loadingRiders,
    changeOrderStatus, cancelOrder, assignOrderToRider, addRider,
    extraRiders: riders.length,
  };
}
