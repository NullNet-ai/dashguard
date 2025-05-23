import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL = "http://datastore.nullnetqa.net";

interface Notification {
  type: string;
  data: string;
  timestamp: string;
}

const useSocketNotifications = (token: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  

  useEffect(() => {
    if (!token) return;

    const newSocket: Socket = io(SOCKET_SERVER_URL, {
      auth: { token },
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      addNotification("System", "Connected to notification server");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      addNotification("System", "Disconnected from notification server");
    });

    newSocket.on("connect_error", (error: {message: string}) => {
      setIsConnected(false);
      addNotification("Error", `Connection failed: ${error.message}`);
    });

    newSocket.on("packet_123-ee1b9a50-51ec-4ecf-bcc2-8f9511f9feb8", (data: Record<string,string>) => {
      addNotification("Database Change", data);
    });

    newSocket.on("new_packet-09b37b11-61be-4fb7-8846-35684eff11d1-09b37b11-61be-4fb7-8846-35684eff11d1e8078103-0c83-4f34-a45d-79baf1baf800", (data: Record<string,string>) => {
      addNotification("Database Change", data);
    });

    newSocket.on("packets_interfaces-dbcc1e63-eed0-4eb3-a181-019fb8c309e4", (data: Record<string,string>) => {
      console.log('%c Line:49 🍇 data', 'color:#2eafb0', data);
      addNotification("Database Change", data);
    });
    

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const addNotification = useCallback((type: string, data: unknown) => {
    const timestamp = new Date().toLocaleTimeString();
    setNotifications((prev) => [
      { type, data: JSON.stringify(data, null, 2), timestamp },
      ...prev,
    ]);
  }, []);

  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [socket]);

  return { notifications, isConnected, disconnectSocket };
};

export default useSocketNotifications;
