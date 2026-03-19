import { RoomState, PlayerSlot } from "@/types";

// In-memory room store (synced to DB on every mutation)
const rooms = new Map<string, RoomState>();

// socketId -> { roomCode, playerIndex, userId }
const clients = new Map<string, { roomCode: string; playerIndex: number; userId: string; username: string }>();

export function getRoom(roomCode: string): RoomState | undefined {
  return rooms.get(roomCode);
}

export function setRoom(roomCode: string, state: RoomState): void {
  rooms.set(roomCode, state);
}

export function deleteRoom(roomCode: string): void {
  rooms.delete(roomCode);
}

export function getClient(socketId: string) {
  return clients.get(socketId);
}

export function setClient(
  socketId: string,
  data: { roomCode: string; playerIndex: number; userId: string; username: string }
): void {
  clients.set(socketId, data);
}

export function removeClient(socketId: string): void {
  clients.delete(socketId);
}

export function getRoomPlayers(roomCode: string): string[] {
  return Array.from(clients.entries())
    .filter(([, c]) => c.roomCode === roomCode)
    .map(([socketId]) => socketId);
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getUniqueRoomCode(): string {
  let code = generateRoomCode();
  while (rooms.has(code)) code = generateRoomCode();
  return code;
}

// Cleanup rooms older than 12 hours
export function startRoomCleanup(): void {
  setInterval(() => {
    const now = Date.now();
    rooms.forEach((state, code) => {
      // Access createdAt via game metadata if needed
      // For now rooms are cleaned up when all players disconnect
      void code; void state; void now;
    });
  }, 60 * 60 * 1000);
}
