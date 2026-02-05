import { DBChat } from "@/types/chat";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface ChatState {
  skippedAuth: boolean;
  isSidebarOpen: boolean;
  isCollapsed: boolean;
  userChats: DBChat[];
  userChatsLoading: boolean;
  setSkippedAuth: (skipped: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  setUserChats: (chats: DBChat[]) => void;
  setUserChatsLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  toggleCollapsed: () => void;
}

export const useChatStore = create<ChatState>()(
  immer((set) => ({
    skippedAuth: false,
    isSidebarOpen: false,
    isCollapsed: false,
    userChats: [],
    userChatsLoading: false,

    setSkippedAuth: (skipped) =>
      set((state) => {
        state.skippedAuth = skipped;
      }),
    setIsSidebarOpen: (open) =>
      set((state) => {
        state.isSidebarOpen = open;
      }),
    setIsCollapsed: (collapsed) =>
      set((state) => {
        state.isCollapsed = collapsed;
      }),
    setUserChats: (chats) =>
      set((state) => {
        state.userChats = chats;
      }),
    setUserChatsLoading: (loading) =>
      set((state) => {
        state.userChatsLoading = loading;
      }),
    toggleSidebar: () =>
      set((state) => {
        state.isSidebarOpen = !state.isSidebarOpen;
      }),
    toggleCollapsed: () =>
      set((state) => {
        state.isCollapsed = !state.isCollapsed;
      }),
  })),
);
