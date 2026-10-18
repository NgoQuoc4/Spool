import { createContext, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext<Socket | null>(null);
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { profile } = useAuth();
  const userId = profile?._id;
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!userId || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketInstance = io(
      import.meta.env.VITE_API_URL || "http://localhost:4000",
      {
        auth: {
          id: userId,
          token: token,
        },
        autoConnect: true,
      },
    );
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
