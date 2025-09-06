"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined,
);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create socket connection only once
    const newSocket = io(`${SERVER_URL}/game`, {
      transports: ["websocket"],
    });

    let heartbeatInterval: NodeJS.Timeout;

    newSocket.on("connect", () => {
      if (process.env.NODE_ENV === "development") {
        // console.log("Connected to server:", newSocket.id);
      }
      setIsConnected(true);

      // Start heartbeat
      heartbeatInterval = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit("PING");
        }
      }, 10000); // Ping every 10 seconds
    });

    newSocket.on("disconnect", () => {
      if (process.env.NODE_ENV === "development") {
        // console.log("Disconnected from server");
      }
      setIsConnected(false);

      // Clear heartbeat on disconnect
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    });

    newSocket.on("connect_error", (error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("Connection error:", error);
      }
    });

    newSocket.on("PONG", () => {
      // Server responded to our ping
      if (process.env.NODE_ENV === "development") {
        // console.log("Received PONG from server");
      }
    });

    // Add debugging for all events
    newSocket.onAny((event, ...args) => {
      if (process.env.NODE_ENV === "development") {
        // console.log("📡 Received event:", event, args);
      }
    });

    setSocket(newSocket);

    // Handle page unload/refresh
    const handleBeforeUnload = () => {
      // Emit leave events for any active games/lobbies
      if (newSocket.connected) {
        // This will be handled by the useLobby hook's cleanup
        newSocket.disconnect();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
      newSocket.close();
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
