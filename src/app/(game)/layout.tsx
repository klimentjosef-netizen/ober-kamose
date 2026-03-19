"use client";

import { useSocket } from "@/hooks/useSocket";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  // Initialize socket connection for all game pages
  useSocket();
  return <>{children}</>;
}
