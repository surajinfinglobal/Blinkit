import { io } from "socket.io-client";

const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL;
const configuredApiUrl = import.meta.env.VITE_API_URL;
const fallbackSocketUrl = configuredApiUrl
  ? configuredApiUrl.replace(/\/api\/?$/, "")
  : "http://localhost:5000";

export const SOCKET_URL = (
  configuredSocketUrl || fallbackSocketUrl
).replace(/\/+$/, "");

const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem("token"),
  },
});

export function connectSocket() {
  const token = localStorage.getItem("token");
  socket.auth = { token };
  if (!socket.connected) socket.connect();
  if (token) socket.emit("join_user_room", { token });
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}

socket.on("connect", () => {
  const token = localStorage.getItem("token");
  if (token) socket.emit("join_user_room", { token });
});

export default socket;