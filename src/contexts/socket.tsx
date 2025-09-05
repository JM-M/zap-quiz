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

    newSocket.on("connect", () => {
      if (process.env.NODE_ENV === "development") {
        // console.log("Connected to server:", newSocket.id);
      }
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      if (process.env.NODE_ENV === "development") {
        // console.log("Disconnected from server");
      }
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("Connection error:", error);
      }
    });

    // Add debugging for all events
    newSocket.onAny((event, ...args) => {
      if (process.env.NODE_ENV === "development") {
        // console.log("📡 Received event:", event, args);
      }
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
