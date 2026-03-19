import { create } from "zustand";
import { RoomState, MatchInfo } from "@/types";

interface GameStore {
  roomState: RoomState | null;
  myPlayerIndex: number | null;
  roomCode: string | null;
  availableMatches: MatchInfo[];
  connected: boolean;
  pendingPickIdx: number | null;
  chatMessages: { username: string; text: string; time: string; playerIndex: number }[];
  toasts: { id: string; text: string; isError: boolean }[];
  setRoomState: (state: RoomState) => void;
  setMyPlayerIndex: (idx: number) => void;
  setRoomCode: (code: string) => void;
  setAvailableMatches: (matches: MatchInfo[]) => void;
  setConnected: (connected: boolean) => void;
  setPendingPick: (idx: number | null) => void;
  addChat: (msg: { username: string; text: string; time: string; playerIndex: number }) => void;
  addToast: (text: string, isError?: boolean) => void;
  removeToast: (id: string) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  roomState: null,
  myPlayerIndex: null,
  roomCode: null,
  availableMatches: [],
  connected: false,
  pendingPickIdx: null,
  chatMessages: [],
  toasts: [],
  setRoomState: (roomState) => set({ roomState }),
  setMyPlayerIndex: (myPlayerIndex) => set({ myPlayerIndex }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setAvailableMatches: (availableMatches) => set({ availableMatches }),
  setConnected: (connected) => set({ connected }),
  setPendingPick: (pendingPickIdx) => set({ pendingPickIdx }),
  addChat: (msg) => set((s) => ({ chatMessages: [...s.chatMessages.slice(-99), msg] })),
  addToast: (text, isError = false) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, text, isError }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  reset: () => set({
    roomState: null, myPlayerIndex: null, roomCode: null,
    availableMatches: [], connected: false, pendingPickIdx: null,
    chatMessages: [], toasts: [],
  }),
}));
