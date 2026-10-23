
import { io } from "socket.io-client";

const getSocketURL = () => {
    if (typeof window !== "undefined" && window.location.hostname) {
        const host = window.location.hostname;
        if (
            host === "localhost" ||
            host === "127.0.0.1" ||
            host.startsWith("192.168.") ||
            host.startsWith("10.") ||
            host.startsWith("172.")
        ) {
            return `${window.location.protocol}//${host}:5005`;
        }
    }
    return process.env.NEXT_PUBLIC_SOCKET_URL || "http://192.168.1.4:5005";
};

export const socket = io(getSocketURL(), {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"]
});
