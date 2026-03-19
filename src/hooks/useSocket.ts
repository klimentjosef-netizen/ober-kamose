"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import { useGameStore } from "@/store/gameStore";

let socketInstance: Socket | null = null;

export function useSocket() {
  const { token } = useAuthStore();
  const {
    setRoomState, setMyPlayerIndex, setRoomCode,
    setAvailableMatches, setConnected, addChat, addToast,
  } = useGameStore();

  const initialized = useRef(false);

  useEffect(() => {
    if (!token || initialized.current) return;
    initialized.current = true;

    const socket = io(process.env.NEXT_PUBLIC_APP_URL ?? "", {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("[socket] connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("[socket] disconnected");
    });

    socket.on("joined", (data) => {
      setMyPlayerIndex(data.playerIndex);
      setRoomCode(data.roomCode);
      setRoomState(data.state);
      setAvailableMatches(data.availableMatches ?? []);
    });

    socket.on("state", (data) => {
      setRoomState(data.state);
    });

    socket.on("chat", (msg) => {
      addChat(msg);
    });

    socket.on("toast", (data) => {
      addToast(data.text, data.isError);
    });

    socket.on("error", (data) => {
      addToast(data.text, true);
    });

    socket.on("pong", () => {});

    // Keepalive
    const pingInterval = setInterval(() => {
      if (socket.connected) socket.emit("ping");
    }, 20000);

    return () => {
      clearInterval(pingInterval);
      socket.disconnect();
      socketInstance = null;
      initialized.current = false;
    };
  }, [token]);

  return socketInstance;
}

export function getSocket(): Socket | null {
  return socketInstance;
}
