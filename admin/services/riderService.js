import { getAdminAuthHeaders } from "./adminAuthService";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchRiders() {
  try {
    const res = await fetch(`${API_BASE}/riders`, {
      headers: getAdminAuthHeaders(),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Riders fetch nahi ho paaye");
    }

    if (!Array.isArray(data.riders)) {
      throw new Error("Riders response is invalid");
    }

    // Admin panel ko existing structure ke hisab se map karo
    return data.riders.map((rider) => ({
      id: rider._id,
      name: rider.name,
      phone: rider.phone,
      status: rider.status,
      mission: rider.mission || null,
      dl: rider.dl || null,
      reg: rider.dl || null,
      hub: rider.hub || null,
      vehicle: rider.vehicle || null,
      shift: rider.shift || null,
    }));
  } catch (error) {
    console.error("fetchRiders error:", error);
    throw error;
  }
}