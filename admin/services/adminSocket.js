import { io } from "socket.io-client";
import { API_BASE_URL } from "../../src/services/apiConfig.js";

const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL;
const fallbackSocketUrl = API_BASE_URL.replace(/\/api\/?$/, "");
export const ADMIN_SOCKET_URL = (configuredSocketUrl || fallbackSocketUrl).replace(/\/+$/, "");

const adminSocket = io(ADMIN_SOCKET_URL, {
  autoConnect: false,
  auth: {},
});

export function connectAdminSocket() {
  const token = localStorage.getItem("adminToken");
  adminSocket.auth = { token };
  if (!adminSocket.connected) adminSocket.connect();
  if (token) adminSocket.emit("join_admin_room", { token });
}

export function disconnectAdminSocket() {
  if (adminSocket.connected) adminSocket.disconnect();
}

adminSocket.on("connect", () => {
  const token = localStorage.getItem("adminToken");
  if (token) adminSocket.emit("join_admin_room", { token });
});

export default adminSocket;
