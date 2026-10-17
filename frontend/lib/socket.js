
import { io } from "socket.io-client";

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5005";

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"]
});
